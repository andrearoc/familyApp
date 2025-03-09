// expenseEstimator.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../admin/js/config.js';
import { googleSheetsService } from '../../../admin/js/sheet/google-sheets-service.js';
import Card from '../modules/card.js';
import Slider from '../modules/slider.js';

class ExpenseManager {
  constructor() {
    this.notes = [];
    this.expenses = [];
    this.wishlist = [];
    this.sliders = {
      notes: null,
      expenses: null,
      wishlist: null
    };
    this.containers = {
      notes: null,
      expenses: null,
      wishlist: null
    };
  }

  init(notesContainer, expensesContainer, wishlistContainer) {
    this.containers.notes = notesContainer;
    this.containers.expenses = expensesContainer;
    this.containers.wishlist = wishlistContainer;

    // Inizializza gli slider
    this.initSliders();

    // Carica i dati iniziali
    this.loadAllData();
  }

  // Inizializza gli slider
  initSliders() {
    // Prepara i container per gli slider
    this.prepareSliderContainers();

    // Inizializza lo slider per le note
    this.sliders.notes = new Slider({
      containerId: 'notes-slider',
      slidesToShow: 3,
      slidesToScroll: 1,
      showIndicators: true,
      showControls: true,
      autoplay: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    // Inizializza lo slider per le spese
    this.sliders.expenses = new Slider({
      containerId: 'expenses-slider',
      slidesToShow: 4,
      slidesToScroll: 1,
      showIndicators: true,
      showControls: true,
      autoplay: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    // Inizializza lo slider per la wishlist
    this.sliders.wishlist = new Slider({
      containerId: 'wishlist-slider',
      slidesToShow: 3,
      slidesToScroll: 1,
      showIndicators: true,
      showControls: true,
      autoplay: false,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    // Inizializza gli slider
    this.sliders.notes.init();
    this.sliders.expenses.init();
    this.sliders.wishlist.init();
  }

  // Prepara i container per gli slider
  prepareSliderContainers() {
    // Prepara il container per lo slider delle note
    if (this.containers.notes) {
      this.containers.notes.innerHTML = '<div id="notes-slider" class="slider-section"></div>';
    }

    // Prepara il container per lo slider delle spese
    if (this.containers.expenses) {
      this.containers.expenses.innerHTML = '<div id="expenses-slider" class="slider-section"></div>';
    }

    // Prepara il container per lo slider della wishlist
    if (this.containers.wishlist) {
      this.containers.wishlist.innerHTML = '<div id="wishlist-slider" class="slider-section"></div>';
    }
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

        this.renderNotesAsCards();
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

        this.renderExpensesAsCards();
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

        this.renderWishlistAsCards();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento della wishlist:', error);
    }
  }

  // Rendering delle note come cards in uno slider
  renderNotesAsCards() {
    if (!this.sliders.notes) return;

    // Pulisci gli slide esistenti
    this.sliders.notes.clearSlides();

    // Crea una card per ogni nota
    this.notes.forEach(note => {
      const card = Card.createNoteCard(note, {
        onDelete: (id) => this.removeItem('Note', id),
        onEdit: (id) => this.editNote(id)
      });

      // Aggiungi la card allo slider
      this.sliders.notes.addSlide(card.render(), false);
    });

    // Se non ci sono note, mostra un messaggio
    if (this.notes.length === 0) {
      const emptyCard = new Card({
        title: 'Nessuna nota',
        content: 'Clicca sul pulsante "Aggiungi Nota" per creare la tua prima nota.',
        cardClass: 'card card-empty'
      });
      this.sliders.notes.addSlide(emptyCard.render(), false);
    }
  }

  // Rendering delle spese come cards in uno slider
  renderExpensesAsCards() {
    if (!this.sliders.expenses) return;

    // Pulisci gli slide esistenti
    this.sliders.expenses.clearSlides();

    // Crea una card per ogni spesa
    this.expenses.forEach(expense => {
      const card = Card.createExpenseCard(expense, {
        onDelete: (id) => this.removeItem('ListaSpesa', id),
        onEdit: (id) => this.editExpense(id)
      });

      // Aggiungi la card allo slider
      this.sliders.expenses.addSlide(card.render(), false);
    });

    // Se non ci sono spese, mostra un messaggio
    if (this.expenses.length === 0) {
      const emptyCard = new Card({
        title: 'Nessuna spesa',
        content: 'Clicca sul pulsante "Aggiungi Spesa" per registrare la tua prima spesa.',
        cardClass: 'card card-empty'
      });
      this.sliders.expenses.addSlide(emptyCard.render(), false);
    }
  }

  // Rendering della wishlist come cards in uno slider
  renderWishlistAsCards() {
    if (!this.sliders.wishlist) return;

    // Pulisci gli slide esistenti
    this.sliders.wishlist.clearSlides();

    // Crea una card per ogni elemento della wishlist
    this.wishlist.forEach(item => {
      const card = Card.createWishlistCard(item, {
        onDelete: (id) => this.removeItem('SpeseCasa', id),
        onEdit: (id) => this.editWishlistItem(id)
      });

      // Aggiungi la card allo slider
      this.sliders.wishlist.addSlide(card.render(), false);
    });

    // Se non ci sono elementi nella wishlist, mostra un messaggio
    if (this.wishlist.length === 0) {
      const emptyCard = new Card({
        title: 'Wishlist vuota',
        content: 'Clicca sul pulsante "Aggiungi alla Wishlist" per inserire il tuo primo desiderio.',
        cardClass: 'card card-empty'
      });
      this.sliders.wishlist.addSlide(emptyCard.render(), false);
    }
  }

  // Funzione per modificare una nota
  editNote(id) {
    const note = this.notes.find(note => note.id === id);
    if (!note) return;

    // Qui puoi implementare la logica per aprire un form di modifica
    // Per ora, impostiamo solo i valori del form di aggiunta note
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('note-category').value = note.category;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Nota';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-note-form button[type="submit"]');
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedTitle = document.getElementById('note-title').value;
      const updatedContent = document.getElementById('note-content').value;
      const updatedCategory = document.getElementById('note-category').value;

      await this.updateNote(id, updatedTitle, updatedContent, updatedCategory);

      // Ripristina il form
      document.getElementById('add-note-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();
    });

    // Porta l'utente alla sezione del form
    document.getElementById('notes-section-tab').click();
  }

  // Funzione per modificare una spesa
  editExpense(id) {
    const expense = this.expenses.find(expense => expense.id === id);
    if (!expense) return;

    // Qui puoi implementare la logica per aprire un form di modifica
    // Per ora, impostiamo solo i valori del form di aggiunta spese
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-description').value = expense.description;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Spesa';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-expense-form button[type="submit"]');
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedAmount = document.getElementById('expense-amount').value;
      const updatedCategory = document.getElementById('expense-category').value;
      const updatedDescription = document.getElementById('expense-description').value;

      await this.updateExpense(id, updatedAmount, updatedCategory, updatedDescription);

      // Ripristina il form
      document.getElementById('add-expense-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();
    });

    // Porta l'utente alla sezione del form
    document.getElementById('expenses-section-tab').click();
  }

  // Funzione per modificare un elemento della wishlist
  editWishlistItem(id) {
    const item = this.wishlist.find(item => item.id === id);
    if (!item) return;

    // Qui puoi implementare la logica per aprire un form di modifica
    // Per ora, impostiamo solo i valori del form di aggiunta wishlist
    document.getElementById('wishlist-name').value = item.name;
    document.getElementById('wishlist-price').value = item.estimatedPrice;
    document.getElementById('wishlist-priority').value = item.priority;
    document.getElementById('wishlist-notes').value = item.notes;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Elemento';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-wishlist-form button[type="submit"]');
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedName = document.getElementById('wishlist-name').value;
      const updatedPrice = document.getElementById('wishlist-price').value;
      const updatedPriority = document.getElementById('wishlist-priority').value;
      const updatedNotes = document.getElementById('wishlist-notes').value;

      await this.updateWishlistItem(id, updatedName, updatedPrice, updatedPriority, updatedNotes);

      // Ripristina il form
      document.getElementById('add-wishlist-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();
    });

    // Porta l'utente alla sezione del form
    document.getElementById('wishlist-section-tab').click();
  }

