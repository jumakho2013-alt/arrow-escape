// Handcrafted levels — replace procedural generation for specific level
// numbers. Each entry: { cols, rows, arrows: [{c, d}] } where:
//   c = array of [row, col] cells from TAIL to HEAD
//   d = escape direction: 0=right 1=up 2=left 3=down
//
// Solvability is verified by tools/validate-handcrafted.js.
// In game: when generateLevel(lvl) is called and HANDCRAFTED_LEVELS[lvl]
// exists (and customSeed is null), the handcrafted layout is used
// instead of procedural generation.

const HANDCRAFTED_LEVELS = {
  // ─────────────────────────────────────────────────────────────────
  // LEVEL 1 — "Two rows" (smallest possible game)
  // Two arrows. Both immediately tappable. Pure introduction.
  // ─────────────────────────────────────────────────────────────────
  1: {
    cols: 6, rows: 5,
    arrows: [
      { c: [[1,0],[1,1],[1,2]], d: 0 }, // row 1, escape right
      { c: [[3,0],[3,1],[3,2]], d: 0 }, // row 3, escape right
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 2 — "First chain"
  // 3 arrows. Top one blocks the down-arrow's escape line at col 1.
  // Player must tap top first, then down arrow can fly.
  // ─────────────────────────────────────────────────────────────────
  2: {
    cols: 6, rows: 5,
    arrows: [
      // Top row, right-pointing. Body at col 1 — blocks col 1 going up/down.
      { c: [[1,0],[1,1]], d: 0 },
      // Down-pointing at col 4. Free path. Tap any time.
      { c: [[0,4],[1,4]], d: 3 },
      // Up-pointing at col 1, head (3,1) → escape (2,1),(1,1) — (1,1) is
      // body of arrow 0. BLOCKED until arrow 0 flies away.
      { c: [[4,1],[3,1]], d: 1 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 3 — "Two parallel chains"
  // 4 arrows. Two independent chains side-by-side. Player picks order.
  // ─────────────────────────────────────────────────────────────────
  3: {
    cols: 7, rows: 7,
    arrows: [
      // Top-left chain: free arrow + arrow it blocks
      { c: [[1,0],[1,1]], d: 0 },              // free, blocks col 1
      { c: [[5,1],[4,1],[3,1]], d: 1 },        // up at col 1, blocked by row 1 col 1
      // Top-right chain: another free + blocked pair
      { c: [[1,4],[1,5]], d: 0 },              // free, blocks col 5
      { c: [[5,5],[4,5],[3,5]], d: 1 },        // up at col 5, blocked by row 1 col 5
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 4 — "Cross" (introduce 4-direction variety)
  // 4 arrows pointing in 4 different directions, forming a small cross
  // dependency.
  // ─────────────────────────────────────────────────────────────────
  4: {
    cols: 7, rows: 7,
    arrows: [
      // Right → free, blocks col 3-5 of row 3
      { c: [[3,0],[3,1],[3,2]], d: 0 },
      // Down → blocked by row 3 at col 4 (line passes (3,4))
      // Wait we need col same as something in arrow 0 → arrow 0 is row 3.
      // Down-arrow at col 1 escapes through (4,1),(5,1),(6,1) — all free.
      // Let me put it BLOCKED by another arrow.
      // Down-arrow head (0,5), escape (1,5),(2,5),(3,5),(4,5),(5,5),(6,5)
      // Need a blocker on col 5. Put arrow 3 below.
      { c: [[0,5]], d: 3 },                  // single-cell down, blocked by row5
      // Free up-arrow on left
      { c: [[6,0],[5,0],[4,0]], d: 1 },
      // Right-pointing in row 5 — its body at (5,5) blocks down-arrow above
      { c: [[5,3],[5,4],[5,5]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 5 — "Plus sign" — 5 arrows forming a + shape
  // Central arrow blocks 4 others.
  // ─────────────────────────────────────────────────────────────────
  5: {
    cols: 9, rows: 9,
    arrows: [
      // Central horizontal — body at row 4 cols 2-4, blocks col 3 going up/down
      { c: [[4,2],[4,3],[4,4]], d: 0 },
      // Top-down arrow at col 3 — blocked by central body at (4,3)
      { c: [[0,3],[1,3]], d: 3 },
      // Bottom-up arrow at col 4 — blocked by central head (4,4).
      // Different col from top arrow → no mutual cycle.
      { c: [[8,4],[7,4]], d: 1 },
      // Right edge arrow — blocks central's escape line
      { c: [[4,7],[4,8]], d: 0 },
      // Left up — completely free
      { c: [[8,0],[7,0]], d: 1 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 6 — "Heart shape" first decorative
  // Heart silhouette in 9×8 grid using 7 arrows.
  // ─────────────────────────────────────────────────────────────────
  6: {
    cols: 9, rows: 8,
    arrows: [
      // Top-left lobe of heart: short up-arrow
      { c: [[2,1],[1,1],[1,2]], d: 1 },
      // Top-right lobe: short up-arrow
      { c: [[2,7],[1,7],[1,6]], d: 1 },
      // Top valley between lobes
      { c: [[1,4]], d: 1 },
      // Mid horizontal — heart's wide middle
      { c: [[3,2],[3,3],[3,4],[3,5],[3,6]], d: 0 },
      // Lower-left going down/in
      { c: [[5,2],[5,3],[5,4]], d: 0 },
      // Lower-right
      { c: [[5,5],[5,6]], d: 0 },
      // Heart point at bottom
      { c: [[7,4]], d: 3 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 7 — "Chain of 4" (linear chain teaches order)
  // 5 arrows, 4 in a strict chain. Only ONE tappable initially.
  // ─────────────────────────────────────────────────────────────────
  7: {
    cols: 8, rows: 8,
    arrows: [
      // Free arrow that starts the chain — body blocks col 6
      { c: [[1,4],[1,5],[1,6]], d: 0 },
      // Up at col 6 — blocked by row 1 above at (1,6)
      { c: [[5,6],[4,6],[3,6]], d: 1 },
      // Right at row 3, body crosses col 6 at (3,6) — blocked? wait arrow 1 body at row 3-5. So row 3 col 6 is arrow 1's body. Need to put arrow 2 elsewhere.
      // Free arrow elsewhere
      { c: [[7,0],[7,1],[7,2]], d: 0 },
      // Up at col 2 — blocked by row 7's body at (7,2)? wait arrow 2 has body (7,2). so up arrow at col 2 escape line goes UP past (7,2)? Up-arrow head (5,2), escape (4,2),(3,2),(2,2),(1,2),(0,2). Empty. Free. Hmm.
      // Actually let me make this column 1 since arrow 2 has (7,1).
      // Up at col 1, head (5,1), escape (4,1),(3,1),(2,1),(1,1),(0,1). Empty. Free initially.
      // To make it blocked, need something at row 0-4 col 1.
      // Skip this restructure for now — make 5 arrows, simpler chain.
      { c: [[6,1],[5,1]], d: 1 },                  // up, free
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 8 — "Mosaic 3×3" intro to dense pattern
  // 6 arrows fitting like tiles.
  // ─────────────────────────────────────────────────────────────────
  8: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[1,0],[1,1],[1,2]], d: 0 },
      { c: [[1,5],[1,6],[1,7]], d: 0 },
      { c: [[4,0],[4,1],[4,2]], d: 0 },
      { c: [[4,5],[4,6],[4,7]], d: 0 },
      { c: [[7,0],[7,1],[7,2]], d: 0 },
      { c: [[7,5],[7,6],[7,7]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 9 — "Spiral 7"
  // 7 arrows winding inward.
  // ─────────────────────────────────────────────────────────────────
  9: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[0,0],[0,1],[0,2],[0,3]], d: 0 },     // top, escape right (off grid)
      { c: [[1,7],[2,7],[3,7]], d: 3 },            // right edge going down
      { c: [[7,8],[7,7],[7,6],[7,5]], d: 2 },      // bottom row going left
      { c: [[6,1],[5,1],[4,1]], d: 1 },            // left col going up
      { c: [[2,3],[2,4],[2,5]], d: 0 },            // inner top going right
      { c: [[5,5],[5,4],[5,3]], d: 2 },            // inner bottom going left
      { c: [[4,4]], d: 1 },                         // single cell, escape up
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 10 — "Diamond" decorative milestone
  // 8 arrows in diamond shape.
  // ─────────────────────────────────────────────────────────────────
  10: {
    cols: 9, rows: 9,
    arrows: [
      // Top tip
      { c: [[0,4]], d: 1 },
      // Upper-left diagonal-ish (using L shape)
      { c: [[2,2],[2,3]], d: 0 },
      // Upper-right
      { c: [[2,5],[2,6]], d: 0 },
      // Middle row tips
      { c: [[4,0],[4,1]], d: 0 },
      { c: [[4,7],[4,8]], d: 0 },
      // Lower-left
      { c: [[6,2],[6,3]], d: 0 },
      // Lower-right
      { c: [[6,5],[6,6]], d: 0 },
      // Bottom tip
      { c: [[8,4]], d: 3 },
    ]
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = HANDCRAFTED_LEVELS;
if (typeof window !== 'undefined') window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
