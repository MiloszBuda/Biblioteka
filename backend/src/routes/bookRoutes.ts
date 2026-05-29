import { Router } from "express";
import * as bookService from "../services/bookService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error("PRAWDZIWY BŁĄD:", error);
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania książek" });
  }
});

router.get("/available", async (req, res) => {
  try {
    const books = await bookService.getAvailableBooks();
    res.json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Wystąpił błąd podczas pobierania dostępnych książek" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, author, totalCopies } = req.body;

    const newBook = await bookService.addBook(title, author, totalCopies);
    res.status(201).json(newBook);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID książki" });
    }

    const updatedBook = await bookService.updateBook(bookId, req.body);
    res.json(updatedBook);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:id/copies", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const { newTotal } = req.body;

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID książki" });
    }

    if (isNaN(newTotal)) {
      return res.status(400).json({ message: "Nieprawidłowa liczba kopii" });
    }

    const updatedBook = await bookService.updateCopies(bookId, newTotal);
    res.json(updatedBook);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID książki" });
    }

    await bookService.deleteBook(bookId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
