#!/usr/bin/env python3
"""Builds public/dwnld.shortcut, the iOS share-sheet Shortcut.

Flow: Share sheet (any type) → shared media is saved directly; otherwise
URLs in it, else URLs on the clipboard → GET /api/resolve?format=shortcut&v=N
→ show the error, or download every returned URL and save it to Photos, then
→ if the reply carries an "update" notice, offer to open dwnld.in/shortcut.

The version comes from shortcut.json, which the site reads too.

Usage (macOS, signed in to iCloud; iOS only imports signed shortcuts):
    python3 scripts/build-shortcut.py [https://dwnld.in] [--open]

Besides public/dwnld.shortcut it writes "dwnld vN.shortcut" to a temp folder;
Shortcuts names imports after the file, so each version is easy to tell apart.
--open imports that copy into the Shortcuts app.
"""

import json
import plistlib
import shutil
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
BASE_URL = (ARGS[0] if ARGS else "https://dwnld.in").rstrip("/")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "dwnld.shortcut"
VERSION = json.loads((ROOT / "shortcut.json").read_text())["version"]
OBJ = "￼"  # Shortcuts' placeholder character for an inline variable


def new_id() -> str:
    return str(uuid.uuid4()).upper()


def output(action_uuid: str, name: str) -> dict:
    return {"Type": "ActionOutput", "OutputUUID": action_uuid, "OutputName": name}


def attachment(var: dict) -> dict:
    return {"Value": var, "WFSerializationType": "WFTextTokenAttachment"}


def text(template: str, var: dict) -> dict:
    """A text field with one inline variable at the position of OBJ."""
    pos = template.index(OBJ)
    return {
        "Value": {"string": template, "attachmentsByRange": {f"{{{pos}, 1}}": var}},
        "WFSerializationType": "WFTextTokenString",
    }


def text_n(template: str, *variables: dict) -> dict:
    """A text field with one inline variable per OBJ, in order."""
    ranges, start = {}, 0
    for var in variables:
        pos = template.index(OBJ, start)
        ranges[f"{{{pos}, 1}}"] = var
        start = pos + 1
    return {"Value": {"string": template, "attachmentsByRange": ranges}, "WFSerializationType": "WFTextTokenString"}


def save_input_if(kind_uuid: str, contains: str) -> list:
    """If the shared item's type contains `contains`, save it to Photos and stop."""
    group = new_id()
    return [
        action(
            "conditional",
            GroupingIdentifier=group,
            WFControlFlowMode=0,
            WFCondition=99,  # "contains"
            WFConditionalActionString=contains,
            WFInput={"Type": "Variable", "Variable": attachment(output(kind_uuid, "Type"))},
        ),
        action("savetocameraroll", WFInput=attachment({"Type": "ExtensionInput"})),
        action("notification", WFNotificationActionTitle="dwnld", WFNotificationActionBody="Saved to Photos ✓"),
        action("exit"),
        action("conditional", GroupingIdentifier=group, WFControlFlowMode=2, UUID=new_id()),
    ]


def action(identifier: str, **params) -> dict:
    return {"WFWorkflowActionIdentifier": f"is.workflow.actions.{identifier}", "WFWorkflowActionParameters": params}


urls, kind, kind_encoded, name, name_encoded, raw_encoded, clipboard, clip_urls, encoded, resolved, error, media, item, update = (
    new_id() for _ in range(14)
)
link_group, if_group, repeat_group, update_group = new_id(), new_id(), new_id(), new_id()
LINK = {"Type": "Variable", "VariableName": "link"}

