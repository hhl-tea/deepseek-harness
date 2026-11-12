/**
 * Host half of the Site nav bundle.
 *
 * Bookmarks are a Client concern: the left-sidebar row, the page, and the
 * `/nav` composer command all render in the browser and keep their data in
 * the page's local storage. No Host service is needed, so this entry only
 * keeps the bundle loadable as a normal plugin row.
 */
export function apply() {}
