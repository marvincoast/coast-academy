# Certificate Service

Emissão, verificação pública e PDF de certificados Coast Academy.

## Storage de PDF

| Provider                   | Env                                     | Bucket                                                 |
| -------------------------- | --------------------------------------- | ------------------------------------------------------ |
| **Appwrite** (recomendado) | `CERTIFICATE_STORAGE_PROVIDER=appwrite` | `APPWRITE_CERT_BUCKET_ID=S3cert`                       |
| Supabase                   | `CERTIFICATE_STORAGE_PROVIDER=supabase` | `SUPABASE_CERT_BUCKET_ID` (`certificates` ou `S3cert`) |

### Appwrite (bucket `S3cert`)

1. No console Appwrite → **Storage** → bucket **S3cert**.
2. Permissões do bucket: leitura para `Any` (ou `Users`) se quiser link público de visualização.
3. Crie uma **API Key** com escopo `files.write` (e `files.read` se necessário).
4. Preencha no `.env.local`:

```env
CERTIFICATE_STORAGE_PROVIDER=appwrite
APPWRITE_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=<id do projeto>
APPWRITE_API_KEY=<chave servidor>
APPWRITE_CERT_BUCKET_ID=S3cert
```

O `pdf_storage_path` no banco fica como `appwrite:S3cert:<fileId>`.

### Supabase (`certificates` ou `S3cert`)

Defina `SUPABASE_CERT_BUCKET_ID` igual ao bucket que você vê no Studio (ex.: `S3cert`).

1. Aplique as migrations (`0014`–`0016` — corrige limite 0 bytes no S3cert):

```bash
supabase db push
# ou, stack local: supabase migration up
```

2. No `.env.local` do Docker:

```env
CERTIFICATE_STORAGE_PROVIDER=supabase
SUPABASE_CERT_BUCKET_ID=S3cert
SUPABASE_URL=http://kong:8000          # container na rede supabase
SUPABASE_SERVICE_ROLE_KEY=<service_role>
SUPABASE_PUBLIC_URL=http://127.0.0.1:54321   # URL pública dos PDFs no browser
```

Se o `certificate-service` **não** estiver na rede Docker do Supabase, use:

```env
SUPABASE_URL=http://host.docker.internal:54321
```

3. Conecte o container à rede Supabase: `./infra/scripts/connect-supabase-network.sh`

4. Após emitir, confira **Storage → S3cert** (ou o bucket configurado). Se vazio, veja os logs:

```bash
docker logs coast-academy-certificate 2>&1 | grep -i "upload\|bucket"
```

O serviço cria o bucket automaticamente se faltar e tenta reenviar PDF ao abrir `/certificados`.

### Download

- `GET /api/certificates/:id/pdf` — sempre funciona (gera na hora, com auth).
- `pdfUrl` na API — link público Appwrite ou Supabase, quando o upload ok.

## Endpoints

- `POST /api/certificates/issue` — emitir (Prova Final aprovada)
- `GET /api/certificates/me` — listar meus certificados
- `GET /api/certificates/:id/pdf` — baixar PDF
- `GET /verify/:hash` — verificação pública
