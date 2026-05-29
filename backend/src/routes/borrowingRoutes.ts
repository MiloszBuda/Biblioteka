import { Router } from "express";
import * as borrowingService from "../services/borrowingService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const borrowings = await borrowingService.getAllBorrowings();
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas pobierania wypożyczeń" });
  }
});

router.get("/active/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID członka" });
    }

    const activeBorrowings =
      await borrowingService.getActiveBorrowingsByMember(memberId);
    res.json(activeBorrowings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania aktywnych wypożyczeń" });
  }
});

router.post("/", async (req, res) => {
  const { memberId, bookId } = req.body;
  try {
    await borrowingService.borrowBook(memberId, bookId);
    res.status(201).json({ message: "Książka wypożyczona pomyślnie" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/return/:borrowingId", async (req, res) => {
  try {
    const borrowingId = parseInt(req.params.borrowingId, 10);

    if (isNaN(borrowingId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID wypożyczenia" });
    }

    await borrowingService.returnBook(borrowingId);
    res.json({ message: "Książka została zwrócona pomyślnie" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
