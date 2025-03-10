// expenseEstimator.js
import { noteManager } from './note.js';
import { expenseTracker } from './expense.js';
import { wishlistManager } from './wishlist.js';

class ExpenseEstimator {
  constructor() {
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

    // Inizializza i manager
    noteManager.init(this.containers.notes);
		expenseTracker.init(this.containers.expenses);
    wishlistManager.init(this.containers.wishlist);
  }

  // Funzioni di delega ai rispettivi manager
  async addNote(title, content, category) {
    return await noteManager.addNote(title, content, category);
  }

  async addExpense(amount, category, description) {
    return await expenseTracker.addExpense(amount, category, description);
  }

  async addWishlistItem(name, estimatedPrice, priority, notes = '') {
    return await wishlistManager.addWishlistItem(name, estimatedPrice, priority, notes);
  }

  // Metodo per ricaricare tutti i dati
  async refreshAll() {
    await Promise.all([
      noteManager.loadNotes(),
      expenseTracker.loadExpenses(),
      wishlistManager.loadWishlist()
    ]);
  }
}

export const expenseManager = new ExpenseEstimator();