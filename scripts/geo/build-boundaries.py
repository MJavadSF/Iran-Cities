import json
import re
import sys
import urllib.request

import shapely
from shapely.geometry import Point, mapping, shape
from shapely.ops import unary_union

SOURCE = 'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/IRN/ADM1/geoBoundaries-IRN-ADM1.geojson'
TOLERANCE = 0.01
PRECISION = 4
MIN_SHARED_BORDER_KM = 3


def slug(name):
    return re.sub(r'[^a-z]+', '-', name.lower()).strip('-')


def main(data_path, output_path, neighbors_path):
    data = json.load(open(data_path, encoding='utf-8'))
    source = json.load(urllib.request.urlopen(SOURCE))
    parts = {}
    for feature in source['features']:
        key = slug(feature['properties']['shapeName'])
        geometry = shape(feature['geometry']).buffer(0)
        if key == 'mazandaran' and geometry.bounds[0] > 53.8 and geometry.area < 0.1:
            key = 'golestan'
        parts.setdefault(key, []).append(geometry)

    order = [p['province-en'] for p in data]
    merged = [unary_union(parts[key]) for key in order]
    simplified = shapely.coverage_simplify(merged, TOLERANCE)
    simplified = [shapely.set_precision(g, 10 ** -PRECISION).buffer(0) for g in simplified]

    features = []
    for province, geometry in zip(data, simplified):
        features.append({
            'type': 'Feature',
            'id': province['province-id'],
            'properties': {'id': province['province-id'], 'en': province['province-en'], 'fa': province['province-fa']},
            'geometry': mapping(geometry),
        })
    text = json.dumps({'type': 'FeatureCollection', 'features': features}, separators=(',', ':'), ensure_ascii=False)
    text = re.sub(r'(\d+\.\d{%d})\d+' % PRECISION, r'\1', text)
    open(output_path, 'w', encoding='utf-8').write(text)

    ids = [p['province-id'] for p in data]
    neighbors = {i: [] for i in ids}
    for a in range(len(ids)):
        for b in range(a + 1, len(ids)):
            if simplified[a].intersection(simplified[b]).length * 111 >= MIN_SHARED_BORDER_KM:
                neighbors[ids[a]].append(ids[b])
                neighbors[ids[b]].append(ids[a])
    json.dump({k: sorted(v) for k, v in neighbors.items()}, open(neighbors_path, 'w'), indent=1)

    outside = 0
    for province, geometry in zip(data, simplified):
        for city in province['cities']:
            if 'lat' in city and not geometry.buffer(0.05).contains(Point(city['lng'], city['lat'])):
                outside += 1
                print('outside its province:', province['province-en'], city['city-en'])
    print(f'{len(features)} provinces, {len(text)} bytes, {outside} cities outside')


if __name__ == '__main__':
    main(*sys.argv[1:4])