  // Aggiorna una nota
  async updateNote(id, title, content, category) {
    // Trova l'indice della nota
    const index = this.notes.findIndex(note => note.id === id);
    if (index === -1) return null;

    // Aggiorna i dati locali
    this.notes[index] = {
      ...this.notes[index],
      title,
      content,
      category
    };

    // Aggiorna Google Sheets (assumendo che la funzione esista)
    try {
      await googleSheetsService.updateRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'Note',
        id,
        [id, title, content, category, this.notes[index].date]
      );
      this.renderNotesAsCards();
      return this.notes[index];
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento della nota:', error);
      return null;
    }
  }

  // Aggiorna una spesa
  async updateExpense(id, amount, category, description) {
    // Trova l'indice della spesa
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index === -1) return null;

    // Aggiorna i dati locali
    this.expenses[index] = {
      ...this.expenses[index],
      amount: parseFloat(amount),
      category,
      description
    };

    // Aggiorna Google Sheets (assumendo che la funzione esista)
    try {
      await googleSheetsService.updateRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'ListaSpesa',
        id,
        [id, amount, category, description, this.expenses[index].date]
      );
      this.renderExpensesAsCards();
      return this.expenses[index];
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento della spesa:', error);
      return null;
    }
  }

  // Aggiorna un elemento della wishlist
  async updateWishlistItem(id, name, estimatedPrice, priority, notes) {
    // Trova l'indice dell'elemento
    const index = this.wishlist.findIndex(item => item.id === id);
    if (index === -1) return null;

    // Aggiorna i dati locali
    this.wishlist[index] = {
      ...this.wishlist[index],
      name,
      estimatedPrice: parseFloat(estimatedPrice),
      priority,
      notes
    };

    // Aggiorna Google Sheets (assumendo che la funzione esista)
    try {
      await googleSheetsService.updateRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'SpeseCasa',
        id,
        [id, name, estimatedPrice, priority, notes]
      );
      this.renderWishlistAsCards();
      return this.wishlist[index];
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento dell\'elemento della wishlist:', error);
      return null;
    }
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
      this.renderNotesAsCards();
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
      this.renderExpensesAsCards();
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
      this.renderWishlistAsCards();
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
      this.renderNotesAsCards();
    }
  }

  // Rimuove una spesa
  removeExpense(id) {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.renderExpensesAsCards();
    }
  }

  // Rimuove un elemento dalla wishlist
  removeWishlistItem(id) {
    const index = this.wishlist.findIndex(item => item.id === id);
    if (index !== -1) {
      this.wishlist.splice(index, 1);
      this.renderWishlistAsCards();
    }
  }
}

export const expenseManager = new ExpenseManager();