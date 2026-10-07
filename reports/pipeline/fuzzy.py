from resolve import *
def fold(s):
    s=norm(s)
    for a,b in [('آ','ا'),('أ','ا'),('إ','ا'),('ئ','ی'),('ؤ','و'),('ى','ی'),('ۀ','ه'),('ة','ه'),('ء',''),('ٔ',''),('’',''),('ʼ','')]: s=s.replace(a,b)
    return s
FBY=collections.defaultdict(list)
for g,G in GN.items():
    if G['fc']!='P' or G['code'] in ABANDONED: continue
    for a in G['alts']:
        if FA.search(a): FBY[fold(a)].append(g)
LATL=[(g,lat(G['ascii']),lat(G['name'])) for g,G in GN.items() if G['fc']=='P' and G['code'] not in ABANDONED]
PROVG=collections.defaultdict(list)
for g,a,b in LATL: PROVG[amap.get(GN[g]['admin1'])].append((g,a,b))
def dedupe(ids):
    out=[]
    for g in sorted(set(ids),key=lambda g:(rank.get(GN[g]['code'],9),-GN[g]['pop'])):
        if not any(hav(gpt(g),gpt(q))<2.0 for q in out): out.append(g)
    return out
def fuzzy_decide(key):
    p,c=OUR[key]
    ids=[g for g in FBY.get(fold(c['city-fa']),[]) if amap.get(GN[g]['admin1'])==key[0]]
    ids=dedupe(ids)
    if len(ids)==1: return ids[0],'persian-folded'
    if len(ids)>1: return None,'persian-folded-ambiguous'
    en=lat(c['city-en'])
    sc=sorted(((max(difflib.SequenceMatcher(None,en,a).ratio(),difflib.SequenceMatcher(None,en,b).ratio()),g) for g,a,b in PROVG.get(key[0],[])),reverse=True)
    if not sc: return None,'none'
    top=[g for s,g in sc if s>=0.88]
    non_minor=[g for g in top if GN[g]['code'] not in SKIP_CLASSES]
    top=dedupe(non_minor or top)
    if len(top)>1 and all(hav(gpt(a),gpt(b))<=5 for a in top for b in top): top=top[:1]   # same place listed twice
    if len(top)==1: return top[0],'latin-fuzzy'
    return None,'latin-fuzzy-ambiguous' if len(top)>1 else 'none'
