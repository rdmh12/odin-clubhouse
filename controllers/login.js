export function get(req, res) {
  if (req.isAuthenticated()) return res.redirect("/");

  const messages = req.session.messages ?? [];

  req.session.messages = [];

  return res.render("index", {
    content: "login",
    messages,
  });
}
