#!/usr/bin/env python3
"""Generate validated winding sliding-arrow puzzle levels.

Default pack is levels 21..40. Output is a JSON array; progress and metrics are
written beside the output file so long runs can be resumed.
"""

import argparse,json,math,random,sys,time
DIRS=[(0,1),(-1,0),(0,-1),(1,0)]
INF={(0,1):0,(-1,0):1,(0,-1):2,(1,0):3}
PARAMS_BY_LEVEL={
    # Reduced minDepth requirements after long-snake change (long anchors
    # absorb dependency chains, lowering achievable depth slightly).
    21:(14,14,26,9),22:(14,14,27,9),23:(14,15,28,10),24:(15,15,30,10),
    25:(15,15,32,11),26:(15,16,34,11),27:(16,16,28,8),28:(16,16,30,8),
    29:(16,17,32,9),30:(17,17,30,7),31:(17,17,32,7),32:(17,18,34,8),
    33:(18,18,36,8),34:(18,18,38,8),35:(18,19,40,9),36:(19,19,42,9),
    37:(19,19,44,9),38:(19,20,46,10),39:(20,20,48,10),40:(20,20,50,10),
    41:(20,21,64,19),42:(21,21,66,19),43:(21,21,68,20),44:(21,22,70,20),
    45:(22,22,72,21),46:(22,22,74,21),47:(22,23,76,22),48:(23,23,78,22),
    49:(23,23,80,23),50:(23,24,82,23),
}

def bends(ch):
    ds=[(b[0]-a[0],b[1]-a[1]) for a,b in zip(ch,ch[1:])]
    return sum(ds[i]!=ds[i-1] for i in range(1,len(ds)))

def metrics(level):
    R=level['rows']; C=level['cols']; A=level['arrows']; occ={}; bendlist=[]; bl=[]
    for i,a in enumerate(A):
        cells=[tuple(x) for x in a['c']]
        if len(cells)<5 or len(cells)>14: return None
        seen=set(); ds=[]
        for r,c in cells:
            if not(0<=r<R and 0<=c<C) or (r,c) in occ or (r,c) in seen: return None
            seen.add((r,c)); occ[(r,c)]=i
        for p,q in zip(cells,cells[1:]):
            dr=q[0]-p[0]; dc=q[1]-p[1]
            if abs(dr)+abs(dc)!=1: return None
            ds.append((dr,dc))
        if INF.get(ds[-1])!=a['d']: return None
        b=sum(ds[i]!=ds[i-1] for i in range(1,len(ds)))
        if b < min(2, len(cells)-2): return None
        bendlist.append(b)
    deps=[set() for _ in A]
    for i,a in enumerate(A):
        hr,hc=a['c'][-1]; dr,dc=DIRS[a['d']]; r=hr+dr; c=hc+dc
        while 0<=r<R and 0<=c<C:
            j=occ.get((r,c))
            if j is not None and j!=i: deps[i].add(j)
            r+=dr; c+=dc
        bl.append(len(deps[i]))
    rem=set(range(len(A))); waves=[]
    while rem:
        ready=[i for i in rem if deps[i].isdisjoint(rem)]
        if not ready: return None
        waves.append(ready); rem-=set(ready)
    memo={}
    def ch(i):
        if i not in memo: memo[i]=1+(max([ch(j) for j in deps[i]] or [0]))
        return memo[i]
    return {'density':len(occ)/(R*C),'initial':len(waves[0]),'depth':len(waves),'chain':max(ch(i) for i in range(len(A))),'avgBends':sum(bendlist)/len(A),'avgBlockers':sum(bl)/len(A),'lens':[len(a['c']) for a in A],'bends':bendlist,'waves':waves,'deps':[sorted(x) for x in deps]}

