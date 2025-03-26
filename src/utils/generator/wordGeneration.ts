import {
  AlignmentType,
  Document,
  Footer,
  Header,
  LevelFormat,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
  UnderlineType,
  convertInchesToTwip,
} from "docx";
import { processAnswer, processDependencies } from "../generator/TextProcessor";
import { DocumentStyles } from "../document_styles/Document";

type ParagraphType = {
  id: string;
  text: string;
  type: string;
};

export const processVariablesToString = (text: string, answers: any) => {
  if (text.includes("{")) {
    return text
      .replaceAll("{", "#{")
      .replaceAll("}", "}#")
      .split("#")
      .map((t: string) => {
        if (t.includes("{")) {
          let isBold = t.includes("^");
          const te = t.replaceAll("^", "");
          try {
            const str: any = te.slice(0, -1).substring(1);

            // Obtener el valor del answer
            let answerValue;
            if (str.includes(".")) {
              const split = str.split(".");
              answerValue = answers[split[0]]?.[split[1]];
            } else {
              answerValue = answers[str];
            }

            // Manejar el caso de "9" o "__________"
            if (answerValue === "9" || answerValue === "__________") {
              return "__________";
            }

            // Procesar la respuesta normalmente
            const processedAnswer = processAnswer(answerValue);

            if (isBold && processedAnswer) {
              return `[${processedAnswer}]`;
            }
            return processedAnswer || "__________";
          } catch {
            return t;
          }
        }
        return t;
      })
      .join("");
  }
  return text;
};

export const joinSameParagraphs = (
  paragraphs: ParagraphType[]
): ParagraphType[] => {
  if (!paragraphs) return [];
  return paragraphs.reduce((acc: any[], paragraph: any, index: number) => {
    if (paragraph.type === "sameParagraph" && acc[acc.length - 1]?.text) {
      acc[acc.length - 1].text += paragraph.text;
    } else {
      acc.push(paragraph);
    }
    return acc;
  }, []);
};

export const ProcessWordData = (documentData: any, answers: any) => {
  const processedTextArray = documentData?.document
    ?.filter((paragraph: any, index: number) => {
      let shouldRender = true;
      if (paragraph.dependencies) {
        shouldRender = processDependencies(paragraph.dependencies, answers);
      }
      return shouldRender;
    })
    .map((paragraph: any) => {
      return {
        type: paragraph.type,
        text: processVariablesToString(paragraph.text, answers),
      };
    });
  return processedTextArray;
};

const ConvertDataToWordElements = (
  documentData: any,
  answers: any,
  companyStyles: DocumentStyles,
  removeLogo: boolean = false
) => {
  let styles = companyStyles;

  if (removeLogo) {
    styles.header = new Header({
      children: [
        new Paragraph({
          spacing: {
            before: 300,
            after: 100,
          },
          alignment: AlignmentType.RIGHT,
          children: [],
        }),
      ],
    });
    styles.footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [],
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [],
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
      ],
    });
  }

  const processedData = ProcessWordData(documentData, answers);
  const joinedParagraphs = joinSameParagraphs(processedData);
  const paragraphs = joinedParagraphs.map((paragraph: any, index: number) => {
    const textArray = paragraph.text
      .replaceAll("[", "#[")
      .replaceAll("]", "]#")
      .replaceAll("<", "#<")
      .replaceAll(">", ">#")
      .split("#")
      .map((t: string) => {
        if (t.includes("[")) {
          return new TextRun({
            text: t.replaceAll("[", "").replaceAll("]", ""),
            size: styles.textSize,
            bold: true,
            font: styles.font,
          });
        }
        if (t.includes("<")) {
          return new TextRun({
            text: t.replaceAll("<", "").replaceAll(">", ""),
            size: styles.textSize,
            bold: false,
            font: styles.font,
            underline: {
              type: UnderlineType.SINGLE,
              color: "000000",
            },
          });
        }
        if (paragraph.type === "title")
          return new TextRun({
            text: t,
            bold: true,
            size: styles.titleSize,
            font: styles.font,
            underline: {
              type: UnderlineType.SINGLE,
              color: "000000",
            },
          });
        if (paragraph.type === "centeredText")
          return new TextRun({
            text: t,
            size: styles.textSize,
            font: styles.font,
          });
        if (paragraph.type === "subtitle")
          return new TextRun({
            text: t,
            size: styles.textSize,
            bold: true,
            font: styles.font,
          });
        if (paragraph.type === "bullet")
          return new TextRun({
            text: t,
            size: styles.textSize,
            font: styles.font,
          });
        if (paragraph.type === "rightAlignedText")
          return new TextRun({
            text: t,
            size: styles.textSize,
            font: styles.font,
          });
        if (paragraph.type === "newParagraph")
          return new TextRun({
            text: t,
            size: styles.textSize,
            font: styles.font,
          });
        return new TextRun({
          text: t,
          size: styles.textSize,
          font: styles.font,
        });
      });

    const isBullet = paragraph.type === "bullet";
    const isNotNewParagraph = paragraph.type === "text";
    const isSignature = paragraph.type === "signature";

    // Asigna el valor del enum directamente
    let align: any =
      paragraph.type === "title" || paragraph.type === "centeredText"
        ? AlignmentType.CENTER
        : AlignmentType.JUSTIFIED;

    if (paragraph.type === "rightAlignedText") {
      align = AlignmentType.RIGHT as any; // Fuerza el tipo
    }

    if (isBullet) {
      return new Paragraph({
        children: [...textArray],
        spacing: {
          before: styles.beforeParagraph,
          line: styles.lineSpacing,
        },
        alignment: align,
        numbering: {
          reference: "my-bullet-points",
          level: 0,
        },
      });
    }

    const getSpacingBefore = () => {
      if (isSignature) return 1000;
      if (isNotNewParagraph) return 0;
      return styles.beforeParagraph;
    };

    return new Paragraph({
      children: [...textArray],
      spacing: {
        before: getSpacingBefore(),
        line: styles.lineSpacing,
      },
      alignment: align,
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 0,
              right: styles.marginRight,
              bottom: 0,
              left: styles.marginLeft,
            },
          },
        },
        headers: {
          default: styles.header,
        },
        footers: {
          default: styles.footer,
        },
        children: [...paragraphs],
      },
    ],
    numbering: {
      config: [
        {
          reference: "my-bullet-points",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "\u2022",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
  });

  return doc;
};

export const generateAndDownloadWord = async (
  documentData: any,
  answers: any,
  companyStyles: DocumentStyles
) => {
  const doc = ConvertDataToWordElements(documentData, answers, companyStyles);
  const buffer = await Packer.toBuffer(doc);

  return buffer;
};
