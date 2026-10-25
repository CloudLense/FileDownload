#!/usr/bin/env python3
"""Builds public/dwnld.shortcut, the iOS share-sheet Shortcut.

Flow: Share sheet (or clipboard) → first URL → GET /api/resolve?format=shortcut&v=N
→ show the error, or download every returned URL and save it to Photos, then
→ if the reply carries an "update" notice, offer to open dwnld.in/shortcut.

The version comes from shortcut.json, which the site reads too.

Usage (macOS, signed in to iCloud; iOS only imports signed shortcuts):
    python3 scripts/build-shortcut.py [https://dwnld.in]
"""

import json
import plistlib
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else "https://dwnld.in").rstrip("/")
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


def action(identifier: str, **params) -> dict:
    return {"WFWorkflowActionIdentifier": f"is.workflow.actions.{identifier}", "WFWorkflowActionParameters": params}


urls, first, encoded, resolved, error, media, item, update = (new_id() for _ in range(8))
if_group, repeat_group, update_group = new_id(), new_id(), new_id()

actions = [
    action("detect.link", UUID=urls, WFInput=attachment({"Type": "ExtensionInput"})),
    action("getitemfromlist", UUID=first, WFItemSpecifier="First Item", WFInput=attachment(output(urls, "URLs"))),
    action("urlencode", UUID=encoded, WFInput=text(OBJ, output(first, "Item from List"))),
    action(
        "downloadurl",
        UUID=resolved,
        WFHTTPMethod="GET",
        WFURL=text(f"{BASE_URL}/api/resolve?format=shortcut&v={VERSION}&url={OBJ}", output(encoded, "URL Encoded Text")),
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
    "WFWorkflowInputContentItemClasses": ["WFURLContentItem", "WFStringContentItem"],
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

print(f"wrote {OUT} (v{VERSION}, {OUT.stat().st_size} bytes) for {BASE_URL}")
