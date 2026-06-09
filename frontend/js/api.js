const API_URL = "http://localhost:3000/api";

const api = {
  async getBooks() {
    const res = await fetch(`${API_URL}/books`);
    return res.ok ? await res.json() : [];
  },
  async getAvailableBooks() {
    const res = await fetch(`${API_URL}/books/available`);
    return res.ok ? await res.json() : [];
  },
  async addBook(data) {
    const res = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Błąd dodawania książki");
  },
  async deleteBook(id) {
    const res = await fetch(`${API_URL}/books/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Książka ma aktywne wypożyczenia!");
    return true;
  },

  async getMembers() {
    const res = await fetch(`${API_URL}/members`);
    return res.ok ? await res.json() : [];
  },
  async addMember(data) {
    const res = await fetch(`${API_URL}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Błąd dodawania czytelnika");
  },
  async deactivateMember(id) {
    const res = await fetch(`${API_URL}/members/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Czytelnik ma nieoddane książki!");
    return true;
  },

  async borrowBook(memberId, bookId) {
    const res = await fetch(`${API_URL}/borrowings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, bookId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Błąd wypożyczania");
    }
  },

  async getOverdueBorrowings() {
    const res = await fetch(`${API_URL}/reports/overdue`);
    return res.ok ? await res.json() : [];
  },
  async getTopBooks() {
    const res = await fetch(`${API_URL}/reports/most-borrowed?limit=3`);
    return res.ok ? await res.json() : [];
  },

  async updateBook(id, data) {
    const res = await fetch(`${API_URL}/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Błąd aktualizacji książki");
  },

  async updateBookCopies(id, newTotal) {
    const res = await fetch(`${API_URL}/books/${id}/copies`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newTotal }),
    });
    if (!res.ok) throw new Error("Błąd aktualizacji kopii");
  },

  async updateMember(id, data) {
    const res = await fetch(`${API_URL}/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Błąd aktualizacji czytelnika");
  },

  async getActiveBorrowings(memberId) {
    const res = await fetch(`${API_URL}/borrowings/active/${memberId}`);
    return res.ok ? await res.json() : [];
  },

  async returnBook(borrowingId) {
    const res = await fetch(`${API_URL}/borrowings/return/${borrowingId}`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Błąd podczas zwrotu książki");
  },

  async getMemberHistory(memberId) {
    const res = await fetch(`${API_URL}/reports/member-history/${memberId}`);
    return res.ok ? await res.json() : [];
  },
};
