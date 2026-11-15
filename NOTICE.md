# Attribution / منابع و مجوز داده‌ها

Coordinates (`lat`/`lng`) in `src/data.json` are point locations from **GeoNames** (https://www.geonames.org),
licensed under **Creative Commons Attribution 4.0** (CC BY 4.0). Attribution to GeoNames is required.

- Source file: GeoNames Iran dump `IR.zip` (https://download.geonames.org/export/dump/IR.zip), supplied by the package author on 2026-10-07.
- The 31 provincial-capital coordinates were supplied by the package author (Wikipedia table), cross-checked against GeoNames;
  two were corrected (Ahvaz, Kermanshah).
- Each city was matched to a GeoNames populated place by normalized Persian name within the same province
  (province mapped through GeoNames admin1 codes), with a Latin-name fallback. Abandoned/destroyed/historical places were excluded.

The following public datasets were used **only to cross-check the match** (no values were copied from them unless they equal the GeoNames value):

| Dataset | Used for | License |
|---|---|---|
| sajaddp/list-of-cities-in-Iran | cross-check; official county seats (GeoNames-derived) | repo: GPL-3.0; coordinate records: CC BY 4.0 (GeoNames) |
| dr5hn/countries-states-cities-database | cross-check only | ODbL-1.0 |
| jafaripur/iran-locality-database | cross-check only | none stated |
| mhndev/iran-geography | cross-check only | none stated |

This is a summary, not legal advice.

## Province boundaries and neighbors

`src/boundaries.json` (published as `@code-plate/iran-cities/boundaries` and `data/iran-provinces.geojson`) is derived from
**geoBoundaries** `IRN-ADM1` (https://www.geoboundaries.org), which is based on **OpenStreetMap** data
(© OpenStreetMap contributors, https://www.openstreetmap.org/copyright).

- License of this boundary data: **Open Database License 1.0** (ODbL-1.0, https://opendatacommons.org/licenses/odbl/1-0/).
  If you redistribute the boundaries, or a database derived from them, you must keep this attribution and offer it under ODbL.
  The rest of the package is not affected: the code is MIT and the coordinates are CC BY 4.0.
- Changes made: provinces were merged into one feature each; a polygon around Bandar-e Gaz that the source labels
  Mazandaran was reassigned to Golestan (Bandar-e Gaz county has belonged to Golestan since 1997); geometry was
  simplified with a shared-edge (coverage) simplification at a 0.01° tolerance and rounded to 4 decimals.
  The script is `scripts/geo/build-boundaries.py`.
- The `neighbors` of each province are computed from these boundaries (a shared border of at least 3 km). They were
  cross-checked against Natural Earth (public domain), which predates the 2013 move of Tabas county from Yazd to
  South Khorasan; geoBoundaries reflects the current borders.