actions = [
    # Like YAS: take any share-sheet input, pull URLs out of it, and fall back
    # to URLs on the clipboard. Some apps (X's video player) share the media
    # itself rather than a link, so save that directly.
    action("detect.link", UUID=urls, WFInput=attachment({"Type": "ExtensionInput"})),
    action("getitemtype", UUID=kind, WFInput=attachment({"Type": "ExtensionInput"})),
    action("getitemname", UUID=name, WFInput=attachment({"Type": "ExtensionInput"})),
    *save_input_if(kind, "Media"),
    *save_input_if(kind, "Image"),
    action(
        "conditional",
        GroupingIdentifier=link_group,
        WFControlFlowMode=0,
        WFCondition=100,  # "has any value"
        WFInput={"Type": "Variable", "Variable": attachment(output(urls, "URLs"))},
    ),
    action("setvariable", WFVariableName="link", WFInput=attachment(output(urls, "URLs"))),
    action("conditional", GroupingIdentifier=link_group, WFControlFlowMode=1),
    action("getclipboard", UUID=clipboard),
    # Only URLs: a non-text clipboard item would otherwise turn into its name.
    action("detect.link", UUID=clip_urls, WFInput=attachment(output(clipboard, "Clipboard"))),
    action("setvariable", WFVariableName="link", WFInput=attachment(output(clip_urls, "URLs"))),
    action("conditional", GroupingIdentifier=link_group, WFControlFlowMode=2, UUID=new_id()),
    # The server finds the first link in whatever text arrives; "type" says
    # what the app shared, so errors can explain failures.
    action("urlencode", UUID=encoded, WFInput=text(OBJ, LINK)),
    action("urlencode", UUID=kind_encoded, WFInput=text(OBJ, output(kind, "Type"))),
    # "Get URLs" finds nothing in some apps' items (X shares a URL item it
    # extracts as empty), so also send the item as plain text and its name.
    action("urlencode", UUID=raw_encoded, WFInput=text(OBJ, {"Type": "ExtensionInput"})),
    action("urlencode", UUID=name_encoded, WFInput=text(OBJ, output(name, "Name"))),
    action(
        "downloadurl",
        UUID=resolved,
        WFHTTPMethod="GET",
        WFURL=text_n(
            f"{BASE_URL}/api/resolve?format=shortcut&v={VERSION}&type={OBJ}&name={OBJ}&text={OBJ}&url={OBJ}",
            output(kind_encoded, "URL Encoded Text"),
            output(name_encoded, "URL Encoded Text"),
            output(raw_encoded, "URL Encoded Text"),
            output(encoded, "URL Encoded Text"),
        ),
    ),
    action("getvalueforkey", UUID=error, WFDictionaryKey="error", WFInput=attachment(output(resolved, "Contents of URL"))),
    action(
        "conditional",
        GroupingIdentifier=if_group,
        WFControlFlowMode=0,
        WFCondition=100,  # "has any value"
        WFInput={"Type": "Variable", "Variable": attachment(output(error, "Dictionary Value"))},
    ),
    action(
        "alert",
        WFAlertActionTitle="Couldn’t download",
        WFAlertActionMessage=text(OBJ, output(error, "Dictionary Value")),
        WFAlertActionCancelButtonShown=False,
    ),
    action("exit"),
    action("conditional", GroupingIdentifier=if_group, WFControlFlowMode=2, UUID=new_id()),
    action("getvalueforkey", UUID=media, WFDictionaryKey="urls", WFInput=attachment(output(resolved, "Contents of URL"))),
    action(
        "repeat.each",
        GroupingIdentifier=repeat_group,
        WFControlFlowMode=0,
        WFInput=attachment(output(media, "Dictionary Value")),
    ),
    action("downloadurl", UUID=item, WFURL=text(OBJ, {"Type": "Variable", "VariableName": "Repeat Item"})),
    action("savetocameraroll", WFInput=attachment(output(item, "Contents of URL"))),
    action("repeat.each", GroupingIdentifier=repeat_group, WFControlFlowMode=2, UUID=new_id()),
    action("notification", WFNotificationActionTitle="dwnld", WFNotificationActionBody="Saved to Photos ✓"),
    # The server says when this version is out of date.
    action("getvalueforkey", UUID=update, WFDictionaryKey="update", WFInput=attachment(output(resolved, "Contents of URL"))),
    action(
        "conditional",
        GroupingIdentifier=update_group,
        WFControlFlowMode=0,
        WFCondition=100,
        WFInput={"Type": "Variable", "Variable": attachment(output(update, "Dictionary Value"))},
    ),
    action(
        "alert",
        WFAlertActionTitle="Update available",
        WFAlertActionMessage=text(OBJ, output(update, "Dictionary Value")),
        WFAlertActionCancelButtonShown=True,
    ),
    action(
        "openurl",
        WFInput={"Value": {"string": f"{BASE_URL}/shortcut", "attachmentsByRange": {}}, "WFSerializationType": "WFTextTokenString"},
    ),
    action("conditional", GroupingIdentifier=update_group, WFControlFlowMode=2, UUID=new_id()),
]

shortcut = {
    "WFWorkflowClientVersion": "2302.0.4",
    "WFWorkflowMinimumClientVersion": 900,
    "WFWorkflowMinimumClientVersionString": "900",
    "WFWorkflowIcon": {"WFWorkflowIconStartColor": 4251333119, "WFWorkflowIconGlyphNumber": 59511},
    "WFWorkflowTypes": ["ActionExtension"],
    # Every input type, as YAS does: restricting to URL/Text made iOS hand
    # the Shortcut nothing when X shared a post.
    "WFWorkflowInputContentItemClasses": [
        "WFAppStoreAppContentItem",
        "WFArticleContentItem",
        "WFContactContentItem",
        "WFDateContentItem",
        "WFEmailAddressContentItem",
        "WFFolderContentItem",
        "WFGenericFileContentItem",
        "WFImageContentItem",
        "WFiTunesProductContentItem",
        "WFLocationContentItem",
        "WFDCMapsLinkContentItem",
        "WFAVAssetContentItem",
        "WFPDFContentItem",
        "WFPhoneNumberContentItem",
        "WFRichTextContentItem",
        "WFSafariWebPageContentItem",
        "WFStringContentItem",
        "WFURLContentItem",
    ],
    "WFWorkflowHasShortcutInputVariables": True,
    "WFWorkflowNoInputBehavior": {"Name": "WFWorkflowNoInputBehaviorGetClipboard", "Parameters": {}},
    "WFWorkflowOutputContentItemClasses": [],
    "WFWorkflowImportQuestions": [],
    "WFQuickActionSurfaces": [],
    "WFWorkflowActions": actions,
}

with tempfile.TemporaryDirectory() as tmp:
    unsigned = Path(tmp) / "dwnld.shortcut"
    with unsigned.open("wb") as f:
        plistlib.dump(shortcut, f, fmt=plistlib.FMT_BINARY)
    subprocess.run(["shortcuts", "sign", "--mode", "anyone", "--input", str(unsigned), "--output", str(OUT)], check=True)

named = Path(tempfile.gettempdir()) / f"dwnld v{VERSION}.shortcut"
shutil.copyfile(OUT, named)
print(f"wrote {OUT} (v{VERSION}, {OUT.stat().st_size} bytes) for {BASE_URL}")
print(f"import copy: {named}")
if "--open" in sys.argv:
    subprocess.run(["open", "-a", "Shortcuts", str(named)], check=True)
