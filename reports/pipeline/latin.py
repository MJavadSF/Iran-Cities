from decide import *
import unicodedata
def lat(s):
    s=unicodedata.normalize('NFKD',s); s=''.join(ch for ch in s if not unicodedata.combining(ch))
    s=s.lower().replace("’","").replace("'","").replace("`","")
    return re.sub(r'[^a-z]','',s)
LAT=collections.defaultdict(list)
for g,G in GN.items():
    if G['fc']!='P' or G['code'] in ABANDONED: continue
    ks={lat(G['ascii']),lat(G['name'])}|{lat(a) for a in G['alts'] if not FA.search(a)}
    for k in ks:
        if k: LAT[k].append(g)
def latin_decide(key):
    p,c=OUR[key]; k=lat(c['city-en'])
    ids=[g for g in LAT.get(k,[]) if amap.get(GN[g]['admin1'])==key[0]]
    out=[]
    for g in sorted(ids,key=lambda g:(rank.get(GN[g]['code'],9),-GN[g]['pop'])):
        if not any(hav(gpt(g),gpt(q))<2.0 for q in out): out.append(g)
    if len(out)==1: return out[0],'unique'
    cl=[g for g in out if citylike(g)]
    if len(out)>1 and len(cl)==1: return cl[0],'only-city-like'
    return None,('none' if not out else 'ambiguous')
