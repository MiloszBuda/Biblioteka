import { Router } from "express";
import * as reportService from "../services/reportService";

const router = Router();

router.get("/overdue", async (req, res) => {
  try {
    const overdueBorrowings = await reportService.getOverdueBorrowings();
    res.json(overdueBorrowings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania zaległych wypożyczeń" });
  }
});

router.get("/most-borrowed", async (req, res) => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: "Nieprawidłowy limit" });
    }

    const mostBorrowedBooks = await reportService.getMostBorrowedBooks(limit);
    res.json(mostBorrowedBooks);
  } catch (error) {
    res.status(500).json({
      message: "Błąd podczas pobierania najczęściej wypożyczanych książek",
    });
  }
});

router.get("/member-history/:memberId", async (req, res) => {
  try {
    const memberId = parseInt(req.params.memberId, 10);

    if (isNaN(memberId)) {
      return res.status(400).json({ message: "Nieprawidłowy ID członka" });
    }

    const history = await reportService.getBorrowingHistoryForMember(memberId);
    res.json(history);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Błąd podczas pobierania historii wypożyczeń" });
  }
});

export default router;
