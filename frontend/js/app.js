document.addEventListener("DOMContentLoaded", () => {
  refreshAllData();
  document
    .getElementById("add-book-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await api.addBook({
        title: document.getElementById("book-title").value,
        author: document.getElementById("book-author").value,
        totalCopies: parseInt(document.getElementById("book-copies").value, 10),
      });
      e.target.reset();
      refreshAllData();
    });

  document
    .getElementById("add-member-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await api.addMember({
        firstName: document.getElementById("member-first").value,
        lastName: document.getElementById("member-last").value,
        cardNumber: document.getElementById("member-card").value,
        address: document.getElementById("member-address").value || null,
      });
      e.target.reset();
      refreshAllData();
    });

  document
    .getElementById("add-borrowing-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const memberId = parseInt(
        document.getElementById("borrow-member-select").value,
        10,
      );
      const bookId = parseInt(
        document.getElementById("borrow-book-select").value,
        10,
      );

      try {
        await api.borrowBook(memberId, bookId);
        alert("Książka pomyślnie wypożyczona!");
        e.target.reset();
        refreshAllData();
      } catch (error) {
        alert(error.message);
      }
    });

  document
    .getElementById("borrowings-tab")
    .addEventListener("click", loadBorrowingDropdowns);
});

function refreshAllData() {
  loadBooks();
  loadMembers();
  loadReports();
}

