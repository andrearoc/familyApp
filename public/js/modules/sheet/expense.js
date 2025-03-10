// expense.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../../admin/js/config.js';
import { googleSheetsService } from '../../../../admin/js/sheet/google-sheets-service.js';
import Card from '../card.js';
import Slider from '../slider.js';

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

		// Trova la card dell'elemento da modificare
		const cardElement = document.querySelector(`.card[data-id="${id}"].card-expense`);
		if (!cardElement) return;

		// Salva il riferimento all'elemento attuale per il ripristino in caso di annullamento
		const originalExpense = { ...expense };

		// Trasforma i campi in input
		const cardContent = cardElement.querySelector('.card-content');
		const cardTitle = cardElement.querySelector('.card-title');

		// Backup del contenuto originale
		const originalContent = cardContent.innerHTML;
		const originalTitle = cardTitle.innerHTML;

		// Crea il form inline
		cardContent.innerHTML = `
			<div class="inline-edit-form">
				<div class="form-group">
					<label for="inline-expense-amount-${id}">Importo</label>
					<input type="number" id="inline-expense-amount-${id}" value="${expense.amount}" step="0.01" required>
				</div>
				<div class="form-group">
					<label for="inline-expense-category-${id}">Categoria</label>
					<input type="text" id="inline-expense-category-${id}" value="${expense.category}" required>
				</div>
				<div class="form-group">
					<label for="inline-expense-description-${id}">Descrizione</label>
					<textarea id="inline-expense-description-${id}" required>${expense.description}</textarea>
				</div>
				<div class="button-group">
					<button type="button" class="confirm-btn">Conferma</button>
					<button type="button" class="cancel-btn">Annulla</button>
				</div>
			</div>
		`;

		// Cambio il titolo per indicare che è in modalità modifica
		cardTitle.innerHTML = `<i class="fas fa-edit"></i> Modifica Spesa`;

		// Aggiungo classe per lo stile della card in modalità modifica
		cardElement.classList.add('card-editing');

		// Aggiungi event listener per conferma
		const confirmBtn = cardContent.querySelector('.confirm-btn');
		confirmBtn.addEventListener('click', async () => {
			const updatedAmount = cardContent.querySelector(`#inline-expense-amount-${id}`).value;
			const updatedCategory = cardContent.querySelector(`#inline-expense-category-${id}`).value;
			const updatedDescription = cardContent.querySelector(`#inline-expense-description-${id}`).value;

			// Verifica che i campi obbligatori non siano vuoti
			if (!updatedAmount || !updatedCategory || !updatedDescription) {
				alert('Tutti i campi sono obbligatori');
				return;
			}

			// Aggiorna l'elemento
			await this.updateExpense(expense.id, updatedAmount, updatedCategory, updatedDescription);

			// Ripristina la card alla visualizzazione normale
			cardElement.classList.remove('card-editing');
		});

		// Aggiungi event listener per annullamento
		const cancelBtn = cardContent.querySelector('.cancel-btn');
		cancelBtn.addEventListener('click', () => {
			// Ripristina il contenuto originale
			cardContent.innerHTML = originalContent;
			cardTitle.innerHTML = originalTitle;
			cardElement.classList.remove('card-editing');
		});

		return true;
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