def split_lens(total,n):
    # COMBINED with Codex's quota mechanism:
    # - min 5 cells (no noodles)
    # - max 14 cells
    # - FORCED quota: at least longMin long anchors (10-14) per level
    # - Bias rest toward medium-long
    longMin = max(4, n//5)   # at least 4-5 long anchors (10-14 cells)
    for _ in range(5000):
        rem=total; out=[]; longUsed=0
        for k in range(n):
            left=n-k-1
            lo=max(5, rem-14*left); hi=min(14, rem-5*left)
            if lo>hi: break
            vals=list(range(lo,hi+1))
            weights=[]
            longRemaining = max(0, longMin - longUsed)
            forceLong = longRemaining > 0 and left < longRemaining + 2
            for v in vals:
                if forceLong:
                    # Quota not met & few slots left — pick long only
                    w = 10 if v >= 10 else 0
                else:
                    if 12<=v<=14: w=14
                    elif 10<=v<=11: w=10
                    elif v in (7,8,9): w=7
                    elif v in (5,6): w=4
                    else: w=0
                weights.append(w)
            if sum(weights)==0: break
            v=random.choices(vals,weights)[0]
            out.append(v); rem-=v
            if v>=10: longUsed+=1
        if len(out)==n and rem==0 and longUsed>=longMin:
            random.shuffle(out); return out
    return None

def split_winding_chunks(path,n,total):
    """Split a path into n chunks, each length 4..15 and at least 2 bends.
    Bias (not enforce) toward 1-3 long anchor snakes (12-15) per level."""
    if total>len(path):
        return None
    longMin = 12
    max_start=len(path)-total
    starts=list(range(max_start+1))
    random.shuffle(starts)
    for start in starts[:80]:
        p=path[start:start+total]
        memo=set()
        def rec(pos,left):
            rem=total-pos
            if left==0:
                return [] if rem==0 else None
            if rem<left*3 or rem>left*14:
                return None
            key=(pos,left)
            if key in memo:
                return None
            lens=list(range(3,15))
            random.shuffle(lens)
            # Mild preference for long: pick around average but with extra
            # chance for 12-15. Sort key: lower = tried first.
            avg = rem/left
            def sortKey(l):
                base = abs(l-avg) + random.random()*0.4
                if 12<=l<=15: base -= 1.5  # boost long candidates
                return base
            lens.sort(key=sortKey)
            for l in lens:
                if rem-l < (left-1)*3 or rem-l > (left-1)*14:
                    continue
                ch=p[pos:pos+l]
                if len(ch)==l and bends(ch) >= min(2, l-2):
                    rest=rec(pos+l,left-1)
                    if rest is not None:
                        return [ch]+rest
            memo.add(key)
            return None
        chunks=rec(0,n)
        if chunks is not None:
            return chunks
    return None

def path_dfs(R,C,target,limit=0.35):
    # Dense winding self-avoiding path. Warnsdorff + turn bias, with bounded backtracking.
    start=(random.randrange(R),random.randrange(C)); path=[start]; used={start}; deadline=time.time()+limit
    sys.setrecursionlimit(1000000)
    def inb(r,c): return 0<=r<R and 0<=c<C
    def free_degree(r,c):
        return sum(1 for dr,dc in DIRS if inb(r+dr,c+dc) and (r+dr,c+dc) not in used)
    def dfs(lastdir=-1,straight=0):
        if len(path)>=target: return True
        if time.time()>deadline: return False
        r,c=path[-1]
        opts=[]
        for d,(dr,dc) in enumerate(DIRS):
            nr,nc=r+dr,c+dc
            if not inb(nr,nc) or (nr,nc) in used: continue
            deg=free_degree(nr,nc)
            same=(d==lastdir)
            # Lower is better: fill tight spaces first, force turns, cap long straights.
            score=deg*1.25 + (2.4 if same else 0) + (6.0 if same and straight>=2 else 0) + random.random()*1.2
            opts.append((score,d,nr,nc))
        opts.sort()
        for _,d,nr,nc in opts:
            path.append((nr,nc)); used.add((nr,nc))
            if dfs(d, straight+1 if d==lastdir else 1): return True
            used.remove((nr,nc)); path.pop()
        return False
    return path if dfs() else None

def weave_path(R,C):
    p=[]; r=0; left=True
    while r+1<R:
        cols=range(0, C if C%2 else C-1) if left else range(C-1, -1 if C%2 else 0, -1)
        for idx,c in enumerate(cols):
            seq=[(r,c),(r+1,c)] if idx%2==0 else [(r+1,c),(r,c)]
            for cell in seq:
                if not p or p[-1]!=cell:
                    p.append(cell)
        if C%2==0:
            p.append((r+1, C-1 if left else 0))
        r+=2; left=not left
    if r<R:
        cols=range(0,C) if left else range(C-1,-1,-1)
        for c in cols:
            p.append((r,c))
    return p

def chunks_from_path(R,C,n):
    area=R*C; need=math.ceil(area*.92)
    base=weave_path(R,C)
    # Strategy 1: lens via split_lens (which enforces 2-3 long quota), then
    # cut path at those lengths. Try multiple total values.
    for trial in range(150):
        if len(base) < need: break
        total=random.randint(need,len(base))
        lens=split_lens(total,n)
        if not lens: continue
        # Try base path as-is or reversed
        candidates=[base, list(reversed(base))]
        # Also try a sliding window
        if len(base) > total:
            offset=random.randint(0, len(base)-total)
            candidates.append(base[offset:offset+total])
        for p in candidates:
            if len(p) < total: continue
            idx=0; chunks=[]; ok=True
            for l in lens:
                ch=p[idx:idx+l]; idx+=l
                if len(ch)!=l or bends(ch) < min(2, l-2):
                    ok=False; break
                chunks.append(ch)
            if ok: return chunks
    # Strategy 2: random DFS path (more variation, slower)
    totals=list(range(need,area+1)); random.shuffle(totals)
    for total in totals[:6]:
        lens=split_lens(total,n)
        if not lens: continue
        p=path_dfs(R,C,total,0.9)
        if not p: continue
        idx=0; chunks=[]; ok=True
        for l in lens:
            ch=p[idx:idx+l]; idx+=l
            if len(ch)!=l or bends(ch) < min(2, l-2):
                ok=False; break
            chunks.append(ch)
        if ok: return chunks
    # Strategy 3: fallback to original split_winding_chunks (no quota)
    for _ in range(50):
        if len(base) < need: break
        total=random.randint(need,len(base))
        chunks=split_winding_chunks(base,n,total)
        if chunks: return chunks
    return None

def orient(C,R,chunks,bits):
    arr=[]
    for i,ch in enumerate(chunks):
        cc=ch if ((bits>>i)&1)==0 else list(reversed(ch))
        d=INF.get((cc[-1][0]-cc[-2][0],cc[-1][1]-cc[-2][1]))
        if d is None: return None
        arr.append({'c':[list(x) for x in cc],'d':d})
    return {'cols':C,'rows':R,'arrows':arr}

def raw_blockers_for_orientation(C,R,chunks,i,rev):
    occ={}
    for j,ch in enumerate(chunks):
        for cell in ch: occ[cell]=j
    cc=chunks[i] if not rev else list(reversed(chunks[i]))
    d=INF.get((cc[-1][0]-cc[-2][0],cc[-1][1]-cc[-2][1]))
    if d is None: return 0
    hr,hc=cc[-1]; dr,dc=DIRS[d]; r=hr+dr; c=hc+dc; bs=set()
    while 0<=r<R and 0<=c<C:
        j=occ.get((r,c))
        if j is not None and j!=i: bs.add(j)
        r+=dr; c+=dc
    return len(bs)

def biased_bits(C,R,chunks):
    bits=0
    for i in range(len(chunks)):
        b0=raw_blockers_for_orientation(C,R,chunks,i,False)
        b1=raw_blockers_for_orientation(C,R,chunks,i,True)
        if b1>b0:
            choose_rev=random.random()<0.82
        elif b0>b1:
            choose_rev=random.random()<0.18
        else:
            choose_rev=random.random()<0.5
        if choose_rev: bits |= (1<<i)
    # random escape from local bias
    flips=random.randrange(0, max(1,len(chunks)//8)+1)
    for _ in range(flips): bits ^= (1<<random.randrange(len(chunks)))
    return bits

def search_orient(C,R,chunks,minD,tries=28000):
    n=len(chunks); best=None; bestm=None; bestscore=-1e18
    for _ in range(tries):
        bits=biased_bits(C,R,chunks) if random.random()<0.78 else random.getrandbits(n)
        lev=orient(C,R,chunks,bits); m=metrics(lev)
        if not m: continue
        score=m['depth']*240+m['chain']*150-m['initial']*380+m['avgBends']*40+m['avgBlockers']*65+m['density']*80
        if m['initial']<=3: score+=900
        if m['depth']>=minD: score+=1200
        if 2.0<=m['avgBlockers']<=4.4: score+=260
        if score>bestscore:
            bestscore=score; best=lev; bestm=m
        maxInitial = max(3, math.ceil(len(chunks)*0.20))
        if m['density']>=.92 and m['initial']<=maxInitial and m['depth']>=minD and m['chain']>=minD and m['avgBends']>=3.0 and m['avgBlockers']>=1.7:
            return lev,m,True
    return best,bestm,False

def find_level(C,R,n,minD,lvl,seconds=220):
    deadline=time.time()+seconds; best=None; bestm=None; bestscore=-1e18; attempt=0
    while time.time()<deadline:
        attempt+=1
        chunks=chunks_from_path(R,C,n)
        if not chunks: continue
        maxInitial = max(3, math.ceil(n*0.20))
        lev,m,ok=search_orient(C,R,chunks,minD,52000 if n>=50 else 42000)
        if m:
            score=m['depth']*240+m['chain']*150-m['initial']*380+m['avgBends']*40+m['avgBlockers']*65+m['density']*80
            if score>bestscore:
                bestscore=score; best=lev; bestm=m
                print('best L%d attempt=%d %s' % (lvl,attempt,json.dumps({k:bestm[k] for k in ['density','initial','depth','chain','avgBends','avgBlockers']})), file=sys.stderr, flush=True)
        if ok:
            print('CHOSEN L%d %s' % (lvl,json.dumps({k:m[k] for k in ['density','initial','depth','chain','avgBends','avgBlockers']})), file=sys.stderr, flush=True)
            return lev,m
    maxInitial = max(3, math.ceil(n*0.20))
    if bestm and bestm['density']>=.92 and bestm['initial']<=maxInitial and bestm['depth']>=minD and bestm['avgBends']>=3:
        print('CHOSEN_FALLBACK L%d %s' % (lvl,json.dumps({k:bestm[k] for k in ['density','initial','depth','chain','avgBends','avgBlockers']})), file=sys.stderr, flush=True)
        return best,bestm
    raise RuntimeError('failed L%d best=%s' % (lvl,bestm))


def build_params(from_level,to_level):
    missing=[lvl for lvl in range(from_level,to_level+1) if lvl not in PARAMS_BY_LEVEL]
    if missing:
        raise SystemExit('No built-in params for levels: '+','.join(map(str,missing)))
    return [(lvl,*PARAMS_BY_LEVEL[lvl]) for lvl in range(from_level,to_level+1)]

def load_json(path,default):
    if not path:
        return default
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return default

def write_json(path,value,compact=False):
    with open(path,'w') as f:
        if compact:
            f.write(json.dumps(value,separators=(',',':')))
        else:
            json.dump(value,f,indent=2)

def main():
    ap=argparse.ArgumentParser(description='Generate winding sliding-arrow levels with validation metrics.')
    ap.add_argument('--from-level',type=int,default=21)
    ap.add_argument('--to-level',type=int,default=40)
    ap.add_argument('--out',default='tools/generated-levels-21-40.json')
    ap.add_argument('--report',default='tools/generated-levels-21-40.report.json')
    ap.add_argument('--resume',action='store_true',help='Resume from existing --out and --report files.')
    ap.add_argument('--seed',type=int,default=None)
    ap.add_argument('--seconds-per-level',type=int,default=220)
    args=ap.parse_args()
    if args.seed is not None:
        random.seed(args.seed)

    params=build_params(args.from_level,args.to_level)
    levels=load_json(args.out,[]) if args.resume else []
    report=load_json(args.report,[]) if args.resume else []
    done=len(levels)
    if done>len(params):
        raise SystemExit('Existing output has more levels than requested range.')

    for lvl,C,R,n,minD in params[done:]:
        lev,m=find_level(C,R,n,minD,lvl,args.seconds_per_level)
        levels.append(lev)
        report.append({'level':lvl,'cols':C,'rows':R,'arrows':n,'minDepth':minD,
                       **{k:m[k] for k in ['density','initial','depth','chain','avgBends','avgBlockers']}})
        write_json(args.out,levels,compact=True)
        write_json(args.report,report)

    print(json.dumps(levels,separators=(',',':')))

if __name__=='__main__':
    main()
