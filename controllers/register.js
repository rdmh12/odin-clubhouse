import { body, validationResult, matchedData } from "express-validator";
import bcrypt from "bcryptjs";
import * as limits from "../limits.js";
import * as db from "../db/queries.js";

const requiredMessage = "This field is required";

export function get(req, res) {
  return res.render("index", {
    content: "register",
    errors: {},
    values: {},
    limits,
  });
}

export async function post(req, res, next) {
  const result = validationResult(req);
  const values = matchedData(req, { onlyValidData: false });

  if (!result.isEmpty()) {
    return res.status(400).render("index", {
      content: "register",
      errors: result.mapped(),
      values: values,
      limits,
    });
  }

  try {
    const password = await bcrypt.hash(values.password, 10);

    const id = await db.createUser({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password,
    });

    req.login(id, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
}

export const validator = [
  body("firstName")
    .trim()
    .not()
    .isEmpty()
    .withMessage(requiredMessage)
    .isLength({ max: limits.MAX_FIRST_NAME_LENGTH })
    .withMessage(
      `Maximum length of field is ${limits.MAX_FIRST_NAME_LENGTH} characters`,
    ),
  body("lastName")
    .trim()
    .not()
    .isEmpty()
    .withMessage(requiredMessage)
    .isLength({ max: limits.MAX_LAST_NAME_LENGTH })
    .withMessage(
      `Maximum length of field is ${limits.MAX_LAST_NAME_LENGTH} characters`,
    ),
  body("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage(requiredMessage)
    .isEmail()
    .withMessage("Required valid email address")
    .isLength({ max: limits.MAX_EMAIL_LENGTH })
    .withMessage(
      `Maximum length of field is ${limits.MAX_EMAIL_LENGTH} characters`,
    )
    .custom(async (value) => {
      const used = await db.getUserEmailUsed(value);
      if (used) throw new Error("User with this email already exists");
    }),
  body("password")
    .not()
    .isEmpty()
    .withMessage(requiredMessage)
    .isLength({ min: limits.MIN_PASSWORD_LENGTH })
    .withMessage(
      `Password must be at least ${limits.MIN_PASSWORD_LENGTH} characters`,
    )
    .isLength({ max: limits.MAX_PASSWORD_LENGTH })
    .withMessage(`Password can't be longer than ${limits.MAX_PASSWORD_LENGTH}`),
  body("passwordRepeat")
    .not()
    .isEmpty()
    .withMessage(requiredMessage)
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    }),
];
