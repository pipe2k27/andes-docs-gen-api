import { dynamoClient } from "./dynamoClient";

const TABLE_NAME = "Users";

export type UserRole =
  | "admin-editor"
  | "admin"
  | "supervisor"
  | "user-editor"
  | "user";

export interface UserItem {
  userId: string;
  companyId: string;
  email: string;
  name?: string;
  role?: UserRole;
  documentShare?: boolean;
  supervisedUsers?: string[];
}

const normalizeEmail = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ /g, " ")
    .replace(/[​-‍﻿]/g, "");

const queryByEmailGSI = async (email: string): Promise<UserItem[]> => {
  const result = await dynamoClient
    .query({
      TableName: TABLE_NAME,
      IndexName: "email",
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
    })
    .promise();

  return (result.Items as UserItem[]) || [];
};

export const findUserByEmailForCompany = async (
  email: string,
  companyId: string,
): Promise<UserItem | null> => {
  const normalized = normalizeEmail(email);
  const exact = String(email || "").trim();
  const candidates = Array.from(new Set([normalized, exact].filter(Boolean)));

  for (const candidate of candidates) {
    try {
      const matches = await queryByEmailGSI(candidate);
      const forCompany = matches.find(
        (u) => String(u.companyId) === String(companyId),
      );
      if (forCompany) return forCompany;
    } catch (err) {
      console.warn("Users GSI 'email' query failed, will fallback:", err);
    }
  }

  return null;
};
