import { query } from "express-validator";

const VALID_STATUS = ["pending", "signed", "all"] as const;
const VALID_SCOPE = ["user", "company"] as const;

export const listDocumentsDto = [
  query("scope")
    .optional()
    .isIn(VALID_SCOPE as unknown as string[])
    .withMessage(`scope must be one of: ${VALID_SCOPE.join(", ")}`),
  query("email")
    .if((_value, { req }) => req.query?.scope !== "company")
    .exists({ checkFalsy: true })
    .withMessage("email is required unless scope=company")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
  query("email")
    .if((_value, { req }) => req.query?.scope === "company")
    .not()
    .exists()
    .withMessage("email must not be sent when scope=company"),
  query("status")
    .optional()
    .isIn(VALID_STATUS as unknown as string[])
    .withMessage(`status must be one of: ${VALID_STATUS.join(", ")}`),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be an integer between 1 and 200")
    .toInt(),
  query("cursor")
    .optional()
    .isString()
    .isLength({ min: 1, max: 512 })
    .withMessage("cursor must be a non-empty string"),
];
