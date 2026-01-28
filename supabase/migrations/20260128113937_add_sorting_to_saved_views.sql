-- Add sorting column to saved_views table to store table sorting state
-- The sorting column stores TanStack Table's SortingState as JSONB
-- Example: [{"id": "composite_risk", "desc": true}]

ALTER TABLE saved_views ADD COLUMN sorting JSONB DEFAULT '[]';

-- Add comment to document the column
COMMENT ON COLUMN saved_views.sorting IS 'Stores table sorting state as array of {id: string, desc: boolean} objects';
