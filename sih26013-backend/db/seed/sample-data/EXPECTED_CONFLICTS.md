# Expected conflation outcomes for this sample data

Total source rows: revenue=34, survey=20, municipal=23 (grand total 77)

- Group A #1: parcel_id=101/2 expect OWNER_MISMATCH ("Ramesh Patil" vs "Suresh Patil")
- Group A #2: parcel_id=102/3 expect OWNER_MISMATCH ("Anita Patil" vs "Kavita Patil")
- Group A #3: parcel_id=103/4 expect OWNER_MISMATCH ("Mahesh Patil" vs "Sunita Patil")
- Group A #4: parcel_id=104/1 expect OWNER_MISMATCH ("Vijay Patil" vs "Prakash Patil")
- Group A #5: parcel_id=105/2 expect OWNER_MISMATCH ("Geeta Patil" vs "Rajesh Patil")
- Group B #1: parcel_id=106/3 expect AREA_MISMATCH (1296 sqm vs 1749.6 sqm)
- Group B #2: parcel_id=107/4 expect AREA_MISMATCH (1296 sqm vs 1749.6 sqm)
- Group B #3: parcel_id=108/1 expect AREA_MISMATCH (1296 sqm vs 1749.6 sqm)
- Group B #4: parcel_id=109/2 expect AREA_MISMATCH (1296 sqm vs 1749.6 sqm)
- Group B #5: parcel_id=110/3 expect AREA_MISMATCH (1296 sqm vs 1749.6 sqm)
- Group C #1: revenue=111/4 / survey=SVY-2010, ~3m apart, expect CLEAN geometry-based merge
- Group C #2: revenue=112/1 / survey=SVY-2011, ~3m apart, expect CLEAN geometry-based merge
- Group C #3: revenue=113/2 / survey=SVY-2012, ~3m apart, expect CLEAN geometry-based merge
- Group C #4: revenue=114/3 / survey=SVY-2013, ~3m apart, expect CLEAN geometry-based merge
- Group C #5: revenue=115/4 / survey=SVY-2014, ~3m apart, expect CLEAN geometry-based merge
- Group D #1: revenue=116/1 / survey=SVY-3015, geometry-linked, expect OWNER_MISMATCH
- Group D #2: revenue=117/2 / survey=SVY-3016, geometry-linked, expect OWNER_MISMATCH
- Group D #3: revenue=118/3 / survey=SVY-3017, geometry-linked, expect OWNER_MISMATCH
- Group D #4: revenue=119/4 / survey=SVY-3018, geometry-linked, expect OWNER_MISMATCH
- Group E #1: revenue+municipal id=120/1 + survey=SVY-4019 -> 3-way merge, AREA_MISMATCH + OWNER_MISMATCH expected
- Group E #2: revenue+municipal id=121/2 + survey=SVY-4020 -> 3-way merge, AREA_MISMATCH + OWNER_MISMATCH expected
- Group E #3: revenue+municipal id=122/3 + survey=SVY-4021 -> 3-way merge, AREA_MISMATCH + OWNER_MISMATCH expected
- Group I #1: parcel_id=131/4 expect GEOMETRY_CONFLICT (municipal footprint much larger & offset)
- Group I #2: parcel_id=132/1 expect GEOMETRY_CONFLICT (municipal footprint much larger & offset)
- Group I #3: parcel_id=133/2 expect GEOMETRY_CONFLICT (municipal footprint much larger & offset)
- Group I #4: parcel_id=134/3 expect GEOMETRY_CONFLICT (municipal footprint much larger & offset)
