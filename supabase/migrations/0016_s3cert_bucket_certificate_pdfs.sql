-- Bucket S3cert (criado manualmente no Studio) — corrige limite 0 bytes e políticas

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)

values (

  'S3cert',

  'S3cert',

  true,

  5242880,

  array['application/pdf']::text[]

)

on conflict (id) do update set

  public = excluded.public,

  file_size_limit = excluded.file_size_limit,

  allowed_mime_types = excluded.allowed_mime_types;



drop policy if exists "s3cert_pdfs_public_read" on storage.objects;

create policy "s3cert_pdfs_public_read"

  on storage.objects

  for select

  to public

  using (bucket_id = 'S3cert');



drop policy if exists "s3cert_pdfs_service_write" on storage.objects;

create policy "s3cert_pdfs_service_write"

  on storage.objects

  for all

  to service_role

  using (bucket_id = 'S3cert')

  with check (bucket_id = 'S3cert');


