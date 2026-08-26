-- Remove legacy demo statistics that were previously seeded into the public
-- stats table and can appear alongside the current foundation CMS metrics.
-- This targets only the known duplicate/demo value-label pairs; it does not
-- truncate the table or remove administrator-created content.

delete from public.stats
where (value, lower(label)) in (
  ('800', 'children supported'),
  ('5', 'communities reached'),
  ('1500', 'meals served'),
  ('25+', 'volunteers'),
  ('3', 'projects completed')
);

notify pgrst, 'reload schema';
