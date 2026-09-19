const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, BorderStyle } = require('docx');
const H = require('./helpers');
const { title, subtitle, H2, spacer } = H;

function item(n, ru, zh) {
  return [
    new Paragraph({
      spacing: { before: 130, after: 20, line: 264 },
      children: [
        new TextRun({ text: n + '. ', bold: true, size: 22, color: '1F3864' }),
        ...H.runs(ru),
      ],
    }),
    new Paragraph({
      spacing: { after: 40, line: 248 },
      children: [new TextRun({ text: zh, size: 19, color: '8A5A00' })],
    }),
    new Paragraph({
      spacing: { after: 60, line: 240 },
      border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: 'BBBBBB', space: 2 } },
      children: [new TextRun({ text: 'Ответ / 报价:', size: 18, color: '999999' })],
    }),
  ];
}

const doc = new Document({
  creator: 'Проектная группа',
  title: 'Запрос предложения — оборудование регенерации Group II',
  styles: H.docDefaults,
  sections: [{
    properties: H.pageProps,
    children: [
      title('ЗАПРОС ПРЕДЛОЖЕНИЯ / 询价'),
      subtitle('Завод регенерации отработанного масла в базовое масло API Group II (Болгария). Хотим понять: что вы поставляете и почём. · 保加利亚废润滑油再生为 API II 类基础油装置。我们想了解：贵司能提供什么、价格如何。'),

      // Ready-to-send Chinese message
      H2('Сообщение для отправки / 可直接发送的询价'),
      new Paragraph({
        spacing: { after: 120, line: 276 },
        shading: { type: 'clear', fill: 'F2F4F9' },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: '1F3864', space: 12 } },
        children: [new TextRun({
          text: '您好！我们正在评估在保加利亚建设一套废润滑油再生为 API II 类基础油的装置。想先了解贵司能提供什么、价格如何：处理能力按 1 万吨/年（如方便，另报 2 万、3 万吨/年）。请见以下 4 点。谢谢！',
          size: 20,
        })],
      }),

      H2('Вопросы / 问题'),
      ...item('1', 'Что вы поставляете: состав комплекта оборудования (перечень основного) и что НЕ входит.',
        '供货范围：成套设备清单（主要设备）及不包含的项目。'),
      ...item('2', 'Цена комплекта на 10 000 т/год (если можно — также 20 000 и 30 000). Базис поставки: EXW завод или CIF порт Бургас.',
        '成套价格：1 万吨/年（如方便另报 2 万、3 万吨/年）。报价条件：EXW 或 CIF 布尔加斯港。'),
      ...item('3', 'Что гарантируете на выходе: продукт API Group II? Выход базового масла из 1 тонны сырья (%)?',
        '产品保证：是否达到 API II 类？每吨原料的基础油收率（%）？'),
      ...item('4', 'Срок изготовления и поставки.',
        '制造与交货周期。'),

      spacer(),
      new Paragraph({
        children: [new TextRun({ text: 'Достаточно ориентировочного предложения. / 初步报价即可。', italics: true, size: 18, color: '595959' })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || 'out_voprosy.docx', buf);
  console.log('Wrote', process.argv[2] || 'out_voprosy.docx', buf.length, 'bytes');
});
