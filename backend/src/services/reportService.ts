// getOverdueBorrowings, getMostBorrowedBooks, getBorrowingHistoryForMember

import { db } from "../db/database";

export async function getOverdueBorrowings() {
  const now = new Date();
  const result = await db
    .selectFrom("borrowings")
    .innerJoin("books", "books.id", "borrowings.book_id")
    .innerJoin("members", "members.id", "borrowings.member_id")
    .select([
      "books.title",
      "members.first_name",
      "members.last_name",
      "members.card_number",
      "borrowings.borrow_date",
      "borrowings.due_date",
    ])
    .where("borrowings.due_date", "<", now)
    .where("borrowings.return_date", "is", null)
    .orderBy("borrowings.due_date", "asc")
    .execute();

  return result;
}

export async function getMostBorrowedBooks(limit: number = 10) {
  const { count } = db.fn;

  const result = await db
    .selectFrom("borrowings")
    .innerJoin("books", "books.id", "borrowings.book_id")
    .select(["books.title", count<number>("borrowings.id").as("borrow_count")])
    .groupBy("books.id")
    .orderBy("borrow_count", "desc")
    .limit(limit)
    .execute();

  return result;
}

export async function getBorrowingHistoryForMember(memberId: number) {
  const result = await db
    .selectFrom("borrowings")
    .innerJoin("books", "books.id", "borrowings.book_id")
    .select([
      "books.title",
      "borrowings.borrow_date",
      "borrowings.due_date",
      "borrowings.return_date",
    ])
    .where("borrowings.member_id", "=", memberId)
    .where("borrowings.return_date", "is not", null) // tylko zwrócone wypożyczenia, bo aktywne są w getActiveBorrowingsByMember (borrowingService.ts)
    .orderBy("borrowings.return_date", "desc")
    .execute();

  return result;
}
