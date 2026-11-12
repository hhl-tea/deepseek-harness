# Todo

A Microsoft-To-Do-style task pad for DSH, opened from a row in the left sidebar
and rendered as a full page in the main column.

- **Views.** My day, Important, Planned, and All tasks sit above user lists. My
  day holds the tasks explicitly added to today (the sun button on a row or the
  switch in the detail pane). Important lists starred tasks with the highest
  star level first. Planned groups every dated task and prints overdue dates in
  red.
- **Lists.** Each list carries one of eight preset Apple-system colors, chosen
  in the new-list dialog together with its name; the dialog previews the color
  on a live tile. The color drives the list's rail tile, its active row tint,
  and its task checkmarks. New lists are created from the rail's
  “New list” row, and any list can be deleted from the rail.
- **Tasks.** Inline “add a task” row, circular check-off, a five-star importance
  marker (shown as stars on every row, set in the detail pane), date groups
  (Overdue / Today / Tomorrow / This week / Later / No date), collapsible
  completed section, search, and a detail pane with title, due date, quick date
  chips, list, note, My day, and delete.
- **Calendar.** The detail pane's date control opens a built-in month calendar
  (locale-aware week start, today ring, dots for days that already carry tasks);
  an optional time field stores `HH:mm` beside the date.
- **List passwords.** Any list can be protected from its rail lock button. A
  password is stored in this browser as salt+SHA-256; a locked list hides its
  tasks from the list, the smart views, search, and reminders until it is
  unlocked for the session. This is a privacy screen over local data, not
  encryption.
- **Cleanup.** Completed tasks can be deleted individually (hover the row) or
  all at once; both ask for a second click before removing the record.
- **Reminders.** Every 30 seconds the page looks for tasks due inside the lead
  window (default 3 days, switchable to 1/3/7) or already overdue. It shows an
  in-app banner and, when the browser permission is granted from the bell menu,
  posts one system notification per task per day. Notifications require the page
  to be open.
- **Storage.** Tasks live in this browser under `dsh-todo.board.v2`. The earlier
  memo pad’s `dsh-todo.memos.v1` notes are imported once as personal tasks.

## Files

| File | Purpose |
| --- | --- |
| `package.json` | Bundle manifest, Client entry declaration, display resources. |
| `cordis.patch.yml` | Inserts the `todo-pad` plugin row. |
| `index.js` | Host half; the pad is Client-only, so `apply()` is empty. |
| `client.js` | The whole pad: store, locale copy, sidebar row, page, CSS. |
| `locale/*.json` | Plugin Manager title and description. |
| `icon.svg` | Plugin icon. |

## Local development

The installed bundle is a link to this directory, so the Host’s client HMR
watcher reloads the entry when `client.js` changes; a page refresh is the
fallback. Avoid repeatedly uninstalling and reinstalling the same package —
the Host process can keep a stuck module record and fail to import it.
