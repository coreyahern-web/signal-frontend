-- Add enrichment fields to knowledge_entries
-- These columns match the updated Claude extraction prompt

ALTER TABLE knowledge_entries
  ADD COLUMN IF NOT EXISTS one_thing_to_steal text,
  ADD COLUMN IF NOT EXISTS brand_relevance jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS time_to_implement text,
  ADD COLUMN IF NOT EXISTS content_type text,
  ADD COLUMN IF NOT EXISTS transcript_failed boolean DEFAULT false;

-- Optional: add a check constraint for difficulty enum
ALTER TABLE knowledge_entries
  ADD CONSTRAINT knowledge_entries_difficulty_check
  CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced'));

-- Optional: add a check constraint for content_type enum
ALTER TABLE knowledge_entries
  ADD CONSTRAINT knowledge_entries_content_type_check
  CHECK (content_type IS NULL OR content_type IN ('tutorial', 'opinion', 'case-study', 'product-demo', 'strategy'));
