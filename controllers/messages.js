import { body, validationResult, matchedData, param } from "express-validator";
import * as db from "../db/queries.js";

export function getNew(req, res) {
  return res.render("index", {
    content: "messages-new",
    errors: {},
  });
}

export async function postNew(req, res, next) {
  const result = validationResult(req);
  const values = matchedData(req, { onlyValidData: false });

  if (!result.isEmpty()) {
    return res.status(400).render("index", {
      content: "messages-new",
      errors: result.mapped(),
    });
  }

  try {
    await db.createMessage(req.user.id, values.text);
    return res.redirect("/messages");
  } catch (err) {
    return next(err);
  }
}

export async function getList(req, res, next) {
  try {
    const messages = await db.getMessages();

    return res.render("index", {
      content: "messages-list",
      messages,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    await db.deleteMessage(req.params.id);
    return res.redirect("/messages");
  } catch (err) {
    next(err);
  }
}

export const formValidator = [
  body("text").trim().notEmpty().withMessage("Message text can't be empty"),
];

export const idValidator = [param("id").isInt({ min: 1 })];
