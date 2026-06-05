-- Bucket público para PDFs de certificados (path: {verification_hash}.pdf)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  true,
  5242880,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "certificate_pdfs_public_read" on storage.objects;
create policy "certificate_pdfs_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'certificates');
