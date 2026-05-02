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
  // LEVEL 6 — "Heart shape" — decorative, with internal chain.
  // 7 arrows form a heart silhouette. Mid horizontal blocks two
  // other arrows so the heart unravels in order, not all at once.
  // ─────────────────────────────────────────────────────────────────
  6: {
    cols: 9, rows: 8,
    arrows: [
      // Top-left lobe
      { c: [[2,1],[1,1],[1,2]], d: 1 },
      // Top-right lobe
      { c: [[2,7],[1,7],[1,6]], d: 1 },
      // Top valley — points UP off grid (free), keeps heart shape readable
      { c: [[1,4]], d: 1 },
      // Mid horizontal — heart's wide middle, free
      { c: [[3,2],[3,3],[3,4],[3,5],[3,6]], d: 0 },
      // Lower-left — blocked by lower-right at (5,5)
      { c: [[5,2],[5,3],[5,4]], d: 0 },
      // Lower-right — free
      { c: [[5,5],[5,6]], d: 0 },
      // Heart point — points DOWN off grid, free
      { c: [[7,4]], d: 3 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 7 — "Linear chain of 4" + 1 free
  // Single column of single-cell arrows, each blocking the next.
  // Initially 2 tappable; chain unwinds top-down.
  // ─────────────────────────────────────────────────────────────────
  7: {
    cols: 7, rows: 8,
    arrows: [
      { c: [[0,1]], d: 1 },                  // top, free (escape off grid up)
      { c: [[1,1]], d: 1 },                  // blocked by arr 0
      { c: [[2,1]], d: 1 },                  // blocked by arr 1 (then arr 0 already dead)
      { c: [[3,1]], d: 1 },                  // blocked by arr 2
      { c: [[7,4],[7,5]], d: 0 },            // independent free arrow
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 8 — "Mosaic with locks" — tile pattern with chain
  // ─────────────────────────────────────────────────────────────────
  8: {
    cols: 9, rows: 9,
    arrows: [
      // Row 1 free arrows (block col 1, col 6 vertical traffic)
      { c: [[1,0],[1,1]], d: 0 },
      { c: [[1,5],[1,6]], d: 0 },
      // Row 4 free arrows
      { c: [[4,0],[4,1]], d: 0 },
      { c: [[4,5],[4,6]], d: 0 },
      // Row 7 free arrows
      { c: [[7,0],[7,1]], d: 0 },
      { c: [[7,5],[7,6]], d: 0 },
      // Col 1 going up — blocked by ALL row arrows on left side at col 1
      { c: [[8,1]], d: 1 },
      // Col 6 going up — blocked by row arrows on right
      { c: [[8,6]], d: 1 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 9 — "Spiral 7"
  // ─────────────────────────────────────────────────────────────────
  9: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[0,0],[0,1],[0,2],[0,3]], d: 0 },     // top free
      { c: [[1,7],[2,7],[3,7]], d: 3 },            // right edge going down
      { c: [[7,8],[7,7],[7,6],[7,5]], d: 2 },      // bottom free
      { c: [[6,1],[5,1],[4,1]], d: 1 },            // left col free
      { c: [[2,3],[2,4],[2,5]], d: 0 },            // inner top
      { c: [[5,5],[5,4],[5,3]], d: 2 },            // inner bottom
      { c: [[4,4]], d: 1 },                         // center
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 10 — "Diamond" — decorative milestone, 8 arrows
  // ─────────────────────────────────────────────────────────────────
  10: {
    cols: 9, rows: 9,
    arrows: [
      { c: [[0,4]], d: 1 },                  // top tip
      { c: [[2,2],[2,3]], d: 0 },
      { c: [[2,5],[2,6]], d: 0 },
      { c: [[4,0],[4,1]], d: 0 },
      { c: [[4,7],[4,8]], d: 0 },
      { c: [[6,2],[6,3]], d: 0 },
      { c: [[6,5],[6,6]], d: 0 },
      { c: [[8,4]], d: 3 },                  // bottom tip
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 20 — "Smiley face" milestone
  // 12-arrow smiley: 2 eyes + curved mouth + outline.
  // ─────────────────────────────────────────────────────────────────
  20: {
    cols: 11, rows: 11,
    arrows: [
      // Top of face — outline
      { c: [[1,3],[1,4],[1,5],[1,6],[1,7]], d: 0 },
      // Left eye (just the head, single cell)
      { c: [[3,3]], d: 1 },
      // Right eye
      { c: [[3,7]], d: 1 },
      // Nose
      { c: [[5,5]], d: 1 },
      // Mouth — curved smile (5 arrows in a row)
      { c: [[7,3],[7,4]], d: 0 },
      { c: [[8,5]], d: 3 },
      { c: [[7,6],[7,7]], d: 0 },
      // Bottom outline
      { c: [[9,3],[9,4],[9,5],[9,6],[9,7]], d: 0 },
      // Side outlines
      { c: [[3,1],[4,1],[5,1],[6,1]], d: 1 },
      { c: [[6,9],[5,9],[4,9],[3,9]], d: 3 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 50 — "House" milestone
  // House: roof (triangle of arrows) + walls + door.
  // ─────────────────────────────────────────────────────────────────
  50: {
    cols: 13, rows: 13,
    arrows: [
      // Roof apex
      { c: [[1,6]], d: 1 },
      // Roof slopes (left + right)
      { c: [[2,4],[2,5]], d: 0 },
      { c: [[2,7],[2,8]], d: 0 },
      { c: [[3,2],[3,3]], d: 0 },
      { c: [[3,9],[3,10]], d: 0 },
      // Roof base
      { c: [[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10]], d: 0 },
      // Left wall
      { c: [[10,2],[9,2],[8,2],[7,2],[6,2],[5,2]], d: 1 },
      // Right wall
      { c: [[5,10],[6,10],[7,10],[8,10],[9,10],[10,10]], d: 3 },
      // Door (3 cells vertical)
      { c: [[10,6],[9,6],[8,6]], d: 1 },
      // Window (single cell)
      { c: [[7,4]], d: 0 },
      { c: [[7,8]], d: 0 },
      // Floor
      { c: [[11,3],[11,4],[11,5],[11,6],[11,7],[11,8],[11,9]], d: 0 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 100 — "Crown" milestone
  // 5-pointed crown silhouette with chain dependencies.
  // ─────────────────────────────────────────────────────────────────
  100: {
    cols: 13, rows: 11,
    arrows: [
      // Crown points (5 spikes pointing up)
      { c: [[2,1]], d: 1 },
      { c: [[1,4]], d: 1 },
      { c: [[0,6]], d: 1 },
      { c: [[1,8]], d: 1 },
      { c: [[2,11]], d: 1 },
      // Crown base — long horizontal
      { c: [[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11]], d: 0 },
      // Bottom band
      { c: [[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]], d: 0 },
      // Side jewels
      { c: [[8,3]], d: 3 },
      { c: [[8,6]], d: 3 },
      { c: [[8,9]], d: 3 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 200 — "Star" milestone — 5-pointed star
  // ─────────────────────────────────────────────────────────────────
  200: {
    cols: 13, rows: 13,
    arrows: [
      // Top point
      { c: [[1,6]], d: 1 },
      { c: [[2,5]], d: 1 },
      { c: [[2,7]], d: 1 },
      // Upper horizontals (left + right)
      { c: [[3,2],[3,3],[3,4]], d: 0 },
      { c: [[3,8],[3,9],[3,10]], d: 0 },
      // Mid points (left + right)
      { c: [[4,1]], d: 0 },
      { c: [[4,11]], d: 0 },
      // Inner horizontal
      { c: [[5,4],[5,5],[5,6],[5,7],[5,8]], d: 0 },
      // Lower diagonals
      { c: [[6,3]], d: 0 },
      { c: [[6,9]], d: 0 },
      // Lower body
      { c: [[7,4],[7,5]], d: 0 },
      { c: [[7,7],[7,8]], d: 0 },
      // Bottom legs (left + right going down)
      { c: [[8,4]], d: 3 },
      { c: [[8,8]], d: 3 },
      { c: [[10,3]], d: 3 },
      { c: [[10,9]], d: 3 },
    ]
  },

  // ─────────────────────────────────────────────────────────────────
  // LEVEL 500 — "Big Heart" final boss visual — 20+ arrows
  // Larger heart with internal cross-locks for some thinking.
  // ─────────────────────────────────────────────────────────────────
  500: {
    cols: 17, rows: 14,
    arrows: [
      // Top-left lobe (6 arrows)
      { c: [[3,2],[2,2],[2,3]], d: 1 },
      { c: [[1,4],[1,5]], d: 1 },
      { c: [[2,6]], d: 1 },
      // Top-right lobe (6 arrows)
      { c: [[3,14],[2,14],[2,13]], d: 1 },
      { c: [[1,11],[1,10]], d: 1 },
      { c: [[2,9]], d: 1 },
      // Top valley
      { c: [[2,7],[2,8]], d: 1 },
      // Mid horizontal — wide middle
      { c: [[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[4,11],[4,12],[4,13],[4,14]], d: 0 },
      // Lower band — narrows
      { c: [[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13]], d: 0 },
      // Even narrower
      { c: [[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12]], d: 0 },
      // Mid-narrow
      { c: [[9,5],[9,6],[9,7],[9,8],[9,9],[9,10],[9,11]], d: 0 },
      // Tip
      { c: [[10,6],[10,7],[10,8],[10,9],[10,10]], d: 0 },
      { c: [[11,7],[11,8],[11,9]], d: 0 },
      // Bottom point
      { c: [[12,8]], d: 3 },
    ]
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = HANDCRAFTED_LEVELS;
if (typeof window !== 'undefined') window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
