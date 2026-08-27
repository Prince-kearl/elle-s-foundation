-- Allow custom webfont uploads in the existing public media bucket.
-- Safe to run repeatedly in the Supabase SQL Editor.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg',
  'font/woff2', 'font/woff', 'font/ttf', 'font/otf',
  'application/font-woff', 'application/x-font-ttf', 'application/vnd.ms-opentype'
]::text[]
where id = 'media';
