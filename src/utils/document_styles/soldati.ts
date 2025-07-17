import {
  AlignmentType,
  Footer,
  Header,
  ImageRun,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import { soldati_logo } from "./logos/soldati_logo";

export const styles_soldati = {
  companyId: ["12346"],
  companyName: "Soldati",
  font: "Arial",
  titleSize: 21,
  textSize: 21,
  lineSpacing: 470,
  marginRight: 780,
  marginLeft: 780,
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
            data: soldati_logo,
            transformation: {
              width: 100.69,
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
            text: "MERCADO RESIDENCIAL – EMPRENDIMIENTOS E INVERSIONES – MERCADO INTERNACIONAL",
            size: 13,
            font: "Arial",
          }),
        ],
      }),
      new Paragraph({
        spacing: {
          before: 60,
          after: 200,
        },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "soldati.com / documento creado en andesdocs.com",
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
