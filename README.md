# dwnld.in

Paste a link from Instagram, TikTok, X, LinkedIn or YouTube and save the video or photo. Includes an iOS share-sheet Shortcut and an Android share target.

## How it works

```
browser / iOS Shortcut
   │  GET /api/resolve?url=…           (Netlify Function, Node: small JSON, < 10 s)
   ▼
src/lib/extract/*  ── X ........ api.fxtwitter.com (public API)
                   ── TikTok ... tikwm.com (public API, no watermark)
                   ── LinkedIn . public post HTML
                   ── anything else / fallback → your cobalt instance (optional)
   │  returns media list with signed /dl?t=… links
   ▼
GET /dl?t=…  (Netlify Edge Function: streams the file, no size cap)
```

Why the split: Netlify Functions buffer responses and cap them at 6 MB, which broke the old `/api/download`. Edge Functions stream with no size limit and are included in the free plan. `src/app/dl/route.ts` serves the same proxy when running `next dev` or on other hosts.

## Environment variables

| Name | Required | Notes |
|---|---|---|
| `DOWNLOAD_SECRET` | yes (production) | Long random string; signs download links. Set with scope **All** so the edge function sees it. `openssl rand -hex 32` |
| `COBALT_API_URL` | for Instagram, YouTube, Facebook, Reddit, Pinterest | URL of a [cobalt](https://github.com/imputnet/cobalt) instance you run. The public `api.cobalt.tools` is not for third-party use. |
| `COBALT_API_KEY` | if your cobalt instance requires keys | Sent as `Authorization: Api-Key …` |
| `NEXT_PUBLIC_SHORTCUT_ICLOUD_URL` | no | iCloud link to the shared Shortcut; otherwise `/dwnld.shortcut` is used |

## Development

```bash
npm install
npm run dev        # http://localhost:3000 (uses a dev-only secret)
npm run lint
```

## iOS Shortcut

`public/dwnld.shortcut` is generated and signed by `scripts/build-shortcut.py` (macOS, signed in to iCloud):

```bash
python3 scripts/build-shortcut.py --open   # opens "dwnld vN" in Shortcuts
```

To release a version: bump `version` in `shortcut.json`, run the script, add the shortcut, delete the older "dwnld v…" from your library, then Share → Copy iCloud Link and put it in `shortcut.json`. Older versions show an update prompt after their next download.

It calls `GET /api/resolve?format=shortcut&url=…`, which always returns HTTP 200 with either `{ urls: [...] }` or `{ error }`.
