import { Database } from "./types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

// Tutaj podajesz namiary na swoją bazę.
// Najlepiej trzymać to w pliku .env i pobierać przez process.env
const dialect = new PostgresDialect({
  pool: new Pool({
    host: "localhost",
    database: "biblioteka",
    user: "postgres",
    password: "1234",
    port: 5432,
    max: 10, // Maksymalna liczba połączeń
  }),
});

// To jest Twój główny obiekt do komunikacji z bazą.
// Exportujemy go, żeby używać go w innych plikach.
export const db = new Kysely<Database>({
  dialect,
});
