import { Pool } from "pg";
import roles from "../roles.js";

export const pool = new Pool({
  connectionString: process.env.DATABASE,
});

export async function createUser(user) {
  await pool.query(
    `
    insert into users (first_name, last_name, email, password)
    values ($1, $2, $3, $4);`,
    [user.firstName, user.lastName, user.email, user.password],
  );
}

export async function getUserEmailUsed(email) {
  const result = await pool.query(
    `
    select id
    from users
    where email = $1;`,
    [email],
  );
  return result.rowCount !== 0;
}

export async function getUserCredentials(email) {
  const result = await pool.query(
    `
    select id, password
    from users
    where email = $1;`,
    [email],
  );
  return result.rowCount === 1 ? result.rows[0] : null;
}

export async function getUser(id) {
  const result = await pool.query(
    `
    select id, first_name, last_name, email, role
    from users
    where id = $1;`,
    [id],
  );
  return result.rowCount === 1 ? result.rows[0] : null;
}

export async function promoteUserToMember(userId) {
  await pool.query("update users set role = $1 where id = $2", [
    roles.MEMBER,
    userId,
  ]);
}
