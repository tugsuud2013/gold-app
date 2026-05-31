import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { join } from 'path';

interface PurchaseContractData {
  id: string;
  amountGrams: number | string;
  pricePerGram: number | string;
  totalAmountMnt: number | string;
}

interface UserContractData {
  fullName: string;
  registerNumber: string;
  phoneNumber: string;
  signatureImageUrl?: string | null;
}

@Injectable()
export class ContractService {
  async generateContract(
    purchaseData: PurchaseContractData,
    userData: UserContractData,
  ): Promise<string> {
    const outputPath = join(
      process.cwd(),
      'uploads',
      'contracts',
      `${purchaseData.id}.pdf`,
    );

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = createWriteStream(outputPath);

      stream.on('finish', () => resolve());
      stream.on('error', reject);
      doc.on('error', reject);

      doc.pipe(stream);
      doc.fontSize(18).text('АЛТ ХУДАЛДАН АВАХ ГЭРЭЭ', { align: 'center' });
      doc.moveDown();
      doc
        .fontSize(11)
        .text(`Гэрээний дугаар: AUTO-${purchaseData.id.slice(0, 8)}`);
      doc.text(`Огноо: ${new Date().toLocaleDateString('mn-MN')}`);
      doc.moveDown();

      doc.fontSize(12).text('Худалдан авагчийн мэдээлэл');
      doc
        .fontSize(11)
        .text(`Овог нэр: ${userData.fullName}`)
        .text(`Регистр: ${userData.registerNumber}`)
        .text(`Утас: ${userData.phoneNumber}`);
      doc.moveDown();

      doc.fontSize(12).text('Худалдан авалтын мэдээлэл');
      doc
        .fontSize(11)
        .text(`Хэмжээ (грамм): ${purchaseData.amountGrams}`)
        .text(`Нэгж үнэ (MNT): ${purchaseData.pricePerGram}`)
        .text(`Нийт дүн (MNT): ${purchaseData.totalAmountMnt}`);
      doc.moveDown();

      doc
        .fontSize(11)
        .text('1. Худалдан авагч төлбөр бүрэн төлсний дараа алтны өмчлөх эрх үүснэ.')
        .moveDown(0.4)
        .text('2. Гэрээний нөхцөлийг талууд мөрдөж, шаардлагатай тохиолдолд нэмэлтээр баталгаажуулна.')
        .moveDown(0.4)
        .text('3. Маргаан гарвал Монгол Улсын хууль тогтоомжийн дагуу шийдвэрлэнэ.');
      doc.moveDown();

      doc.fontSize(11).text('Гарын үсэг:');
      if (userData.signatureImageUrl) {
        const signaturePath = join(process.cwd(), userData.signatureImageUrl.replace(/^\//, ''));
        doc.image(signaturePath, 60, doc.y + 10, { width: 150, height: 70 });
      }

      doc.text('QR: (түр байрлал)', 430, 730);
      doc.end();
    });

    return outputPath;
  }

  async addQrCodeToPdf(pdfPath: string, qrCodeDataUrl: string): Promise<string> {
    const qrBase64 = qrCodeDataUrl.includes(',')
      ? qrCodeDataUrl.split(',')[1]
      : qrCodeDataUrl;
    const qrBuffer = Buffer.from(qrBase64, 'base64');
    const qrImagePath = pdfPath.replace('.pdf', '.qr.png');
    await writeFile(qrImagePath, qrBuffer);

    // PDFKit does not edit existing pages; store QR image for retrieval/auditing.
    await readFile(pdfPath);
    return pdfPath;
  }
}
