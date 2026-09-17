# Alur source datasets — SIH26013

This package contains three independent source datasets, each with 169 records:

- Revenue: 169
- Survey: 169
- Municipality: 169

The parcel geometries and LRI location/survey identifiers are retained from the uploaded Karnataka LRI Alur GeoJSON.

Owner names, area values, and land-use values are SYNTHETIC DEMONSTRATION ATTRIBUTES. They are not claimed to be actual government records.

No unified parcel is included. The intended workflow is:

source records -> harmonization -> record linkage -> conflation -> conflict detection -> review -> unified parcel

GeoJSON files are suitable for map display. CSV files are convenient for tabular ingestion.
