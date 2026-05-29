import express from "express";
import "dotenv/config";
import cors from "cors";

import bookRoutes from "./routes/bookRoutes";
import memberRoutes from "./routes/memberRoutes";
import borrowingRoutes from "./routes/borrowingRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowings", borrowingRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Nie znaleziono podanego zasobu API." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serwer biblioteki działa poprawnie!`);
  console.log(
    `Baza testowa dostępna pod adresem: http://localhost:${PORT}/api`,
  );
});

export default app;
