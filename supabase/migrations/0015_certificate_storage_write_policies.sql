-- Garante escrita no bucket certificates (service role + uploads do certificate-service)

drop policy if exists "certificate_pdfs_service_write" on storage.objects;

create policy "certificate_pdfs_service_write"

  on storage.objects

  for all

  to service_role

  using (bucket_id = 'certificates')

  with check (bucket_id = 'certificates');



drop policy if exists "certificate_pdfs_authenticated_insert" on storage.objects;

create policy "certificate_pdfs_authenticated_insert"

  on storage.objects

  for insert

  to authenticated

  with check (bucket_id = 'certificates');



drop policy if exists "certificate_pdfs_authenticated_update" on storage.objects;

create policy "certificate_pdfs_authenticated_update"

  on storage.objects

  for update

  to authenticated

  using (bucket_id = 'certificates')

  with check (bucket_id = 'certificates');


