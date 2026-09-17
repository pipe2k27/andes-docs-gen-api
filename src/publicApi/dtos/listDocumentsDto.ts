import { query } from "express-validator";

const VALID_STATUS = ["pending", "signed", "all"] as const;

export const listDocumentsDto = [
  query("email")
    .exists({ checkFalsy: true })
    .withMessage("email is required")
    .bail()
    .isEmail()
    .withMessage("email must be a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
  query("status")
    .optional()
    .isIn(VALID_STATUS as unknown as string[])
    .withMessage(`status must be one of: ${VALID_STATUS.join(", ")}`),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("limit must be an integer between 1 and 200")
    .toInt(),
];
