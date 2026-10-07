import json, csv, re, math
def norm(s):
    s=(s or '').replace('ي','ی').replace('ك','ک').replace('ۀ','ه').replace('ة','ه')
    s=re.sub(r'[\u064B-\u065F\u0670]','',s)  # harakat
    return re.sub(r'[\u200c\s\-\u200f\u200e]+','',s.strip().lower())
def hav(a,b):
    R=6371.0
    p1,p2=math.radians(a[0]),math.radians(b[0])
    dphi=p2-p1; dl=math.radians(b[1]-a[1])
    h=math.sin(dphi/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(h))
def jl(p):
    t=open(p,encoding='utf-8',errors='replace').read()
    t=re.sub(r',\s*([\]}])',r'\1',t)  # tolerate trailing commas in third-party files
    return json.loads(t)

ours=jl('/home/claude/work/src/data.json')
OUR={}   # (prov_norm, name_norm) -> city dict
PROV={}  # prov_norm -> province dict
for p in ours:
    pn=norm(p['province-fa']); PROV[pn]=p
    for c in p['cities']:
        OUR[(pn,norm(c['city-fa']))]=(p,c)

NULLS={}
def add(d,pn,name,lat,lng,meta):
    if lat in (None,'') or lng in (None,''):
        NULLS[meta[0]]=NULLS.get(meta[0],0)+1; return
    d.setdefault((pn,norm(name)),[]).append((float(lat),float(lng),meta))

# ---- A: sajaddp (GeoNames-derived county seats + capitals)
A={}
base='/tmp/ds/list-of-cities-in-Iran/dist/json/'
provA={p['id']:norm(p['name']) for p in jl(base+'provinces.json')}
for r in jl(base+'county-centers.json'):
    add(A,provA[r['province_id']],r['center_name'],r['latitude'],r['longitude'],('county-center',r['source_feature_id'],r['source_name']))
for r in jl(base+'province-capitals.json'):
    add(A,provA[r['province_id']],r['center_name'],r['latitude'],r['longitude'],('capital',r['source_feature_id'],r['source_name']))

# ---- B: dr5hn
B={}
states={r['iso2']:norm(r['native']) for r in csv.DictReader(open('/tmp/dr5/csv/states.csv',encoding='utf-8')) if r['country_code']=='IR'}
Bskip=0
for r in jl('/tmp/dr5/contributions/cities/IR.json'):
    fa=(r.get('translations') or {}).get('fa')
    if not fa: Bskip+=1; continue
    add(B,states[r['state_code']],fa,r['latitude'],r['longitude'],(r['type'],r['id'],r['name']))

# ---- C: jafaripur
C={}
pc={p['id']:norm(p['name']) for p in jl('/tmp/ds/iran-locality-database/JSON/province.json')}
for r in jl('/tmp/ds/iran-locality-database/JSON/city.json'):
    add(C,pc[r['province']],r['name'],r['latitude'],r['longitude'],('c',r['id'],r['name']))

# ---- D: mhndev
D={}
pd_={p['id']:norm(p['title']) for p in jl('/tmp/ds/iran-geography/province.json')}
for r in jl('/tmp/ds/iran-geography/cities.json'):
    add(D,pd_[r['province_id']],r['title'],r['latitude'],r['longitude'],('d',r['id'],r['slug']))
