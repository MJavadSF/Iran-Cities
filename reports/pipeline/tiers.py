from pipeline import *
import collections
R=5.0
def best_cluster(u):
    names=list(u); best=[]
    for n in names:
        cl=[m for m in names if hav(u[n][:2],u[m][:2])<=R]
        # require pairwise agreement inside the cluster
        cl=[m for m in cl if all(hav(u[m][:2],u[x][:2])<=R for x in cl)]
        if len(cl)>len(best): best=cl
    return best
TIER={}
for key,r in results.items():
    u=r['usable']
    if not u: TIER[key]=('nodata',None,[],[]); continue
    if len(u)==1:
        TIER[key]=('single',None,list(u),[]); continue
    cl=best_cluster(u); outside=[n for n in u if n not in cl]
    lic=[n for n in cl if n in ('A','B')]
    if len(cl)>=2 and lic and len(cl)>len(outside):
        src='A' if 'A' in cl else 'B'
        TIER[key]=('verified',src,cl,outside)
    else:
        TIER[key]=('conflict',None,cl,outside)
