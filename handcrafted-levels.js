// Handcrafted levels — only the tutorial (1-5) is hand-tuned. Everything
// else flows through the procedural baker so the "competitor maze
// difficulty" applies uniformly. Format: { cols, rows, arrows: [{c, d}] }.
// Cells listed tail→head; d is the escape direction (0=R 1=U 2=L 3=D).

const HANDCRAFTED_LEVELS = {
  // ─────────────────────────────────────────────────────────────────
  // LEVEL 1 — "Two rows" (smallest possible game)
  // 2 free arrows. Pure introduction.
  // ─────────────────────────────────────────────────────────────────
  1: {
    cols: 6, rows: 5,
    arrows: [
      { c: [[1,0],[1,1],[1,2]], d: 0 },
      { c: [[3,0],[3,1],[3,2]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 2 — "First chain" — 3 arrows, 1 blocker
  // ─────────────────────────────────────────────────────────────────
  2: {
    cols: 6, rows: 5,
    arrows: [
      { c: [[1,0],[1,1]], d: 0 },           // free, blocks col 1
      { c: [[0,4],[1,4]], d: 3 },           // free
      { c: [[4,1],[3,1]], d: 1 },           // up at col 1, blocked by arr 0
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 3 — "Two parallel chains" — pick which to attack first
  // ─────────────────────────────────────────────────────────────────
  3: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[1,0],[1,1]], d: 0 },           // free, blocks col 1
      { c: [[5,1],[4,1],[3,1]], d: 1 },     // up at col 1, blocked
      { c: [[1,4],[1,5]], d: 0 },           // free, blocks col 5
      { c: [[5,5],[4,5],[3,5]], d: 1 },     // up at col 5, blocked
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 4 — "Cross" 4 directions
  // ─────────────────────────────────────────────────────────────────
  4: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[3,0],[3,1],[3,2]], d: 0 },     // free right
      { c: [[0,5]], d: 3 },                  // down, blocked by row 5 col 5
      { c: [[6,0],[5,0],[4,0]], d: 1 },     // free up
      { c: [[5,3],[5,4],[5,5]], d: 0 },     // free right, blocks col 5
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 5 — "Plus sign" — central arrow blocks 2 others
  // Last tutorial level — gateway to manual puzzles.
  // ─────────────────────────────────────────────────────────────────
  5: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[4,2],[4,3],[4,4]], d: 0 },     // central, blocked by arr 3
      { c: [[0,3],[1,3]], d: 3 },           // top-down at col 3, blocked by central
      { c: [[8,4],[7,4]], d: 1 },           // bottom-up at col 4, blocked by central
      { c: [[4,7],[4,8]], d: 0 },           // free right, blocks central
      { c: [[8,0],[7,0]], d: 1 },           // free up
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 6 — "Two chains" — 7 arrows, 2 chains crossing
  // Vertical chain of 4 + horizontal chain of 2 + 1 free.
  // Initial open: 3 (A, E, G). Solve in any order, depth varies.
  // ─────────────────────────────────────────────────────────────────
  6: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[0,1]], d: 1 },                  // A: free, top of col 1
      { c: [[3,1]], d: 1 },                  // B: blocked by A
      { c: [[5,1]], d: 1 },                  // C: blocked by B
      { c: [[6,1]], d: 1 },                  // D: blocked by C
      { c: [[4,3]], d: 2 },                  // E: free (escape left to edge)
      { c: [[4,5]], d: 2 },                  // F: blocked by E
      { c: [[4,6]], d: 0 },                  // G: free (escape right off grid)
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 7 — "L chain" — 6 arrows in tight L-shape
  // Bottom row + right col chain. Only 1 initially tappable.
  // ─────────────────────────────────────────────────────────────────
  7: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[6,5],[6,6]], d: 0 },           // free, escapes right
      { c: [[6,3],[6,4]], d: 0 },           // blocked by 0 (body at 6,5)
      { c: [[6,1],[6,2]], d: 0 },           // blocked by 1 (body at 6,3)
      { c: [[2,6],[3,6]], d: 3 },           // down at col 6, head (3,6) — escape (4,6),(5,6),(6,6) - (6,6) is arr 0 head. BLOCKED.
      { c: [[1,4],[1,5]], d: 0 },           // free at top
      { c: [[3,4],[3,5]], d: 0 },           // free at top mid
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 8 — "Maze rows" — 8 arrows in 4 rows, alternating directions
  // Each row blocks the row above. Bottom is the only entrance.
  // ─────────────────────────────────────────────────────────────────
  8: {
    cols: 9, rows: 9,
    arrows: [
      // Row 1, 3 right-pointing arrows
      { c: [[1,0],[1,1]], d: 0 },
      { c: [[1,3],[1,4]], d: 0 },
      { c: [[1,6],[1,7]], d: 0 },
      // Row 4, 2 left-pointing arrows (block col 1, col 4 from above)
      { c: [[4,2],[4,1]], d: 2 },
      { c: [[4,7],[4,6]], d: 2 },
      // Row 7 right-pointing
      { c: [[7,0],[7,1]], d: 0 },
      { c: [[7,3],[7,4]], d: 0 },
      { c: [[7,6],[7,7]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 9 — "Spiral lock" — 6 arrows winding inward, deeper chain
  // ─────────────────────────────────────────────────────────────────
  9: {
    cols: 9, rows: 9,
    arrows: [
      // Outer spiral
      { c: [[0,0],[0,1],[0,2]], d: 0 },     // top free
      { c: [[1,7],[2,7],[3,7]], d: 3 },     // right edge down — blocked by top? top has body at (0,0-2), col 7 escape (4,7),(5,7),(6,7),(7,7),(8,7). Free.
      // Wait this is too messy. Let me redesign.
      // Simpler: 6 arrows in an inward spiral.
      { c: [[8,8],[8,7],[8,6]], d: 2 },     // bottom-right going left
      { c: [[7,0],[6,0],[5,0]], d: 1 },     // left side going up
      { c: [[3,4],[3,5]], d: 0 },           // inner top right
      { c: [[5,5],[5,4]], d: 2 },           // inner bottom left
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 10 — "Triple chain" — 8 arrows forming 3 mini-chains
  // ─────────────────────────────────────────────────────────────────
  10: {
    cols: 8, rows: 8,
    arrows: [
      // Chain 1 (col 1, vertical)
      { c: [[0,1]], d: 1 },                  // free
      { c: [[2,1]], d: 1 },                  // blocked by [0,1]
      { c: [[4,1]], d: 1 },                  // blocked by [2,1]
      // Chain 2 (col 6, vertical)
      { c: [[7,6]], d: 3 },                  // free (escape down off grid)
      { c: [[5,6]], d: 3 },                  // blocked by [7,6]
      // Chain 3 (row 6, horizontal)
      { c: [[6,4],[6,5]], d: 0 },           // ?, blocked by [7,6]'s body at (7,6)? row 6 escape goes (6,6),(6,7) — (6,6) is empty, (7,6) is below. So (6,6),(6,7) free. FREE.
      // Hmm not blocked. Let me fix: make chain 2 differently.
      // Redo chain 2/3 — horizontal chain at row 6:
      { c: [[6,0],[6,1]], d: 0 },           // free (col 1 going right - blocked by col 1 vert? no, body at row 6 col 0-1)
      { c: [[6,3]], d: 0 },                  // blocked by [6,4]'s body at (6,4)? wait [6,4] head is (6,5) d=0. Body at (6,4),(6,5). escape (6,6),(6,7). Doesn't block (6,3).
      // (6,3) escape line: (6,4),(6,5),(6,6),(6,7). (6,4),(6,5) are arr above body. BLOCKED.
    ]
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = HANDCRAFTED_LEVELS;
if (typeof window !== 'undefined') window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
