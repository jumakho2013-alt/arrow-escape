// Handcrafted levels — only the tutorial (1-5) is hand-tuned. Everything
// else flows through the procedural baker which produces denser maze-
// style layouts than I can craft by hand at this scale.
// Format: { cols, rows, arrows: [{c, d}] }. Cells listed tail→head;
// d is the escape direction (0=R 1=U 2=L 3=D).

const HANDCRAFTED_LEVELS = {
  // ─────────────────────────────────────────────────────────────────
  // LEVEL 1 — "Two rows" (smallest possible game)
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
      { c: [[1,0],[1,1]], d: 0 },
      { c: [[0,4],[1,4]], d: 3 },
      { c: [[4,1],[3,1]], d: 1 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 3 — "Two parallel chains"
  // ─────────────────────────────────────────────────────────────────
  3: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[1,0],[1,1]], d: 0 },
      { c: [[5,1],[4,1],[3,1]], d: 1 },
      { c: [[1,4],[1,5]], d: 0 },
      { c: [[5,5],[4,5],[3,5]], d: 1 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 4 — "Cross" 4 directions
  // ─────────────────────────────────────────────────────────────────
  4: {
    cols: 7, rows: 7,
    arrows: [
      { c: [[3,0],[3,1],[3,2]], d: 0 },
      { c: [[0,5]], d: 3 },
      { c: [[6,0],[5,0],[4,0]], d: 1 },
      { c: [[5,3],[5,4],[5,5]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 5 — "Plus sign" — central blocks 2 others
  // ─────────────────────────────────────────────────────────────────
  5: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[4,2],[4,3],[4,4]], d: 0 },
      { c: [[0,3],[1,3]], d: 3 },
      { c: [[8,4],[7,4]], d: 1 },
      { c: [[4,7],[4,8]], d: 0 },
      { c: [[8,0],[7,0]], d: 1 },
    ]
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = HANDCRAFTED_LEVELS;
if (typeof window !== 'undefined') window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
