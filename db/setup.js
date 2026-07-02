import { Client } from "pg";
import roles from "../roles.js";

const tables = `
  create table if not exists users (
    id         integer primary key generated always as identity,
    first_name varchar(255) not null,
    last_name  varchar(255) not null,
    email      varchar(255) not null unique,
    password   varchar(255) not null,
    role       smallint not null default ${roles.NORMAL});

  create table if not exists messages (
    id         integer primary key generated always as identity,
    user_id    integer not null references users (id),
    created    timestamp not null,
    text       text not null);
  `;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE,
  });

  await client.connect();
  await client.query(tables);
  await client.end();
}

main();
