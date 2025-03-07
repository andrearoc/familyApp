// expenseEstimator.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../admin/js/config.js';
import { googleSheetsService } from '../../../admin/js/google-sheets-service.js';

class ExpenseManager {
  constructor() {
    this.notes = [];
    this.expenses = [];
    this.wishlist = [];
    this.tableContainers = {
      notes: null,
      expenses: null,
      wishlist: null
    };
  }

  init(notesContainer, expensesContainer, wishlistContainer) {
    this.tableContainers.notes = notesContainer;
    this.tableContainers.expenses = expensesContainer;
    this.tableContainers.wishlist = wishlistContainer;

    // Carica i dati iniziali
    this.loadAllData();
  }

  // Carica tutti i dati
  async loadAllData() {
    await Promise.all([
      this.loadNotes(),
      this.loadExpenses(),
      this.loadWishlist()
    ]);
  }

  // Carica le note da Google Sheets
  async loadNotes() {
    try {
      const data = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.NOTES
      );

      if (data && Array.isArray(data)) {
        this.notes = data.map(row => ({
          id: row[0],
          title: row[1],
          content: row[2],
          category: row[3],
          date: row[4]
        }));

        this.renderNotes();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento delle note:', error);
    }
  }

  // Carica le spese da Google Sheets
  async loadExpenses() {
    try {
      const data = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.EXPENSES
      );

      if (data && Array.isArray(data)) {
        this.expenses = data.map(row => ({
          id: row[0],
          amount: parseFloat(row[1]),
          category: row[2],
          description: row[3],
          date: row[4]
        }));

        this.renderExpenses();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento delle spese:', error);
    }
  }

  // Carica la wishlist da Google Sheets
  async loadWishlist() {
    try {
      const data = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.WISHLIST
      );

      if (data && Array.isArray(data)) {
        this.wishlist = data.map(row => ({
          id: row[0],
          name: row[1],
          estimatedPrice: parseFloat(row[2]),
          priority: row[3] || 'BASSA',
          notes: row[4] || ''
        }));

        this.renderWishlist();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento della wishlist:', error);
    }
  }

