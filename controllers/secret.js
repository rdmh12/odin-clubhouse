import * as db from "../db/queries.js";

export function get(req, res) {
  return res.render("index", {
    content: "secret",
  });
}

export async function post(req, res) {
  const secret = req.body.secret ?? "";

  if (secret.toLowerCase() === "mellon") {
    await db.promoteUserToMember(req.user.id);
    return res.redirect("/");
  }

  return res.status(400).render("index", {
    content: "secret",
    message: "The secret is not known to you",
  });
}
