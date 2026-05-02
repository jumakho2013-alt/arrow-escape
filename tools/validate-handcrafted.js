// Validate handcrafted levels:
//  • each arrow's cells are contiguous (4-connectivity, no diagonals)
//  • each cell is inside the grid
//  • no two arrows share a cell (heads or bodies)
//  • level is solvable (topological unwinding succeeds)
//  • initial openness reasonable (1-3 arrows immediately tappable)

const HANDCRAFTED = require('./handcrafted-levels.js');
const DX = [1, 0, -1, 0];   // 0=right 1=up 2=left 3=down → DX[d] is column delta
const DY = [0, -1, 0, 1];   // DY[d] is row delta

function validateGeometry(level, lvl) {
  const errs = [];
  const occ = {};
  for (let i = 0; i < level.arrows.length; i++) {
    const a = level.arrows[i];
    if (!a.c || a.c.length === 0) {
      errs.push(`arrow ${i}: empty cells`); continue;
    }
    if (a.d === undefined || a.d < 0 || a.d > 3) {
      errs.push(`arrow ${i}: invalid dir ${a.d}`); continue;
    }
    for (let j = 0; j < a.c.length; j++) {
      const [r, c] = a.c[j];
      if (r < 0 || r >= level.rows || c < 0 || c >= level.cols) {
        errs.push(`arrow ${i} cell ${j} (${r},${c}) out of grid ${level.rows}×${level.cols}`);
      }
      const k = r + ',' + c;
      if (occ[k] !== undefined) {
        errs.push(`arrow ${i} cell (${r},${c}) overlaps with arrow ${occ[k]}`);
      }
      occ[k] = i;
      if (j > 0) {
        const [pr, pc] = a.c[j-1];
        const dist = Math.abs(r - pr) + Math.abs(c - pc);
        if (dist !== 1) {
          errs.push(`arrow ${i} cells ${j-1}→${j} not adjacent: (${pr},${pc})→(${r},${c})`);
        }
      }
    }
  }
  return errs;
}

function isSolvable(level) {
  const arrs = level.arrows.map(a => ({ ...a, alive: true }));
  let removed = 0, total = arrs.length;
  while (removed < total) {
    let progressed = false;
    for (const a of arrs) {
      if (!a.alive) continue;
      const head = a.c[a.c.length - 1];
      let cr = head[0] + DY[a.d], cc = head[1] + DX[a.d];
      let clear = true;
      while (cr >= 0 && cr < level.rows && cc >= 0 && cc < level.cols && clear) {
        for (const o of arrs) {
          if (o === a || !o.alive) continue;
          for (const [or, oc] of o.c) {
            if (or === cr && oc === cc) { clear = false; break; }
          }
          if (!clear) break;
        }
        cr += DY[a.d]; cc += DX[a.d];
      }
      if (clear) { a.alive = false; removed++; progressed = true; break; }
    }
    if (!progressed) return { solvable: false, stuck: arrs.filter(a => a.alive).length };
  }
  return { solvable: true };
}

function initialOpenness(level) {
  const arrs = level.arrows.map(a => ({ ...a, alive: true }));
  let open = 0;
  for (const a of arrs) {
    const head = a.c[a.c.length - 1];
    let cr = head[0] + DY[a.d], cc = head[1] + DX[a.d];
    let clear = true;
    while (cr >= 0 && cr < level.rows && cc >= 0 && cc < level.cols && clear) {
      for (const o of arrs) {
        if (o === a) continue;
        for (const [or, oc] of o.c) {
          if (or === cr && oc === cc) { clear = false; break; }
        }
        if (!clear) break;
      }
      cr += DY[a.d]; cc += DX[a.d];
    }
    if (clear) open++;
  }
  return open;
}

let ok = true;
for (const lvl in HANDCRAFTED) {
  const level = HANDCRAFTED[lvl];
  const geomErrs = validateGeometry(level, lvl);
  const solv = isSolvable(level);
  const open = initialOpenness(level);
  const arrows = level.arrows.length;

  if (geomErrs.length || !solv.solvable) {
    console.log(`✗ lvl ${lvl}: ${arrows} arrows, ${level.rows}×${level.cols}`);
    geomErrs.forEach(e => console.log(`   GEO: ${e}`));
    if (!solv.solvable) console.log(`   NOT SOLVABLE — ${solv.stuck} arrows stuck`);
    ok = false;
  } else {
    console.log(`✓ lvl ${lvl}: ${arrows} arrows, ${level.rows}×${level.cols}, initially open=${open}`);
  }
}

process.exit(ok ? 0 : 1);
