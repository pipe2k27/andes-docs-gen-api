import {
  AlignmentType,
  Footer,
  Header,
  ImageRun,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { fabianAchavalHeader } from "./logos/fabian_achaval_logo";

export const styles_fabian_achaval = {
  companyId: ["12392"],
  companyName: "FabianAchaval",
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
            data: fabianAchavalHeader,
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
