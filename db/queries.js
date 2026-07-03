import { Pool } from "pg";
import roles from "../roles.js";

export const pool = new Pool({
  connectionString: process.env.DATABASE,
});

export async function createUser(user) {
  const { rows } = await pool.query(
    `
    insert into users (first_name, last_name, email, password)
    values ($1, $2, $3, $4)
    returning id;`,
    [user.firstName, user.lastName, user.email, user.password],
  );
  return rows[0].id;
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

export async function createMessage(userId, text) {
  await pool.query(
    `
    insert into messages (user_id, created, text)
    values ($1, current_timestamp, $2);`,
    [userId, text],
  );
}

export async function getMessages() {
  const { rows } = await pool.query(`
    select messages.id, messages.created, messages.text, users.first_name, users.last_name
    from messages
    join users on messages.user_id = users.id
    order by messages.created desc;`);
  return rows;
}

export async function deleteMessage(id) {
  await pool.query("delete from messages where id = $1;", [id]);
}
