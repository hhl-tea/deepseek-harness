# Site nav

Categorized website bookmarks for DSH, opened from a row in the left sidebar.
Picking a bookmarked site opens it in the browser as a new tab; DSH never
renders the site itself.

- **Sidebar page.** The sidebar row opens a full page in the main column: a
  category rail (all sites plus each category, with counts), a search field, and
  a card grid. A card shows the site's favicon — a per-site icon URL, then the
  origin's `apple-touch-icon.png`, `favicon.svg`, or `favicon.ico`, then
  [`favicon.im`](https://favicon.im) for icons a page declares elsewhere, and
  finally a coloured monogram — then its name, address, and note; the whole card
  opens the site, and its hover actions open, edit, or delete it (deletion asks
  for a second click).
- **Categories.** Categories carry an Apple-system accent used for their rail
  dot, card monogram, and card hover border. Any category can be created inline
  in the rail and removed from its rail row. Ten categories ship by default —
  AI (13), Design (18), Productivity (8), Learning (13), Developer (8),
  Research (7), Tools (40), Social (6), 硬件与 PC (Tom's Hardware, dcheck.cn), and
  Trending (Hugging Face Daily Papers, GitHub Trending), 117 sites in all.
  A board saved by an
  older build gains the categories and sites it predates once per board
  version, without touching user edits.
- **Composer trigger.** Typing `/nav` in the DeepSeek input field opens a
  searchable menu of every saved site, grouped under its category. Picking a row
  opens that site in the browser and leaves the draft otherwise untouched — the
  command consumes only its own token and submits nothing.
- **Adding and editing.** The add dialog takes a name, a URL (a bare domain is
  accepted and resolved to `https://`), a category — existing or a new one named
  inline — an optional note, and an optional icon URL for a site whose icon the
  automatic chain cannot find.
- **Storage.** Sites live in this browser under `dsh-sitenav.board.v1`, with an
  internal board version for merging newly shipped categories into an existing
  board. Deletes are immediate; there is no undo.

## Files

| File | Purpose |
| --- | --- |
| `package.json` | Bundle manifest, Client entry declaration, display resources. |
| `cordis.patch.yml` | Inserts the `site-nav` plugin row. |
| `index.js` | Host half; the pad is Client-only, so `apply()` is empty. |
| `client.js` | The whole plugin: store, copy, sidebar row, page, `/nav` command, CSS. |
| `locale/*.json` | Plugin Manager title and description. |
| `icon.svg` | Plugin icon. |

## Local development

The installed bundle is a link to this directory, so the Host's client HMR
watcher reloads the entry when `client.js` changes; a page refresh is the
fallback. Avoid repeatedly uninstalling and reinstalling the same package —
the Host process can keep a stuck module record and fail to import it.
