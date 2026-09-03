// Shared docx-js helpers for the waste-oil / Group II base-oil project package.
const {
  Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, LevelFormat, PageBreak,
} = require('docx');

const USABLE = 9020; // A4 usable width in DXA (portrait, normal margins)

// Parse a string with **bold** markers into an array of TextRun.
function runs(text, base = {}) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g).filter((s) => s !== '');
  return parts.map((p) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return new TextRun({ text: p.slice(2, -2), bold: true, ...base });
    }
    return new TextRun({ text: p, ...base });
  });
}

function title(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, bold: true, size: 34, color: '1F3864' })],
  });
}

function subtitle(text) {
  return new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text, italics: true, size: 22, color: '595959' })],
  });
}

function H1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 260, after: 120 },
    children: runs(text),
  });
}

function H2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: runs(text),
  });
}

function H3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 80 },
    children: runs(text),
  });
}

function P(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: Array.isArray(text) ? text : runs(text),
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { after: 60, line: 264 },
    alignment: AlignmentType.LEFT,
    children: Array.isArray(text) ? text : runs(text),
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    border: {
      left: { style: BorderStyle.SINGLE, size: 18, color: 'C00000', space: 12 },
    },
    shading: { type: ShadingType.CLEAR, fill: 'FBE9E7' },
    children: Array.isArray(text) ? text : runs(text),
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 60 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function cell(content, { w, header = false, fill, align } = {}) {
  const children = (Array.isArray(content) ? content : [content]).map((c) => {
    if (typeof c === 'string') {
      return new Paragraph({
        spacing: { before: 20, after: 20, line: 252 },
        alignment: align || AlignmentType.LEFT,
        children: runs(c, header ? { bold: true, color: 'FFFFFF' } : {}),
      });
    }
    return c;
  });
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: header
      ? { type: ShadingType.CLEAR, fill: '1F3864' }
      : (fill ? { type: ShadingType.CLEAR, fill } : undefined),
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: children.length ? children : [new Paragraph({ children: [] })],
  });
}

// headers: array of strings. rows: array of arrays of strings.
// widths: array of DXA numbers summing to <= USABLE.
function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, { w: widths[i], header: true })),
  });
  const bodyRows = rows.map((r, ri) =>
    new TableRow({
      children: r.map((c, i) =>
        cell(c, { w: widths[i], fill: ri % 2 ? 'EEF1F8' : 'FFFFFF' })),
    }));
  return new Table({
    columnWidths: widths,
    width: { size: total, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'AAB4CC' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'AAB4CC' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'AAB4CC' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'AAB4CC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'CCD3E0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'CCD3E0' },
    },
    rows: [headerRow, ...bodyRows],
  });
}

// Numbered sources list.
function sources(items) {
  return items.map((it, i) =>
    new Paragraph({
      spacing: { after: 40, line: 240 },
      children: [
        new TextRun({ text: `[${i + 1}] `, bold: true, size: 18 }),
        new TextRun({ text: it, size: 18, color: '404040' }),
      ],
    }));
}

const numberingConfig = [
  {
    reference: 'bullets',
    levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 220 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 220 } } } },
    ],
  },
];

const docDefaults = {
  default: {
    document: { run: { font: 'Calibri', size: 21 } },
  },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 27, bold: true, color: '1F3864' } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 23, bold: true, color: '2E4C7E' } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 21, bold: true, color: '404040' } },
  ],
};

const pageProps = {
  page: {
    margin: { top: 1134, bottom: 1134, left: 1080, right: 1080 },
  },
};

module.exports = {
  USABLE, runs, title, subtitle, H1, H2, H3, P, bullet, note, spacer, pageBreak,
  table, sources, numberingConfig, docDefaults, pageProps,
};
