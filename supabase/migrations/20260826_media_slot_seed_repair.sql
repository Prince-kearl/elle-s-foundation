-- Repair image-slot rows for projects where the original CMS seed was incomplete.
-- Run after the page_content CMS table exists. Existing assigned values are preserved.

insert into public.page_content (page, section, key, label, content_type, value, draft_value, position, status, published_at)
values
  ('home', 'hero', 'image', 'Hero Image', 'image', '', '', 0, 'published', now()),
  ('home', 'about', 'image', 'About Image', 'image', '', '', 1, 'published', now()),
  ('home', 'past_event', 'image', 'Past Event Image', 'image', '', '', 2, 'published', now()),
  ('home', 'volunteer', 'image', 'Volunteer Feature Image', 'image', '', '', 3, 'published', now()),
  ('home', 'stories', 'image_1', 'Story Image 1', 'image', '', '', 4, 'published', now()),
  ('home', 'stories', 'image_2', 'Story Image 2', 'image', '', '', 5, 'published', now()),
  ('home', 'stories', 'image_3', 'Story Image 3', 'image', '', '', 6, 'published', now()),
  ('about', 'hero', 'image', 'About Story Image', 'image', '', '', 0, 'published', now()),
  ('about', 'cta', 'image', 'About Decade Card Image', 'image', '', '', 1, 'published', now()),
  ('programs', 'header', 'image', 'Programs Header Image', 'image', '', '', 0, 'published', now())
on conflict (page, section, key) do nothing;

notify pgrst, 'reload schema';