async function loadBooks() {
  const books = await api.getBooks();
  const tbody = document.getElementById("books-table-body");
  tbody.innerHTML = "";
  books.forEach((b) => {
    const safeTitle = b.title.replace(/'/g, "\\'");
    tbody.innerHTML += `
      <tr>
        <td>${b.id}</td>
        <td><strong>${b.title}</strong></td>
        <td>${b.author}</td>
        <td><span class="badge ${b.available_copies > 0 ? "bg-success" : "bg-danger"}">${b.available_copies} / ${b.total_copies}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editBook(${b.id}, '${safeTitle}')">Edytuj</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="editCopies(${b.id}, ${b.total_copies})">Kopie</button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeBook(${b.id})">Wycofaj</button>
        </td>
      </tr>
    `;
  });
}

async function loadMembers() {
  const members = await api.getMembers();
  const tbody = document.getElementById("members-table-body");
  const manageSelect = document.getElementById("manage-member-select");

  manageSelect.innerHTML =
    '<option value="">Wybierz czytelnika, aby sprawdzić jego konto...</option>';
  tbody.innerHTML = "";

  members.forEach((m) => {
    tbody.innerHTML += `
      <tr>
        <td>${m.id}</td>
        <td><strong>${m.first_name} ${m.last_name}</strong></td>
        <td>${m.card_number}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editMember(${m.id})">Edytuj Adres</button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeMember(${m.id})">Dezaktywuj</button>
        </td>
      </tr>
    `;
    manageSelect.innerHTML += `<option value="${m.id}">${m.first_name} ${m.last_name} (${m.card_number})</option>`;
  });
}

async function loadReports() {
  const overdue = await api.getOverdueBorrowings();
  const overdueList = document.getElementById("overdue-list");
  overdueList.innerHTML =
    overdue.length === 0
      ? `<li class="list-group-item text-success">Brak dłużników!</li>`
      : "";

  overdue.forEach((r) => {
    overdueList.innerHTML += `<li class="list-group-item"><strong>${r.first_name} ${r.last_name}</strong><br><small class="text-danger">Książka: ${r.title}</small></li>`;
  });

  const topBooks = await api.getTopBooks();
  const topBooksList = document.getElementById("top-books-list");
  topBooksList.innerHTML = "";

  topBooks.forEach((b, index) => {
    topBooksList.innerHTML += `<li class="list-group-item">#${index + 1} <strong>${b.title}</strong> <span class="badge bg-info float-end">${b.borrow_count} razy</span></li>`;
  });
}

async function loadBorrowingDropdowns() {
  const members = await api.getMembers();
  const books = await api.getAvailableBooks();

  const memberSelect = document.getElementById("borrow-member-select");
  const bookSelect = document.getElementById("borrow-book-select");

  memberSelect.innerHTML = '<option value="">Wybierz czytelnika...</option>';
  bookSelect.innerHTML = '<option value="">Wybierz książkę...</option>';

  members.forEach((m) => {
    memberSelect.innerHTML += `<option value="${m.id}">${m.first_name} ${m.last_name} (${m.card_number})</option>`;
  });

  books.forEach((b) => {
    bookSelect.innerHTML += `<option value="${b.id}">${b.title} (Dostępne: ${b.available_copies})</option>`;
  });
}

window.removeBook = async (id) => {
  if (confirm("Wycofać książkę z systemu?")) {
    if (await api.deleteBook(id)) refreshAllData();
  }
};

window.removeMember = async (id) => {
  if (confirm("Zdezaktywować tego czytelnika?")) {
    if (await api.deactivateMember(id)) refreshAllData();
  }
};

window.editBook = async (id, oldTitle) => {
  const newTitle = prompt(
    "Podaj nowy tytuł (zostaw puste aby nie zmieniać):",
    oldTitle,
  );
  if (newTitle && newTitle !== oldTitle) {
    await api.updateBook(id, { title: newTitle });
    refreshAllData();
  }
};

window.editCopies = async (id, oldTotal) => {
  const newTotal = prompt(
    "Podaj nową całkowitą liczbę sztuk tej książki w bibliotece:",
    oldTotal,
  );
  const parsedTotal = parseInt(newTotal, 10);
  if (parsedTotal && parsedTotal >= 1) {
    try {
      await api.updateBookCopies(id, parsedTotal);
      refreshAllData();
    } catch (err) {
      alert(
        "Nie można zmniejszyć liczby kopii poniżej liczby aktualnie wypożyczonych książek!",
      );
    }
  }
};

window.editMember = async (id) => {
  const newAddress = prompt("Podaj nowy adres zamieszkania czytelnika:");
  if (newAddress) {
    await api.updateMember(id, { address: newAddress });
    refreshAllData();
  }
};

window.loadMemberAccount = async (memberId) => {
  const detailsDiv = document.getElementById("member-account-details");
  if (!memberId) {
    detailsDiv.style.display = "none";
    return;
  }

  detailsDiv.style.display = "flex";
  const activeList = document.getElementById("active-borrowings-list");
  const historyList = document.getElementById("history-borrowings-list");

  const active = await api.getActiveBorrowings(memberId);
  activeList.innerHTML =
    active.length === 0
      ? '<li class="list-group-item text-muted">Brak wypożyczonych książek.</li>'
      : "";

  active.forEach((b) => {
    activeList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${b.title}</strong><br>
          <small class="text-muted">Do: ${new Date(b.due_date).toLocaleDateString("pl-PL")}</small>
        </div>
        <button class="btn btn-sm btn-success" onclick="handleReturn(${b.id}, ${memberId})">Zwróć</button>
      </li>
    `;
  });

  const history = await api.getMemberHistory(memberId);
  historyList.innerHTML =
    history.length === 0
      ? '<li class="list-group-item text-muted">Brak historii.</li>'
      : "";

  history.forEach((b) => {
    historyList.innerHTML += `
      <li class="list-group-item">
        <strong>${b.title}</strong><br>
        <small class="text-muted">Wypożyczono: ${new Date(b.borrow_date).toLocaleDateString("pl-PL")}</small>
      </li>
    `;
  });
};

window.handleReturn = async (borrowingId, memberId) => {
  try {
    await api.returnBook(borrowingId);
    alert("Książka wróciła do biblioteki!");
    refreshAllData();
    loadMemberAccount(memberId);
  } catch (error) {
    alert(error.message);
  }
};
