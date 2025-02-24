import {
  processCatastro,
  processMoney,
  processPercentage,
  processSheetsDataBase,
} from "./questionTypeProcessor";

type DependencyType = "contain all" | "contain any" | "exact" | "exclude";

type Dependency = {
  id: number;
  type: DependencyType;
  values: string;
};

function replaceLastCommaWithY(inputString: string): string {
  const lastCommaIndex = inputString.lastIndexOf(",");
  if (lastCommaIndex === -1) {
    return inputString;
  }
  return (
    inputString.substring(0, lastCommaIndex) +
    " y" +
    inputString.substring(lastCommaIndex + 1)
  );
}

export const processAnswer = (
  answer:
    | string
    | {
        type: string;
        [key: string]: any;
      }
): string => {
  if (typeof answer === "string") return answer;
  if (answer.type === "multipleOptions") {
    const processedString = Object.keys(answer)
      .filter((key) => key !== "type" && answer[key] === true)
      .join(", ");
    return replaceLastCommaWithY(processedString);
  }
  if (answer.type === "money") {
    return processMoney(answer);
  }
  if (answer.type === "percentage") {
    return processPercentage(answer);
  }
  if (answer.type === "sheetsDataBase") {
    return processSheetsDataBase(answer);
  }
  if (answer.type === "catastro") {
    return processCatastro(answer);
  }
  return "ERROR";
};

export const processAnswerForDependency = (
  answer:
    | undefined
    | string
    | {
        type: string;
        [key: string]: any;
      }
): string[] => {
  if (!answer) return [];
  if (typeof answer === "string") return [answer];
  if (answer.type === "multipleOptions") {
    return Object.keys(answer).filter(
      (key) => key !== "type" && answer[key] === true
    );
  }
  if (answer.type === "money") {
    return [processMoney(answer)];
  }
  if (answer.type === "percentage") {
    return [processPercentage(answer)];
  }
  if (answer.type === "sheetsDataBase") {
    return [processSheetsDataBase(answer)];
  }
  if (answer.type === "catastro") {
    return [processCatastro(answer)];
  }
  return ["ERROR"];
};

export const processText = (text: string, answers: any): string => {
  if (text.includes("[") || text.includes("{") || text.includes("<")) {
    return text
      .replaceAll("[", "#[")
      .replaceAll("]", "]#")
      .replaceAll("{", "#{")
      .replaceAll("}", "}#")
      .replaceAll("<", "#<")
      .replaceAll(">", ">#")
      .split("#")
      .map((t: string) => {
        if (t.includes("[")) {
          return `<b>${t.replaceAll("[", "").replaceAll("]", "")}</b>`;
        }
        if (t.includes("<")) {
          const content = t.replaceAll("<", "").replaceAll(">", "");
          return `<span style="text-decoration: underline;">${content}</span>`;
        }
        if (t.includes("{")) {
          let isBold = t.includes("^");
          const te = t.replaceAll("^", "");
          try {
            const str: any = te.slice(0, -1).substring(1);
            if (str.includes(".")) {
              const split = str.split(".");
              if (answers[split[0]] && answers[split[0]][split[1]]) {
                return `<span style="color: #5b55a0; font-weight: ${
                  isBold ? 700 : 400
                }">${processAnswer(answers[split[0]][split[1]])}</span>`;
              }
            }
            if (answers && answers[str]) {
              return `<span style="color: #5b55a0; font-weight: ${
                isBold ? 700 : 400
              }">${processAnswer(answers[str])}</span>`;
            }
            return "<span>___________________</span>";
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

export const processDependencies = (
  dependencies?: Dependency[],
  answers?: any
): boolean => {
  if (!dependencies || dependencies.length === 0) return true;

  let shouldRender = true;

  dependencies.forEach((dependency: Dependency) => {
    const { type, values, id } = dependency;
    const valuesToCheck = String(values).toLowerCase().split(";");

    if (answers?.[id] === undefined) {
      shouldRender = false;
      return;
    }

    const processedAnswer = processAnswerForDependency(answers[id]).map((ans) =>
      ans.toLowerCase()
    );

    if (type === "exclude") {
      processedAnswer.forEach((ans) => {
        if (valuesToCheck.includes(String(ans))) {
          shouldRender = false;
        }
      });
    }
    if (type === "contain any") {
      shouldRender = false;
      processedAnswer.forEach((ans) => {
        if (valuesToCheck.includes(String(ans))) {
          shouldRender = true;
        }
      });
    }
    if (type === "exact") {
      if (valuesToCheck[0] !== processedAnswer[0]) {
        shouldRender = false;
      }
    }
    if (type === "contain all") {
      valuesToCheck.forEach((val) => {
        if (!processedAnswer.includes(String(val))) {
          shouldRender = false;
        }
      });
    }
  });

  return shouldRender;
};