  // Rendering della tabella note
  renderNotes() {
    if (!this.tableContainers.notes) return;

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>ID</th><th>Titolo</th><th>Contenuto</th><th>Categoria</th><th>Data</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    this.notes.forEach(note => {
      html += `<tr>
        <td>${note.id}</td>
        <td>${note.title}</td>
        <td>${note.content}</td>
        <td>${note.category}</td>
        <td>${note.date}</td>
        <td>
          <button class="delete-btn" data-type="Note" data-id="${note.id}">Elimina</button>
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    this.tableContainers.notes.innerHTML = html;

    // Aggiungi event listener per i pulsanti di eliminazione
    this.addDeleteButtonListeners('Note');
  }

  // Rendering della tabella spese
  renderExpenses() {
    if (!this.tableContainers.expenses) return;

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>ID</th><th>Importo</th><th>Categoria</th><th>Descrizione</th><th>Data</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    this.expenses.forEach(expense => {
      html += `<tr>
        <td>${expense.id}</td>
        <td>${expense.amount.toFixed(2)} €</td>
        <td>${expense.category}</td>
        <td>${expense.description}</td>
        <td>${expense.date}</td>
        <td>
          <button class="delete-btn" data-type="ListaSpesa" data-id="${expense.id}">Elimina</button>
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    this.tableContainers.expenses.innerHTML = html;

    // Aggiungi event listener per i pulsanti di eliminazione
    this.addDeleteButtonListeners('ListaSpesa');
  }

  // Rendering della tabella wishlist
  renderWishlist() {
    if (!this.tableContainers.wishlist) return;

    let html = '<table class="data-table"><thead><tr>';
    html += '<th>ID</th><th>Nome</th><th>Prezzo Stimato</th><th>Priorità</th><th>Note</th><th>Azioni</th>';
    html += '</tr></thead><tbody>';

    this.wishlist.forEach(item => {
      html += `<tr>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.estimatedPrice.toFixed(2)} €</td>
        <td>${item.priority}</td>
        <td>${item.notes}</td>
        <td>
          <button class="delete-btn" data-type="SpeseCasa" data-id="${item.id}">Elimina</button>
        </td>
      </tr>`;
    });

    html += '</tbody></table>';
    this.tableContainers.wishlist.innerHTML = html;

    // Aggiungi event listener per i pulsanti di eliminazione
    this.addDeleteButtonListeners('SpeseCasa');
  }

  // Aggiunge event listener ai pulsanti di eliminazione
  addDeleteButtonListeners(type) {
    const buttons = document.querySelectorAll(`.delete-btn[data-type="${type}"]`);
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        this.removeItem(type, id);
      });
    });
  }

  // Aggiunge una nuova nota
  async addNote(title, content, category) {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category,
      date: new Date().toLocaleDateString()
    };

    this.notes.push(newNote);

    // Aggiorna Google Sheets
    const noteValues = [[
      newNote.id,
      newNote.title,
      newNote.content,
      newNote.category,
      newNote.date
    ]];

    try {
      await googleSheetsService.writeSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.NOTES,
        noteValues
      );
      this.renderNotes();
      return newNote;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiunta della nota:', error);
      // Rimuovi la nota dal array locale in caso di errore
      const index = this.notes.findIndex(note => note.id === newNote.id);
      if (index !== -1) this.notes.splice(index, 1);
      return null;
    }
  }

  // Aggiunge una nuova spesa
  async addExpense(amount, category, description) {
    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toLocaleDateString()
    };

    this.expenses.push(newExpense);

    // Aggiorna Google Sheets
    const expenseValues = [[
      newExpense.id,
      newExpense.amount,
      newExpense.category,
      newExpense.description,
      newExpense.date
    ]];

    try {
      await googleSheetsService.writeSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.EXPENSES,
        expenseValues
      );
      this.renderExpenses();
      return newExpense;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiunta della spesa:', error);
      // Rimuovi la spesa dal array locale in caso di errore
      const index = this.expenses.findIndex(expense => expense.id === newExpense.id);
      if (index !== -1) this.expenses.splice(index, 1);
      return null;
    }
  }

  // Aggiunge un nuovo elemento alla wishlist
  async addWishlistItem(name, estimatedPrice, priority, notes = '') {
    const newItem = {
      id: Date.now().toString(),
      name,
      estimatedPrice: parseFloat(estimatedPrice),
      priority,
      notes
    };

    this.wishlist.push(newItem);

    // Aggiorna Google Sheets
    const itemValues = [[
      newItem.id,
      newItem.name,
      newItem.estimatedPrice,
      newItem.priority,
      newItem.notes
    ]];

    try {
      await googleSheetsService.writeSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.WISHLIST,
        itemValues
      );
      this.renderWishlist();
      return newItem;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiunta dell\'elemento alla wishlist:', error);
      // Rimuovi l'elemento dalla wishlist locale in caso di errore
      const index = this.wishlist.findIndex(item => item.id === newItem.id);
      if (index !== -1) this.wishlist.splice(index, 1);
      return null;
    }
  }

  // Rimuove un elemento in base al tipo e all'ID
  async removeItem(type, id) {
    switch(type) {
      case 'Note':
        this.removeNote(id);
        break;
      case 'ListaSpesa':
        this.removeExpense(id);
        break;
      case 'SpeseCasa':
        this.removeWishlistItem(id);
        break;
    }

    // Rimuovi dal foglio Google
    try {
      await googleSheetsService.removeRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        type,
        id
      );
    } catch (error) {
      console.error(`❌ Errore durante la rimozione di ${type}:`, error);
    }
  }

  // Rimuove una nota
  removeNote(id) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      this.renderNotes();
    }
  }

  // Rimuove una spesa
  removeExpense(id) {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.renderExpenses();
    }
  }

  // Rimuove un elemento dalla wishlist
  removeWishlistItem(id) {
    const index = this.wishlist.findIndex(item => item.id === id);
    if (index !== -1) {
      this.wishlist.splice(index, 1);
      this.renderWishlist();
    }
  }
}

export const expenseManager = new ExpenseManager();