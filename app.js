import path from "node:path";
import express from "express";
import session from "express-session";

import * as register from "./controllers/register.js";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.get("/", (req, res) => {
  return res.render("index", {
    content: "welcome",
  });
});

app.get("/register", register.get);
app.post("/register", register.validator, register.post);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).render("index", { content: "500" });
});

const port = process.env.PORT ?? 3000;

app.listen(port, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`listening on port ${port}`);
  }
});
