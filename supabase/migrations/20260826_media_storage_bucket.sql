-- Elle's Foundation public media storage
-- Run this in the Supabase SQL Editor if uploads report "Bucket not found".
-- The script is idempotent and creates the exact bucket used by src/lib/storage.ts.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  104857600,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
  ]::text[]
)
on conflict (id) do update
set public = true,
    file_size_limit = 104857600,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public read is required because the public site renders the returned URLs.
drop policy if exists "Public can view media files" on storage.objects;
create policy "Public can view media files"
on storage.objects for select
to public
using (bucket_id = 'media');

-- Only admins and editors can add or manage site media.
drop policy if exists "Admins and editors upload media files" on storage.objects;
create policy "Admins and editors upload media files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media'
  and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
);

drop policy if exists "Admins and editors update media files" on storage.objects;
create policy "Admins and editors update media files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'media'
  and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
)
with check (
  bucket_id = 'media'
  and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
);

drop policy if exists "Admins and editors delete media files" on storage.objects;
create policy "Admins and editors delete media files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media'
  and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
);

notify pgrst, 'reload schema';
