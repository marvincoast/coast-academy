# 0006 — @react-pdf/renderer para certificado

- Status: Proposed
- Data: 2026-05-16

## Contexto

O certificado Empire Trading é um PDF gerado server-side com nome do aluno, nome do curso, data, QR de verificação e identidade visual da Empire (dourado, dark).

## Decisão

Usar **@react-pdf/renderer** dentro do `certificate-service` para compor o PDF com componentes React (`<Document>`, `<Page>`, `<View>`). QR gerado com `qrcode` e embutido como `<Image>`.

## Consequências

- ✅ Templating em JSX (familiar à equipe), versionado como código.
- ✅ Sem dependência de Chromium (Puppeteer pesa muito em container).
- ✅ Output determinístico, fácil de hashar (SHA-256) para `/verify/:hash`.
- ⚠️ Layouts complexos (CSS Grid avançado) são limitados.
- ⚠️ Fonts customizadas precisam ser carregadas explicitamente.

## Alternativas consideradas

- **Puppeteer**: gera PDF a partir de HTML/CSS arbitrário, mas imagem ~300MB, alto consumo de RAM.
- **PDFKit**: API imperativa, menos legível.

## Reabrir quando

Se precisarmos de gráficos vetoriais complexos, considerar Puppeteer só para o `certificate-service`.
