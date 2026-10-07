import csv, collections, re, json
from load import norm, hav, jl, OUR, PROV, A, B, C, D, ours
FA=re.compile(r'[\u0600-\u06ff]')
GN={}          # geonameid -> row dict
BYNAME=collections.defaultdict(list)   # (norm persian name) -> [geonameid]
for r in csv.reader(open('/tmp/geoir/IR.txt',encoding='utf-8'),delimiter='\t',quoting=csv.QUOTE_NONE):
    gid=int(r[0]); row=dict(id=gid,name=r[1],ascii=r[2],lat=float(r[4]),lng=float(r[5]),fc=r[6],code=r[7],admin1=r[10],pop=int(r[14] or 0),alts=r[3].split(','))
    GN[gid]=row
    if row['fc']=='P':
        seen=set()
        for a in row['alts']:
            if FA.search(a):
                k=norm(a)
                if k and k not in seen: seen.add(k); BYNAME[k].append(gid)
