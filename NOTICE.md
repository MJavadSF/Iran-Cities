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
