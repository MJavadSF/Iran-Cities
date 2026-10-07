from latin import *
def decide2(key):
    r=decide(key)
    if r[0]!='none': return r+('persian-name',)
    g,how=latin_decide(key)
    if g is None: return ('none',None,{'latin':how},'-')
    oth={nm:v[:2] for nm,v in results[key]['usable'].items()}
    corro=[nm for nm,pt in oth.items() if hav(gpt(g),pt)<=R]
    contra={nm:round(hav(gpt(g),pt),1) for nm,pt in oth.items() if hav(gpt(g),pt)>R}
    cl=citylike(g); sd=seat_dist(key,gpt(g))
    info=dict(how='latin-'+how,corro=corro,contra=contra,citylike=cl,seat_km=None if sd is None else round(sd,1),ncand=1)
    if corro and len(corro)>=len(contra): return ('high',g,info,'latin-name')
    if cl and (sd is None or sd<=80) and not contra: return ('medium',g,info,'latin-name')
    return ('low',g,info,'latin-name')
