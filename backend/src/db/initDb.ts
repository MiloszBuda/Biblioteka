import { db } from "./database";

async function createTables() {
  await db.schema
    .createTable("members")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("first_name", "varchar(100)", (col) => col.notNull())
    .addColumn("last_name", "varchar(100)", (col) => col.notNull())
    .addColumn("address", "text")
    .addColumn("card_number", "varchar(50)", (col) => col.notNull().unique())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo("now()").notNull(),
    )
    .addColumn("is_active", "boolean", (col) => col.defaultTo(true).notNull())
    .execute();

  await db.schema
    .createTable("books")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("author", "varchar(255)", (col) => col.notNull())
    .addColumn("total_copies", "integer", (col) => col.defaultTo(1).notNull())
    .addColumn("available_copies", "integer", (col) =>
      col.defaultTo(1).notNull(),
    )
    .addColumn("withdrawn", "boolean", (col) => col.defaultTo(false).notNull())
    .execute();

  await db.schema
    .createTable("borrowings")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("member_id", "integer", (col) =>
      col.references("members.id").notNull(),
    )
    .addColumn("book_id", "integer", (col) =>
      col.references("books.id").notNull(),
    )
    .addColumn("borrow_date", "timestamp", (col) =>
      col.defaultTo("now()").notNull(),
    )
    .addColumn("due_date", "timestamp", (col) => col.notNull())
    .addColumn("return_date", "timestamp")
    .execute();

  console.log("Tabele utworzone!");
}

createTables().catch(console.error);
