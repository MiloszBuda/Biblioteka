import { db } from "./database";

async function seed() {
  try {
    await db.deleteFrom("borrowings").execute();
    await db.deleteFrom("books").execute();
    await db.deleteFrom("members").execute();

    const members = await db
      .insertInto("members")
      .values([
        {
          first_name: "Jan",
          last_name: "Kowalski",
          address: "ul. Długa 5, Kraków",
          card_number: "KARTA_001",
        },
        {
          first_name: "Anna",
          last_name: "Nowak",
          address: "ul. Krótka 10, Warszawa",
          card_number: "KARTA_002",
        },
        {
          first_name: "Piotr",
          last_name: "Zieliński",
          address: "ul. Leśna 2, Poznań",
          card_number: "KARTA_003",
        },
        {
          first_name: "Katarzyna",
          last_name: "Wójcik",
          address: "ul. Polna 15, Wrocław",
          card_number: "KARTA_004",
        },
      ])
      .returning("id")
      .execute();

    const books = await db
      .insertInto("books")
      .values([
        {
          title: "Wiedźmin: Ostatnie Życzenie",
          author: "Andrzej Sapkowski",
          total_copies: 5,
          available_copies: 5,
        },
        {
          title: "Diuna",
          author: "Frank Herbert",
          total_copies: 3,
          available_copies: 3,
        },
        {
          title: "Hobbit",
          author: "J.R.R. Tolkien",
          total_copies: 4,
          available_copies: 4,
        },
        {
          title: "Rok 1984",
          author: "George Orwell",
          total_copies: 4,
          available_copies: 4,
        },
        {
          title: "Lśnienie",
          author: "Stephen King",
          total_copies: 2,
          available_copies: 2,
        },
        {
          title: "Zbrodnia i kara",
          author: "Fiodor Dostojewski",
          total_copies: 3,
          available_copies: 3,
        },
      ])
      .returning("id")
      .execute();

    const now = new Date();
    const past20Days = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const past10Days = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const future4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

    const past20DaysStr = past20Days.toISOString();
    const past10DaysStr = past10Days.toISOString();

    await db
      .insertInto("borrowings")
      .values([
        {
          member_id: members[0]!.id,
          book_id: books[0]!.id,
          borrow_date: past20DaysStr,
          due_date: past10Days,
          return_date: past10Days,
        },
        {
          member_id: members[1]!.id,
          book_id: books[1]!.id,
          borrow_date: past20DaysStr,
          due_date: past10Days,
          return_date: past10Days,
        },
        {
          member_id: members[0]!.id,
          book_id: books[2]!.id,
          borrow_date: past20DaysStr,
          due_date: past10Days,
          return_date: past10Days,
        },
        {
          member_id: members[2]!.id,
          book_id: books[3]!.id,
          borrow_date: past20DaysStr,
          due_date: past10Days,
          return_date: past10Days,
        },
        {
          member_id: members[3]!.id,
          book_id: books[4]!.id,
          borrow_date: past20DaysStr,
          due_date: past10Days,
          return_date: past10Days,
        },

        {
          member_id: members[0]!.id,
          book_id: books[1]!.id,
          borrow_date: past10DaysStr,
          due_date: future4Days,
          return_date: null,
        },
        {
          member_id: members[1]!.id,
          book_id: books[0]!.id,
          borrow_date: past10DaysStr,
          due_date: future4Days,
          return_date: null,
        },
        {
          member_id: members[2]!.id,
          book_id: books[5]!.id,
          borrow_date: past10DaysStr,
          due_date: future4Days,
          return_date: null,
        },
        {
          member_id: members[3]!.id,
          book_id: books[2]!.id,
          borrow_date: past10DaysStr,
          due_date: future4Days,
          return_date: null,
        },
        {
          member_id: members[2]!.id,
          book_id: books[2]!.id,
          borrow_date: past10DaysStr,
          due_date: future4Days,
          return_date: null,
        },

        {
          member_id: members[0]!.id,
          book_id: books[3]!.id,
          borrow_date: past20DaysStr,
          due_date: past2Days,
          return_date: null,
        },
        {
          member_id: members[1]!.id,
          book_id: books[4]!.id,
          borrow_date: past20DaysStr,
          due_date: past2Days,
          return_date: null,
        },
      ])
      .execute();

    await db
      .updateTable("books")
      .set({ available_copies: 4 })
      .where("id", "=", books[0]!.id)
      .execute();
    await db
      .updateTable("books")
      .set({ available_copies: 2 })
      .where("id", "=", books[1]!.id)
      .execute();
    await db
      .updateTable("books")
      .set({ available_copies: 2 })
      .where("id", "=", books[2]!.id)
      .execute();
    await db
      .updateTable("books")
      .set({ available_copies: 3 })
      .where("id", "=", books[3]!.id)
      .execute();
    await db
      .updateTable("books")
      .set({ available_copies: 1 })
      .where("id", "=", books[4]!.id)
      .execute();
    await db
      .updateTable("books")
      .set({ available_copies: 2 })
      .where("id", "=", books[5]!.id)
      .execute();

    console.log("Seedowanie zakończone");
    process.exit(0);
  } catch (error) {
    console.error("Błąd podczas seedowania:", error);
    process.exit(1);
  }
}

seed();
