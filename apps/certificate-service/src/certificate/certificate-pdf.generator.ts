import PDFDocument from 'pdfkit';



type PdfKitDocument = InstanceType<typeof PDFDocument>;



/** Alinhado ao CertificatePreviewCard / design tokens Coast Academy */

const COLORS = {

  bgBase: '#0B0F14',

  gold: '#C9A227',

  goldSoft: '#E5C66B',

  goldIconBg: '#1a252f',

  textPrimary: '#F4F6FA',

  textMuted: '#6E7787',

  textSecondary: '#A6B0BF',

  borderSubtle: '#2a3544',

} as const;



export interface CertificatePdfInput {

  fullName: string;

  courseTitle: string;

  issuedAt: string;

  verificationHash: string;

  verifyUrl: string;

  issuerName: string;

  qrPngBuffer: Buffer;

}



function formatIssuedDate(iso: string): string {

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString('pt-BR', {

    day: '2-digit',

    month: 'long',

    year: 'numeric',

  });

}



function fillPageBackground(doc: PdfKitDocument): void {

  const { width, height } = doc.page;

  doc.rect(0, 0, width, height).fill(COLORS.bgBase);

}



function drawGoldFrame(doc: PdfKitDocument): void {

  const { width, height } = doc.page;

  const m = 28;

  doc.save();

  doc.lineWidth(1.5).strokeColor(COLORS.gold);

  doc.roundedRect(m, m, width - m * 2, height - m * 2, 8).stroke();

  doc.lineWidth(0.5).strokeColor(COLORS.gold).opacity(0.35);

  doc.roundedRect(m + 5, m + 5, width - (m + 5) * 2, height - (m + 5) * 2, 6).stroke();

  doc.opacity(1);

  doc.restore();

}



function drawTopAccent(doc: PdfKitDocument): void {

  const { width } = doc.page;

  doc.save();

  doc.lineWidth(2).strokeColor(COLORS.gold).opacity(0.85);

  doc.moveTo(width * 0.2, 36).lineTo(width * 0.8, 36).stroke();

  doc.opacity(1);

  doc.restore();

}



/** Ícone medalha (equivalente ao Award do preview) */

function drawAwardIcon(doc: PdfKitDocument, cx: number, cy: number, box: number): void {

  const half = box / 2;

  doc.save();

  doc.roundedRect(cx - half, cy - half, box, box, 6).fillAndStroke(COLORS.goldIconBg, COLORS.gold);

  doc.circle(cx, cy - 2, 7).fill(COLORS.gold);

  doc

    .moveTo(cx - 10, cy + 6)

    .lineTo(cx, cy + 14)

    .lineTo(cx + 10, cy + 6)

    .lineWidth(1.2)

    .strokeColor(COLORS.gold)

    .stroke();

  doc.restore();

}



/** Gera PDF A4 retrato com o mesmo visual escuro da prévia web. */

export function generateCertificatePdfBuffer(input: CertificatePdfInput): Promise<Buffer> {

  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({

      size: 'A4',

      layout: 'portrait',

      margin: 0,

      info: {

        Title: `Certificado Coast Academy — ${input.fullName}`,

        Author: input.issuerName,

      },

    });



    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.on('error', reject);



    fillPageBackground(doc);

    drawGoldFrame(doc);

    drawTopAccent(doc);



    const { width } = doc.page;

    const centerOpts = { align: 'center' as const, width };



    let y = 72;

    const iconSize = 44;

    drawAwardIcon(doc, width / 2, y + iconSize / 2, iconSize);

    y += iconSize + 20;



    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.gold);

    doc.text('COAST ACADEMY', 0, y, { ...centerOpts, characterSpacing: 2.5 });

    y += 14;



    doc.font('Helvetica').fontSize(9).fillColor(COLORS.textMuted);

    doc.text('Certificado de conclusão', 0, y, centerOpts);

    y += 36;



    doc.font('Helvetica').fontSize(8).fillColor(COLORS.textMuted);

    doc.text('CERTIFICAMOS QUE', 0, y, { ...centerOpts, characterSpacing: 1 });

    y += 22;



    doc.font('Helvetica-Bold').fontSize(28).fillColor(COLORS.textPrimary);

    doc.text(input.fullName, 48, y, { align: 'center', width: width - 96 });

    y += doc.heightOfString(input.fullName, { width: width - 96 }) + 20;



    doc.font('Helvetica').fontSize(11).fillColor(COLORS.textSecondary);

    doc.text('concluiu com êxito o curso', 0, y, centerOpts);

    y += 20;



    doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.goldSoft);

    doc.text(input.courseTitle, 56, y, {

      align: 'center',

      width: width - 112,

    });

    y += doc.heightOfString(input.courseTitle, { width: width - 112 }) + 24;



    doc.font('Helvetica').fontSize(10).fillColor(COLORS.textMuted);

    doc.text(`Emitido em ${formatIssuedDate(input.issuedAt)}`, 0, y, centerOpts);



    const footerY = doc.page.height - 130;

    doc.moveTo(56, footerY).lineTo(width - 56, footerY).lineWidth(0.5).strokeColor(COLORS.borderSubtle).stroke();



    const qrSize = 72;

    const qrX = width - 56 - qrSize;

    const qrY = footerY + 14;

    doc.image(input.qrPngBuffer, qrX, qrY, { width: qrSize, height: qrSize });



    const leftX = 56;

    const leftW = qrX - leftX - 16;

    let footTextY = footerY + 18;



    doc.font('Helvetica').fontSize(7).fillColor(COLORS.textMuted);

    doc.text('EMITIDO POR', leftX, footTextY, { width: leftW, characterSpacing: 0.8 });

    footTextY += 11;



    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.textSecondary);

    doc.text(input.issuerName, leftX, footTextY, { width: leftW });

    footTextY += 18;



    doc.font('Helvetica').fontSize(7).fillColor(COLORS.textMuted);

    doc.text(`${input.verificationHash.slice(0, 24)}…`, leftX, footTextY, { width: leftW });



    doc.font('Helvetica').fontSize(7).fillColor(COLORS.textMuted);

    doc.text(input.verifyUrl, 56, doc.page.height - 48, {

      align: 'center',

      width: width - 112,

      link: input.verifyUrl,

    });



    doc.end();

  });

}


