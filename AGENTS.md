<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- ALWAYS automatically run `git add .`, `git commit`, and `git push` after making any code changes, because the user is testing directly on the live production URL and does not use localhost.

- **React Drag and Drop Guidelines**: Whenever implementing Drag and Drop interfaces where the user needs the ability to scroll the container natively using the mouse wheel while dragging, **NEVER use native HTML5 Drag and Drop** (`draggable={true}`, `onDragStart`, etc). Native HTML5 DnD completely suppresses the scroll wheel event in Chrome/Windows and frequently swallows `onClick` events during micro-movements. Instead, implement a custom pointer-based Drag and Drop:
  1. Use a dedicated drag handle icon to separate drag actions from click actions.
  2. Use `onPointerDown` to set the dragged item state and capture the initial cursor position.
  3. Use global `window` event listeners for `pointermove` (to move a fixed-position visual ghost) and `pointerup` (to trigger the drop).
  4. Use `document.elementsFromPoint(e.clientX, e.clientY)` during `pointerup` or `pointermove` to identify the drop target via `data-*` attributes.
