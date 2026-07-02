import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcryptjs";
import * as db from "./db/queries.js";
import roles from "./roles.js";

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const message = "Incorrect username or password";
      const credentials = await db.getUserCredentials(email);

      if (!credentials) return done(null, false, { message });

      const passwordMatch = await bcrypt.compare(
        password,
        credentials.password,
      );

      if (!passwordMatch) return done(null, false, { message });

      return done(null, credentials.id);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((id, done) => {
  return done(null, id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUser(id);
    return done(null, {
      ...user,
      isMember: user.role !== roles.NORMAL,
    });
  } catch (err) {
    return done(err);
  }
});

export function authenticatedOnly(req, res, next) {
  if (!req.isAuthenticated()) return res.render("index", { content: "401" });
  return next();
}

export function unauthenticatedOnly(req, res, next) {
  if (req.isAuthenticated()) return res.redirect("/");
  return next();
}

export function normalUsersOnly(req, res, next) {
  if (req.user.role !== roles.NORMAL) return res.redirect("/");
  return next();
}

export const login = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureMessage: true,
});

export function logout(req, res, next) {
  req.logOut((err) => {
    if (err) return next(err);
    return res.redirect("/");
  });
}
