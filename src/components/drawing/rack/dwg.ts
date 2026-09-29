/** Sheet 01's drawing id (defs, tabs, parts). Kept apart from ./model so the client script
 *  (./rack.ts) can import it without bundling the data model.ts is built from. */
export const DWG = 'lab01';

/** The off-sheet callout (the U7 Pro) in the sheet's top-right corner, paper units; the views
 *  run their PoE line to its bottom edge. */
export const OFF_SHEET = { x: 628, y: 72, w: 196, h: 50 };
