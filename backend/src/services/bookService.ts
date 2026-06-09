import { db } from "../db/database";
import { UpdateBookData } from "../db/types";

export async function getAllBooks() {
  const result = await db
    .selectFrom("books")
    .selectAll()
    .where("withdrawn", "=", false)
    .execute();
  return result;
}

export async function getAvailableBooks() {
  const result = await db
    .selectFrom("books")
    .selectAll()
    .where("available_copies", ">", 0)
    .where("withdrawn", "=", false)
    .execute();
  return result;
}

export async function addBook(
  title: string,
  author: string,
  totalCopies: number,
) {
  const newBook = await db
    .insertInto("books")
    .values({
      title,
      author,
      total_copies: totalCopies,
      available_copies: totalCopies,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return newBook;
}

export async function updateBook(bookId: number, data: UpdateBookData) {
  if (Object.keys(data).length === 0) {
    throw new Error("Nie podano danych do aktualizacji.");
  }

  const updatedBook = await db
    .updateTable("books")
    .set(data)
    .where("id", "=", bookId)
    .returningAll()
    .executeTakeFirstOrThrow();

  return updatedBook;
}

export async function updateCopies(bookId: number, newTotal: number) {
  return await db.transaction().execute(async (trx) => {
    const book = await trx
      .selectFrom("books")
      .selectAll()
      .where("id", "=", bookId)
      .forUpdate()
      .executeTakeFirstOrThrow();

    const borrowedCopies = book.total_copies - book.available_copies;

    if (newTotal === book.total_copies) {
      throw new Error("Nowa liczba egzemplarzy jest taka sama jak obecna.");
    }

    if (newTotal < borrowedCopies) {
      throw new Error(
        `Nie można ustawić liczby egzemplarzy na ${newTotal}, ponieważ ${borrowedCopies} egzemplarzy jest aktualnie wypożyczonych.`,
      );
    }

    return await trx
      .updateTable("books")
      .set({
        total_copies: newTotal,
        available_copies: newTotal - borrowedCopies,
      })
      .where("id", "=", bookId)
      .returningAll()
      .executeTakeFirstOrThrow();
  });
}

export async function deleteBook(bookId: number) {
  await db.transaction().execute(async (trx) => {
    await trx
      .selectFrom("books")
      .selectAll()
      .where("id", "=", bookId)
      .forUpdate()
      .executeTakeFirstOrThrow();

    const activeBorrowings = await trx
      .selectFrom("borrowings")
      .selectAll()
      .where("book_id", "=", bookId)
      .where("return_date", "is", null)
      .execute();

    if (activeBorrowings.length > 0) {
      throw new Error("Nie można usunąć książki z aktywnymi wypożyczeniami.");
    }

    const deletedBook = await trx
      .updateTable("books")
      .set({ withdrawn: true })
      .where("id", "=", bookId)
      .returningAll()
      .executeTakeFirstOrThrow();
  });
}
