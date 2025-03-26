import { Header, Footer } from "docx";

export interface DocumentStyles {
  font: string;
  titleSize: number;
  textSize: number;
  lineSpacing: number;
  marginRight: number;
  marginLeft: number;
  beforeParagraph: number;
  header: Header;
  footer: Footer;
}
