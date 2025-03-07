import { googleAuthService } from '../../admin/js/google-auth-service.js';
import { expenseManager } from './modules/expenseEstimator.js';
import { dataSyncService } from '../../admin/js/data-sync-service.js';
import TEMA from './modules/theme.js'
import MDL from './modules/modal.js';

document.addEventListener('DOMContentLoaded', () => {
	// Inizializza il sistema modal
	MDL.init();

	// Inizializza il tema
	TEMA.init();

	// Inizializza l'autenticazione Google
	googleAuthService.initClient();

	// Verifica se l'utente è già autenticato all'avvio
	if (googleAuthService.isAuthenticated()) {
		// Inizializza i contenitori se l'utente è già autenticato
		expenseManager.init(
			document.getElementById('notes-container'),
			document.getElementById('expenses-container'),
			document.getElementById('wishlist-container')
		);
	}

	// Inizializza il gestore spese con i container per le tabelle
	document.getElementById('google-auth-btn').addEventListener('click', () => {
		if (googleAuthService.isAuthenticated()) {
			googleAuthService.logout();
			// Nascondi o pulisci i contenitori quando l'utente fa logout
			clearContainers();
		} else {
			googleAuthService.authenticate(() => {
				// Inizializza solo dopo l'autenticazione
				expenseManager.init(
					document.getElementById('notes-container'),
					document.getElementById('expenses-container'),
					document.getElementById('wishlist-container')
				);
			});
		}
	});

	// Funzione per pulire i contenitori
	function clearContainers() {
		document.getElementById('notes-container').innerHTML = '';
		document.getElementById('expenses-container').innerHTML = '';
		document.getElementById('wishlist-container').innerHTML = '';
	}

	// Aggiungi listener per i form di aggiunta elementi
	setupFormListeners();

	// Aggiungi listener per il pulsante sincronizzazione
	document.getElementById('sync-btn').addEventListener('click', async () => {
		await dataSyncService.syncDataToSheets();
	});
});

// Imposta i listener per i form
function setupFormListeners() {
  // Form per aggiungere note
  document.getElementById('add-note-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const category = document.getElementById('note-category').value;

    if (title && content) {
      expenseManager.addNote(title, content, category);
      document.getElementById('add-note-form').reset();
    }
  });

  // Form per aggiungere spese
  document.getElementById('add-expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;

    if (amount && category) {
      expenseManager.addExpense(amount, category, description);
      document.getElementById('add-expense-form').reset();
    }
  });

  // Form per aggiungere elementi alla wishlist
  document.getElementById('add-wishlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('wishlist-name').value;
    const price = document.getElementById('wishlist-price').value;
    const priority = document.getElementById('wishlist-priority').value;
    const notes = document.getElementById('wishlist-notes').value;

    if (name && price) {
      expenseManager.addWishlistItem(name, price, priority, notes);
      document.getElementById('add-wishlist-form').reset();
    }
  });
}