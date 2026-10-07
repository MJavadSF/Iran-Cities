from final import *
import difflib, pipeline
SKIP_CLASSES={'PPLX','PPLQ','PPLF','PPLW','PPLH'}
def lsim(key,g):
    en=lat(OUR[key][1]['city-en']); G=GN[g]
    return max(difflib.SequenceMatcher(None,en,lat(G['ascii'])).ratio(),difflib.SequenceMatcher(None,en,lat(G['name'])).ratio())
def a_points(key):
    return [pt[:2] for nm,pt in results[key]['usable'].items() if nm=='A']
def resolve_ambiguous(key):
    cs=cands(key)
    if len(cs)<2: return None,'n/a'
    picks={}
    # R1: exactly one candidate sits on the official (GeoNames) county-seat point
    ap=a_points(key)
    if ap:
        near=[g for g in cs if hav(gpt(g),ap[0])<=0.5]; far=[g for g in cs if g not in near and hav(gpt(g),ap[0])<1.5]
        if len(near)==1 and not far: picks['R1-on-county-seat-point']=near[0]
    # R2: clearly the closest to the linked county seat
    sd={g:seat_dist(key,gpt(g)) for g in cs}
    if all(v is not None for v in sd.values()):
        o=sorted(cs,key=lambda g:sd[g])
        if sd[o[0]]<=30 and sd[o[1]]>=2.5*max(sd[o[0]],1): picks['R2-closest-to-county-seat']=o[0]
    # R3: all candidates (ignoring minor-section classes) are within 5km of each other -> same place listed twice
    real=[g for g in cs if GN[g]['code'] not in SKIP_CLASSES] or cs
    if len(real)>=2 and all(hav(gpt(a),gpt(b))<=5 for a in real for b in real):
        best=sorted(real,key=lambda g:(0 if GN[g]['code'] in SEAT else 1,-GN[g]['pop']))[0]
        picks['R3-same-place-cluster']=best
    # R4: a single administrative-seat candidate that another source corroborates
    oth={nm:v[:2] for nm,v in results[key]['usable'].items()}
    seats=[g for g in cs if GN[g]['code'] in SEAT]
    if len(seats)==1 and any(hav(gpt(seats[0]),pt)<=R for pt in oth.values()): picks['R4-single-admin-seat']=seats[0]
    # R5: exactly one candidate is a populated place of any size
    pop=[g for g in cs if GN[g]['pop']>=1000]; rest=[g for g in cs if g not in pop]
    if len(pop)==1 and all(GN[g]['pop']<100 for g in rest): picks['R5-sole-populated']=pop[0]
    # R6: exactly one candidate whose primary name equals the Latin name exactly
    ex=[g for g in cs if lat(GN[g]['ascii'])==lat(OUR[key][1]['city-en']) or lat(GN[g]['name'])==lat(OUR[key][1]['city-en'])]
    if len(ex)==1: picks['R6-exact-latin-name']=ex[0]
    chosen=set(picks.values())
    if len(chosen)!=1: return None,('conflicting rules '+str(sorted(picks)) if len(chosen)>1 else 'no rule applies')
    g=next(iter(chosen)); return g,'+'.join(sorted(picks))
