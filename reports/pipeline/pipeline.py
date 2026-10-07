from load import *
import collections, statistics
R=10.0  # km, agreement radius between independent sources
SRC=[('A',A),('B',B),('C',C),('D',D)]

# --- drop placeholder coordinates: the same point reused by several DIFFERENT names inside one source
def placeholders(S):
    cnt=collections.defaultdict(set)
    for (pn,nn),recs in S.items():
        for lat,lng,_ in recs: cnt[(round(lat,3),round(lng,3))].add((pn,nn))
    return {pt for pt,names in cnt.items() if len(names)>=2}
PH={nm:placeholders(S) for nm,S in SRC}

def cands(key):
    out={}
    for nm,S in SRC:
        pts=[]
        for lat,lng,meta in S.get(key,[]):
            if (round(lat,3),round(lng,3)) in PH[nm]: continue   # placeholder -> unusable
            if not any(hav((lat,lng),q[:2])<0.1 for q in pts): pts.append((lat,lng,meta))
        if pts: out[nm]=pts
    return out

# --- official hierarchy: our city -> county seat point (GeoNames-derived, from sajaddp)
base='/tmp/ds/list-of-cities-in-Iran/dist/json/'
seat={r['county_id']:(r['latitude'],r['longitude']) for r in jl(base+'county-centers.json')}
city2county={}
for r in jl(base+'cities.json'):
    k=(provA[r['province_id']],norm(r['name']))
    city2county.setdefault(k,set()).add(r['county_id'])
def seat_dist(key,pt):
    cs=city2county.get(key)
    if not cs or len(cs)!=1: return None
    s=seat.get(next(iter(cs)))
    return None if not s else hav(pt,s)

results={}
for key,(p,c) in OUR.items():
    cs=cands(key)
    amb={nm for nm,pts in cs.items() if len(pts)>1 and max(hav(a[:2],b[:2]) for a in pts for b in pts)>R}
    usable={nm:pts[0] for nm,pts in cs.items() if nm not in amb}
    agree=set(); pairs=[]
    nm_=list(usable)
    for i in range(len(nm_)):
        for j in range(i+1,len(nm_)):
            d=hav(usable[nm_[i]][:2],usable[nm_[j]][:2]); pairs.append((nm_[i],nm_[j],d))
            if d<=R: agree|={nm_[i],nm_[j]}
    results[key]=dict(p=p,c=c,cs=cs,amb=amb,usable=usable,agree=agree,pairs=pairs)
