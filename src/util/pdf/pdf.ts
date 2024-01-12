import { invoke } from "@tauri-apps/api/tauri";
import { PDFDocument, PDFFont, PDFPage, StandardFonts } from "pdf-lib";

type Rec = {
  lines: (string | undefined | LineOptions)[],
  padding: number,
  lineSpacing: number,
  font: "bold" | "normal",
  fontSize: number,
  border: number,
  opacity: number,
}

type LineOptions = {
  text: string | undefined,
  font?: "bold" | "normal",
}


type RecStyles = Partial<Omit<Rec, "lines">>

export class PDF {
  doc: PDFDocument;
  page: PDFPage;

  fonts: {
    normal: PDFFont,
    bold: PDFFont
  }

  pageMargin: number;

  pageWidth: number;
  pageHeight: number;

  pdfRecStyles: RecStyles

  static async blank() {
    return await new PDF().init();
  }

  constructor() { }

  async init() {
    this.doc = await PDFDocument.create();
    this.doc.setAuthor("River Rock Concrete");
    this.doc.setCreator("Invoice Maker");
    this.doc.setTitle("Invoice Maker Draft");

    this.page = this.doc.addPage();

    this.pageMargin = 20;

    const { width, height } = this.page.getSize();
    this.pageWidth = width - (this.pageMargin * 2);
    this.pageHeight = height - (this.pageMargin * 2);

    const normal = await this.doc.embedFont(StandardFonts.Helvetica);
    const bold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.fonts = { normal, bold };

    this.page.setFont(this.fonts.normal)

    this.page.moveTo(this.pageMargin, this.pageHeight + this.pageMargin);

    this.pdfRecStyles = {
      padding: 8,
      lineSpacing: 8,
      font: "normal",
      fontSize: 10,
      border: 0,
      opacity: 0,
    }

    return this;
  }

  drawRowRec(rec: Rec, howManyRecs: number) {
    const singleLine = rec.lines.length === 1;

    const textHeight = rec.fontSize - (rec.fontSize / 3);
    let columnHeight = (rec.lines.length * textHeight) + (rec.padding * 2);
    if (!singleLine) {
      columnHeight = columnHeight + (rec.lines.length * rec.lineSpacing) - rec.lineSpacing;
    }

    const columnWidth = this.pageWidth / howManyRecs;

    const { x, y } = this.page.getPosition();

    this.page.moveDown(columnHeight);
    this.page.drawRectangle({
      width: columnWidth,
      height: columnHeight,
      opacity: rec.opacity,
      borderWidth: rec.border,
    });

    this.page.moveTo(x, y);
    this.page.moveDown(rec.padding + textHeight)
    this.page.moveRight(rec.padding)

    this.page.setFont(this.fonts[rec.font])
    this.page.setFontSize(rec.fontSize)

    rec.lines.forEach((line, index) => {
      let text;
      let fontChanged = false;

      if (typeof line === "string") {
        text = line;
      } else if (typeof line === "undefined") {
        text = "";
      } else {
        text = line.text;
        if (line.font) {
          this.page.setFont(this.fonts[line.font])
          fontChanged = true;
        }
      }

      this.page.drawText(text || "", {
        maxWidth: columnWidth,
        lineHeight: textHeight + rec.lineSpacing
      })

      if (fontChanged) {
        this.page.setFont(this.fonts[rec.font])
        fontChanged = false
      }

      this.page.moveDown(textHeight)
      if (!singleLine && !(index === rec.lines.length - 1)) {
        this.page.moveDown(rec.lineSpacing)
      }
    });

    this.page.moveTo(x, y);
    this.page.moveRight(columnWidth)

    return columnHeight;
  }

  drawRow(recs: Partial<Rec>[], rowRecStyles?: RecStyles) {
    let highestColumnHeight = 0;

    recs.forEach((rec,) => {

      const finalrec = {
        ...this.pdfRecStyles,
        ...rowRecStyles,
        ...rec,
      } as Rec;

      // const columnHeight = ((finalrec.fontSize - 4) * finalrec.lines.length) + (finalrec.padding * 2);

      const columnHeight = this.drawRowRec(finalrec, recs.length)
      highestColumnHeight = columnHeight > highestColumnHeight ? columnHeight : highestColumnHeight;
    })

    this.page.moveLeft(this.pageWidth);
    this.page.moveDown(highestColumnHeight);
  }

  drawLine() {

    this.page.moveDown(5);
    const { x, y } = this.page.getPosition();
    this.page.drawLine({
      start: { x, y },
      end: { x: x + this.pageWidth, y },
      thickness: 3,
      opacity: .6
    })
    this.page.moveDown(5)
  }

  async save() {
    const data = Array.from(await this.doc.save());
    return await invoke("write_to_pdf", { data });
  }

}
