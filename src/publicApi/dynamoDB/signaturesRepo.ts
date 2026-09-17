import { dynamoClient } from "./dynamoClient";

const TABLE_NAME = "ElectronicSignatureReference";

export interface SignatureItem {
  companyId: string;
  signatureId: string;
  companyName?: string;
  fileName?: string;
  documentKind?: string;
  status?: "pending" | "signed" | string;
  documentToken?: string;
  documentId?: string | number;
  userId?: string;
  createdBy?: string;
  creatorEmail?: string | null;
  dateCreated?: string;
  signedAt?: string;
  signedFile?: string | null;
  signedFilePath?: string | null;
  delFlg?: number;
  updateDate?: string;
}

export const isSignatureActive = (signature: SignatureItem | undefined) =>
  Number(signature?.delFlg ?? 0) !== 1;

interface QueryPage {
  items: SignatureItem[];
  lastKey?: Record<string, unknown>;
}

const queryOnce = async (
  companyId: string,
  exclusiveStartKey?: Record<string, unknown>,
): Promise<QueryPage> => {
  const result = await dynamoClient
    .query({
      TableName: TABLE_NAME,
      KeyConditionExpression: "companyId = :id",
      ScanIndexForward: false,
      Limit: 1900,
      ExpressionAttributeValues: { ":id": companyId },
      ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
    })
    .promise();

  return {
    items: (result.Items as SignatureItem[]) || [],
    lastKey: result.LastEvaluatedKey,
  };
};

export const getAllCompanySignatures = async (
  companyId: string,
): Promise<SignatureItem[]> => {
  const id = String(companyId);
  const acc: SignatureItem[] = [];
  let lastKey: Record<string, unknown> | undefined = undefined;

  do {
    const page: QueryPage = await queryOnce(id, lastKey);
    acc.push(...page.items);
    lastKey = page.lastKey;
  } while (lastKey);

  return acc.filter(isSignatureActive);
};
