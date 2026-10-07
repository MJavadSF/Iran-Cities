from gn import *
from tiers import results, seat_dist
amap=json.load(open('/tmp/geo/admin1_map.json',encoding='utf-8'))
R=5.0
ABANDONED={'PPLQ','PPLW','PPLH','PPLCH'}          # abandoned / destroyed / historical places
SEAT={'PPLA','PPLA2','PPLA3','PPLA4','PPLC'}      # administrative seats
rank={'PPLC':0,'PPLA':0,'PPLA2':1,'PPLA3':2,'PPLA4':3}
def gpt(g): return (GN[g]['lat'],GN[g]['lng'])
def citylike(g): G=GN[g]; return G['code'] in SEAT or G['pop']>=3000
def cands(key):
    pn,nn=key
    ids=[g for g in BYNAME.get(nn,[]) if amap.get(GN[g]['admin1'])==pn and GN[g]['code'] not in ABANDONED]
    out=[]
    for g in sorted(ids,key=lambda g:(rank.get(GN[g]['code'],9),-GN[g]['pop'])):
        if not any(hav(gpt(g),gpt(q))<2.0 for q in out): out.append(g)
    return out
def decide(key):
    cs=cands(key); oth={nm:v[:2] for nm,v in results[key]['usable'].items()}
    info={'ncand':len(cs)}
    if not cs: return ('none',None,info)
    chosen=None; how=''
    if len(cs)==1: chosen=cs[0]; how='unique-name'
    else:
        cl=[g for g in cs if citylike(g)]
        if len(cl)==1: chosen=cl[0]; how='only-city-like-candidate'
        else:
            co=[g for g in cs if any(hav(gpt(g),pt)<=R for pt in oth.values())]
            if len(co)==1: chosen=co[0]; how='only-source-corroborated-candidate'
            else: return ('ambiguous',None,{**info,'cands':cs})
    corro=[nm for nm,pt in oth.items() if hav(gpt(chosen),pt)<=R]
    contra={nm:round(hav(gpt(chosen),pt),1) for nm,pt in oth.items() if hav(gpt(chosen),pt)>R}
    cl=citylike(chosen)
    sd=seat_dist(key,gpt(chosen))
    info.update(how=how,corro=corro,contra=contra,citylike=cl,seat_km=None if sd is None else round(sd,1))
    if corro and len(corro)>=len(contra): return ('high',chosen,info)
    if cl and (sd is None or sd<=80): return ('medium',chosen,info)
    return ('low',chosen,info)
