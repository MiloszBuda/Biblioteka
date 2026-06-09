import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app";
import { db } from "../db/database";

// Zmienne przechowujące prawdziwe ID pobrane prosto z bazy przed testami
let memberIdClean: number;
let memberIdWithOverdue: number;
let bookIdWithOneCopy: number;

beforeAll(async () => {
  // Książka, która ma dokładnie 1 wolną kopię
  const book = await db
    .selectFrom("books")
    .select("id")
    .where("available_copies", "=", 1)
    .executeTakeFirst();
  bookIdWithOneCopy = book!.id;

  // Dowolny czytelnik do pierwszego wypożyczenia
  const member = await db.selectFrom("members").select("id").executeTakeFirst();
  memberIdClean = member!.id;

  // Czytelnik, który ma opóźniony zwrot
  const overdueBorrowing = await db
    .selectFrom("borrowings")
    .select("member_id")
    .where("due_date", "<", new Date())
    .where("return_date", "is", null)
    .executeTakeFirst();

  // Jeśli nie znajdzie (bo np. wszyscy oddali), pierwszy z brzegu, żeby zmienna nie była pusta.
  memberIdWithOverdue = overdueBorrowing?.member_id || member!.id;
});

afterAll(async () => {
  await db.destroy();
});

describe("Testy transakcji bazy danych", () => {
  it("powinien zablokować dezaktywację użytkownika, który ma nieoddane książki", async () => {
    const response = await request(app).patch(
      `/api/members/${memberIdWithOverdue}/deactivate`,
    );

    // Oczekujemy błędu
    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("powinien pozwolić na wypożyczenie książki, jeśli są dostępne egzemplarze", async () => {
    const response = await request(app)
      .post("/api/borrowings")
      .send({ memberId: memberIdClean, bookId: bookIdWithOneCopy });

    // Oczekujemy sukcesu
    expect(response.status).toBe(201);
  });

  it("powinien zablokować wypożyczenie i wycofać transakcję, gdy brakuje kopii", async () => {
    // W poprzednim teście wykorzystaliśmy ostatnią wolną sztukę tej książki,
    // teraz API musi rzucić błąd.
    const response = await request(app)
      .post("/api/borrowings")
      .send({ memberId: memberIdClean, bookId: bookIdWithOneCopy });

    // Bład
    expect(response.status).toBe(400);

    // Udowadnienie, że transakcja wykonała ROLLBACK
    // Dostępność książki powinna wynosić 0, a nie zejść na minus
    const bookInDb = await db
      .selectFrom("books")
      .select("available_copies")
      .where("id", "=", bookIdWithOneCopy)
      .executeTakeFirst();

    expect(bookInDb?.available_copies).toBe(0);
  });
});
