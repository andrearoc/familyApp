// expense.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../admin/js/config.js';
import { googleSheetsService } from '../../../admin/js/sheet/google-sheets-service.js';
import Card from './card.js';
import Slider from './slider.js';

class ExpenseTracker {
  constructor() {
    this.expenses = [];
    this.slider = null;
    this.container = null;
  }

  init(container) {
    this.container = container;
    this.prepareSliderContainer();
    this.initSlider();
    this.loadExpenses();
  }

  prepareSliderContainer() {
    if (this.container) {
      this.container.innerHTML = '<div id="expenses-slider" class="slider-section"></div>';
    }
  }

  initSlider() {
    this.slider = new Slider({
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

    this.slider.init();
  }

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

  renderExpensesAsCards() {
    if (!this.slider) return;

    // Pulisci gli slide esistenti
    this.slider.clearSlides();

    // Crea una card per ogni spesa
    this.expenses.forEach(expense => {
      const card = Card.createExpenseCard(expense, {
        onDelete: (id) => this.removeExpense(id),
        onEdit: (id) => this.editExpense(id)
      });

      // Aggiungi la card allo slider
      this.slider.addSlide(card.render(), false);
    });

    // Se non ci sono spese, mostra un messaggio
    if (this.expenses.length === 0) {
      const emptyCard = new Card({
        title: 'Nessuna spesa',
        content: 'Clicca sul pulsante "Aggiungi Spesa" per registrare la tua prima spesa.',
        cardClass: 'card card-empty'
      });
      this.slider.addSlide(emptyCard.render(), false);
    }
  }

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

    // Aggiorna Google Sheets
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

  async removeExpense(id) {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.renderExpensesAsCards();
    }

    // Rimuovi dal foglio Google
    try {
      await googleSheetsService.removeRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'ListaSpesa',
        id
      );
    } catch (error) {
      console.error('❌ Errore durante la rimozione della spesa:', error);
    }
  }
}

export const expenseTracker = new ExpenseTracker();