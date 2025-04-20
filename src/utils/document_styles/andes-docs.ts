import {
  AlignmentType,
  Footer,
  Header,
  ImageRun,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { andes_docs_header } from "./logos/andes_logo";

export const styles_andes = {
  companyId: ["12348"],
  companyName: "Andes Docs",
  font: "Arial",
  titleSize: 21,
  textSize: 21,
  lineSpacing: 400,
  marginRight: 1600,
  marginLeft: 1600,
  beforeParagraph: 300,

  header: new Header({
    children: [
      new Paragraph({
        spacing: {
          before: 0,
          after: 550,
        },
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({
            data: andes_docs_header,
            transformation: {
              width: 190.69,
              height: 43,
            },
            type: "png",
          }),
        ],
      }),
    ],
  }),

  footer: new Footer({
    children: [
      new Paragraph({
        spacing: {
          before: 300,
          after: 0,
        },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Av. Alvear 1890, p. 12 (C1129AAN) Cdad Autónoma de Buenos Aires. Tel: +54 11 4807-2345 mail: info@fabianachaval.com",
            size: 15,
            font: "Arial",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
          }),
        ],
      }),
    ],
  }),
};
