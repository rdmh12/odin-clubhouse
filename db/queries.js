import { Pool } from "pg";

const pool = new Pool({
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
