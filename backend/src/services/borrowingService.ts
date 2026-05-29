// borrowBook +, returnBook (update with transaction, lock row, validate, update book availability, set return_date) +,
// getAllBorrowings (whole history) +, getActiveBorrowingsByMember (not returned) +

import { db } from "../db/database";

export async function getActiveBorrowingsByMember(memberId: number) {
  const result = await db
    .selectFrom("borrowings")
    .innerJoin("books", "books.id", "borrowings.book_id")
    .select(["books.title", "borrowings.borrow_date", "borrowings.due_date"])
    .where("borrowings.member_id", "=", memberId)
    .where("borrowings.return_date", "is", null)
    .execute();

  return result;
}

export async function getAllBorrowings() {
  const result = await db
    .selectFrom("borrowings")
    .innerJoin("books", "books.id", "borrowings.book_id")
    .innerJoin("members", "members.id", "borrowings.member_id")
    .select([
      "books.title",
      "members.first_name",
      "members.last_name",
      "borrowings.borrow_date",
      "borrowings.due_date",
      "borrowings.return_date",
    ]) // ewentualny where, tylko te oddane
    .execute();

  return result;
}

export async function borrowBook(memberId: number, bookId: number) {
  return await db.transaction().execute(async (trx) => {
    const book = await trx
      .selectFrom("books")
      .selectAll()
      .where("id", "=", bookId)
      .forUpdate()
      .executeTakeFirst();

    if (!book) {
      throw new Error("Książka nie istnieje w bazie.");
    }

    if (book.available_copies <= 0) {
      throw new Error(
        "Brak dostępnych egzemplarzy. Książka jest już wypożyczona.",
      );
    }

    await trx
      .updateTable("books")
      .set({ available_copies: book.available_copies - 1 })
      .where("id", "=", bookId)
      .execute();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newBorrowing = await trx
      .insertInto("borrowings")
      .values({
        member_id: memberId,
        book_id: bookId,
        due_date: dueDate,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return newBorrowing;
  });
}

export async function returnBook(borrowingId: number) {
  return await db.transaction().execute(async (trx) => {
    const borrowing = await trx
      .selectFrom("borrowings")
      .selectAll()
      .where("id", "=", borrowingId)
      .forUpdate()
      .executeTakeFirst();

    if (!borrowing) {
      throw new Error("Wypożyczenie o podanym ID nie istnieje.");
    }

    if (borrowing.return_date !== null) {
      throw new Error("Ta książka została już zwrócona.");
    }

    await trx
      .updateTable("borrowings")
      .set({ return_date: new Date() })
      .where("id", "=", borrowingId)
      .execute();

    const book = await trx
      .selectFrom("books")
      .selectAll()
      .where("id", "=", borrowing.book_id)
      .forUpdate()
      .executeTakeFirst();

    if (!book) {
      // pewnie niepotrzebne, bo skoro jest wypożyczenie, to książka musi istnieć (walidacja w borrowBook), ale dla bezpieczeństwa:
      throw new Error("Książka związana z tym wypożyczeniem nie istnieje.");
    }

    await trx
      .updateTable("books")
      .set({ available_copies: book.available_copies + 1 })
      .where("id", "=", borrowing.book_id)
      .execute();

    return { message: "Książka została zwrócona pomyślnie." };
  });
}
