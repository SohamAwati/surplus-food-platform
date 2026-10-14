-- Spatial indexes for PostGIS geography columns.
-- These support efficient spatial filtering and distance queries.

CREATE INDEX "outlets_location_gist_idx"
ON "outlets"
USING GIST ("location");

CREATE INDEX "need_zones_location_gist_idx"
ON "need_zones"
USING GIST ("location");
