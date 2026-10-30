# BeepBite — Design in SVG

Every BeepBite screen and state as an SVG file, ready for Figma. Shapes, colours and text stay editable: nothing is a flat picture.

## Open it in Figma

1. Install the two fonts from Google Fonts on your computer, or check that Figma lists them: **Bricolage Grotesque** and **Caveat**.
2. In Figma, create a new design file.
3. Drag a whole folder of SVGs (or all of them) onto the canvas. Each file becomes a frame named after the file.
4. Select all the new frames and use **Tidy up** to line them up in a grid.

The files use plain SVG features Figma supports (no `<foreignObject>`, no clip paths), so text arrives as text layers and the logo arrives as vector paths.




## Updating

These files are generated from the live screens. After a design change, inside `ui-design/`:

```bash
npm install     # first time only
npm run svg
```

The tool lives in [`tools/export-svg.ts`](../tools/export-svg.ts) and needs Chrome or Edge installed. It rewrites the SVGs in the area folders and leaves this README alone.
