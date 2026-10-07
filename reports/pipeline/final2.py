from fuzzy import *
def score(key,g,meth):
    oth={nm:v[:2] for nm,v in results[key]['usable'].items()}
    dists={nm:hav(gpt(g),pt) for nm,pt in oth.items()}
    corro=[nm for nm,x in dists.items() if x<=R]; contra={nm:round(x,1) for nm,x in dists.items() if x>R}
    cl=citylike(g); sd=seat_dist(key,gpt(g)); mc=max(contra.values()) if contra else 0
    info=dict(how=meth,corro=corro,contra=contra,citylike=cl,seat_km=None if sd is None else round(sd,1))
    if sd is not None and sd>100: return ('skip',g,{**info,'why':f'{sd:.0f} km from linked county seat'})
    if mc>=90 and (sd is None or sd>20): return ('skip',g,{**info,'why':f'contradicted by another source ({mc:.0f} km) and not supported by county seat'})
    if meth.startswith('latin') and lsim(key,g)<0.7: return ('skip',g,{**info,'why':'Latin name too different'})
    if corro and len(corro)>=len(contra): return ('high',g,info)
    if cl and (sd is None or sd<=80) and mc<=15: return ('medium',g,info)
    return ('low',g,info)
def final2(key):
    r=decide2(key)
    tier,g,info,meth=r
    if tier in ('high','medium'): return (tier,g,info,meth)
    if tier=='low': t=score(key,g,info['how']); return (t[0],t[1],t[2],meth)
    if tier=='ambiguous':
        g2,why=resolve_ambiguous(key)
        if g2 is None: return ('unresolved',None,{'why':why,'cands':info.get('cands',[])},'persian-name')
        t=score(key,g2,'ambiguous:'+why); return (t[0],t[1],t[2],'persian-name')
    g2,how=fuzzy_decide(key)
    if g2 is None: return ('unresolved',None,{'why':how},'-')
    t=score(key,g2,how)
    tier=t[0]
    if tier=='medium': tier='low'   # fuzzy Latin names are never better than 'low' without corroboration
    return (tier,t[1],t[2],how)
