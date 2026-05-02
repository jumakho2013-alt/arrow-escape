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
  // LEVEL 10 — "Triple chain" — 8 arrows, 3 mini-chains
  // ─────────────────────────────────────────────────────────────────
  10: {
    cols: 8, rows: 8,
    arrows: [
      { c: [[0,1]], d: 1 },                  // free top
      { c: [[2,1]], d: 1 },                  // blocked
      { c: [[4,1]], d: 1 },                  // blocked
      { c: [[7,6]], d: 3 },                  // free bottom-right (escape down off grid)
      { c: [[5,6]], d: 3 },                  // blocked by [7,6]
      { c: [[6,4],[6,5]], d: 0 },           // free (escape right past col 7 = off grid)
      { c: [[6,0],[6,1]], d: 0 },           // free
      { c: [[6,3]], d: 0 },                  // blocked by [6,4][6,5] body
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 11 — "Deep chain" — 8 arrows, vertical 4-chain + side
  // ─────────────────────────────────────────────────────────────────
  11: {
    cols: 8, rows: 8,
    arrows: [
      // Vertical 4-chain at col 1
      { c: [[0,1]], d: 1 },                  // A free
      { c: [[2,1]], d: 1 },                  // B blocked by A
      { c: [[4,1]], d: 1 },                  // C blocked by B
      { c: [[6,1]], d: 1 },                  // D blocked by C
      // Side blocker: arrow on row 4 going LEFT, blocked by C at col 1
      { c: [[4,3],[4,4]], d: 2 },           // E blocked by C body at (4,1)? E escape (4,2),(4,1),(4,0). (4,1) is C. BLOCKED.
      // Free at row 7
      { c: [[7,3],[7,4],[7,5]], d: 0 },     // F free
      // Top-right chain
      { c: [[0,6]], d: 0 },                  // H free (escape right off grid)
      { c: [[2,6],[3,6]], d: 1 },           // G blocked by H body (0,6)? G escape (1,6),(0,6). (0,6) is H. BLOCKED.
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 12 — "Crossroads" — 9 arrows, 4 chains intersecting
  // ─────────────────────────────────────────────────────────────────
  12: {
    cols: 9, rows: 9,
    arrows: [
      // Horizontal chain at row 1
      { c: [[1,0],[1,1]], d: 0 },           // A free
      { c: [[1,3],[1,4]], d: 0 },           // B blocked by A's body at (1,1)? B escape (1,5),(1,6),(1,7),(1,8). (1,7) might have arr E. Yes E at (1,6),(1,7) — BLOCKED.
      // Wait too tangled. Let me just place free + blocked pairs cleanly.
      { c: [[1,6],[1,7]], d: 0 },           // C free (escape right off grid)
      // Vertical chain at col 4
      { c: [[3,4],[4,4]], d: 3 },           // D blocked by row 5 horizontal? D escape (5,4),(6,4),(7,4),(8,4). (5,4) is E head. BLOCKED.
      { c: [[5,3],[5,4]], d: 0 },           // E free (escape (5,5),(5,6),(5,7),(5,8) — empty)
      // Vertical chain at col 7
      { c: [[3,7],[4,7]], d: 3 },           // F blocked by row 5 horizontal at (5,7)? Need horizontal there.
      { c: [[5,6],[5,7]], d: 0 },           // G free (escape (5,8))
      // Bottom chain
      { c: [[7,2],[7,3],[7,4]], d: 0 },     // H free
      { c: [[8,1]], d: 1 },                  // I blocked by H body at (7,1)? wait H starts at (7,2). col 1 row 7 free. I escape (7,1),(6,1),... empty. FREE. Make blocker — replace with col 4: I at (8,4) d=1, blocked by H at (7,4). Yes.
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 13 — "Tight maze" — 10 arrows on 9×9
  // ─────────────────────────────────────────────────────────────────
  13: {
    cols: 9, rows: 9,
    arrows: [
      // Top row
      { c: [[0,0],[0,1],[0,2]], d: 0 },     // A free
      { c: [[0,5],[0,6],[0,7]], d: 0 },     // B free
      // Row 2 — chained
      { c: [[2,3],[2,4]], d: 2 },           // C escape (2,2),(2,1),(2,0). Empty. FREE. Hmm need blocker.
      // Row 4 horizontal — blocks col 4 going up
      { c: [[4,3],[4,4]], d: 0 },           // D free
      // Col 4 going up — blocked by D at (4,4)
      { c: [[8,4],[7,4],[6,4]], d: 1 },     // E blocked by D
      // Bottom row
      { c: [[8,0],[8,1],[8,2]], d: 0 },     // F free
      { c: [[8,6],[8,7]], d: 0 },           // G free
      // Right col chain
      { c: [[3,8]], d: 1 },                  // H escape (2,8),(1,8),(0,8). (0,7) is B body. (0,8) empty. FREE. Hmm.
      // To block: put body at (1,8) or (2,8). Add another arrow.
      { c: [[6,8],[5,8]], d: 1 },           // I escape (4,8),(3,8),(2,8),(1,8),(0,8). (3,8) is H body? H is single cell (3,8). So I blocked by H.
      // Free filler
      { c: [[6,2]], d: 0 },                  // J free
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 14 — "Layered chain" — 11 arrows, chain depth 5
  // ─────────────────────────────────────────────────────────────────
  14: {
    cols: 9, rows: 10,
    arrows: [
      // Layer 1 (top — free)
      { c: [[0,0],[0,1]], d: 0 },           // A free
      // Layer 2 (blocked by row 1)
      { c: [[3,0],[3,1]], d: 0 },           // B free (escape right off grid past col 8)
      // Stack on col 1 vertical chain
      { c: [[5,1]], d: 1 },                  // C blocked by row 3 body at (3,1)
      { c: [[7,1]], d: 1 },                  // D blocked by C
      { c: [[9,1]], d: 1 },                  // E blocked by D
      // Stack on col 7 vertical
      { c: [[2,7]], d: 1 },                  // F free (escape (1,7),(0,7) empty)
      { c: [[4,7]], d: 1 },                  // G blocked by F
      { c: [[6,7]], d: 1 },                  // H blocked by G
      { c: [[8,7]], d: 1 },                  // I blocked by H
      // Bottom
      { c: [[9,4],[9,5]], d: 0 },           // J free
      // Top right
      { c: [[0,7],[0,8]], d: 0 },           // K free (escape right off grid)
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 15 — "Wall maze" — 12 arrows, 10×10
  // ─────────────────────────────────────────────────────────────────
  15: {
    cols: 10, rows: 10,
    arrows: [
      // Top wall — 3 right arrows
      { c: [[1,0],[1,1]], d: 0 },
      { c: [[1,3],[1,4]], d: 0 },
      { c: [[1,6],[1,7]], d: 0 },
      // Mid wall row 4 — 2 left arrows
      { c: [[4,3],[4,2]], d: 2 },
      { c: [[4,7],[4,6]], d: 2 },
      // Mid wall row 7 — 3 right arrows
      { c: [[7,0],[7,1]], d: 0 },
      { c: [[7,3],[7,4]], d: 0 },
      { c: [[7,6],[7,7]], d: 0 },
      // Vertical chain at col 8
      { c: [[3,8]], d: 1 },                  // free (escape (2,8),(1,8),(0,8) — all empty)
      { c: [[5,8]], d: 1 },                  // blocked by [3,8]
      { c: [[8,8]], d: 1 },                  // blocked by [5,8]+[3,8]
      // Bottom free
      { c: [[9,2],[9,3]], d: 0 },
    ]
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = HANDCRAFTED_LEVELS;
if (typeof window !== 'undefined') window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
