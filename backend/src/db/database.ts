import { Database } from "./types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import "dotenv/config";

const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "biblioteka",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
