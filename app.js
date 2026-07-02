import path from "node:path";
import express from "express";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";

import * as auth from "./auth.js";
import { pool } from "./db/queries.js";
import * as register from "./controllers/register.js";
import * as login from "./controllers/login.js";
import * as secret from "./controllers/secret.js";

const app = express();
const PostgresStore = connectPgSimple(session);

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    store: new PostgresStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
  }),
);

app.use(passport.session());
app.use(express.static(path.join(import.meta.dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

app.get("/", (req, res) => {
  return res.render("index", {
    content: "welcome",
  });
});

app.get("/register", auth.unauthenticatedOnly, register.get);
app.post(
  "/register",
  auth.unauthenticatedOnly,
  register.validator,
  register.post,
);
app.get("/login", auth.unauthenticatedOnly, login.get);
app.post("/login", auth.unauthenticatedOnly, auth.login);
app.get("/logout", auth.logout);
app.get("/secret", auth.authenticatedOnly, auth.normalUsersOnly, secret.get);
app.post("/secret", auth.authenticatedOnly, auth.normalUsersOnly, secret.post);

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
