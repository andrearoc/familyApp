/**
 * Modulo per la gestione centralizzata degli eventi dell'applicazione
 */
import { googleAuthService } from '../../../admin/js/google-auth-service.js';
import { dataSyncService } from '../../../admin/js/sheet/data-sync-service.js';
import { expenseManager } from './sheet/expenseEstimator.js';
import { calendarManager } from './calendar/calendar.js';
import MDL from './modal.js';
import TOOL from './tools/tool.js';

const EVENTS = {
	init: () => {
		// Gestione autenticazione
		EVENTS.setupAuthListeners();

		// Gestione modali e bottoni
		EVENTS.setupModalButtons();

		// Aggiungi il setup del pulsante dell'app
		EVENTS.setupAppButton();

		// Gestione form
		EVENTS.setupFormListeners();

		// Gestione sincronizzazione
		EVENTS.setupSyncButton();
	},

	setupAppButton: () => {
		const openAppButton = document.getElementById('openApp');
		if (openAppButton) {
			openAppButton.addEventListener('click', () => {
				const toolsContent = document.createElement('div');
				toolsContent.id = 'tools-modal-content';
				toolsContent.className = 'tools-container';

				TOOL.init(toolsContent);

				MDL.open('Strumenti dell\'applicazione', toolsContent);
			});
		}
	},

  setupAuthListeners: () => {
    document.getElementById('google-auth-btn').addEventListener('click', () => {
      if (googleAuthService.isAuthenticated()) {
        googleAuthService.logout();
        // Nascondi o pulisci i contenitori quando l'utente fa logout
        EVENTS.clearContainers();
      } else {
        googleAuthService.authenticate(() => {
          // Inizializza solo dopo l'autenticazione
          expenseManager.init(
            document.getElementById('notes-container'),
            document.getElementById('expenses-container'),
            document.getElementById('wishlist-container')
          );

          // Carica gli eventi del calendario tramite calendarManager
          calendarManager.init(document.getElementById('calendar-events-container'));
        });
      }
    });
  },

  setupSyncButton: () => {
    document.getElementById('sync-btn').addEventListener('click', async () => {
      await dataSyncService.syncDataToSheets();
      // Aggiorna tutti i dati dopo la sincronizzazione
      await expenseManager.refreshAll();
    });
  },

  setupFormListeners: () => {
    // Form per aggiungere note
    document.getElementById('add-note-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('note-title').value;
      const content = document.getElementById('note-content').value;
      const category = document.getElementById('note-category').value;

      if (title && content) {
        expenseManager.addNote(title, content, category);
        document.getElementById('add-note-form').reset();
        MDL.close(); // Chiudi il modale dopo l'aggiunta
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
        MDL.close(); // Chiudi il modale dopo l'aggiunta
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
        MDL.close(); // Chiudi il modale dopo l'aggiunta
      }
    });

    // Form per aggiungere eventi al calendario
    document.getElementById('add-event-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('event-title').value;
      const start = document.getElementById('event-start').value;
      const end = document.getElementById('event-end').value;
      const description = document.getElementById('event-description').value;

      if (title && start && end) {
        // Usa calendarManager per aggiungere l'evento
        calendarManager.addEvent(title, start, end, description)
          .then(() => {
            document.getElementById('add-event-form').reset();
            MDL.close();
          });
      }
    });
  },

  setupModalButtons: () => {
    const addButtons = document.querySelectorAll('.add-button');

    addButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal-target');
        const modalContent = document.getElementById(modalId);

        if (modalContent) {
          // Usa il titolo dell'h3 per il modale
          const modalTitle = modalContent.querySelector('h3').textContent;

          // Clona il contenuto del form per il modale
          const formContainer = modalContent.querySelector('.form-container');

          MDL.open(modalTitle, formContainer.cloneNode(true));

          // Riconnetti gli event listener al form clonato
          const modalForm = document.querySelector('#modale-risultato form');
          if (modalForm) {
            modalForm.id = modalContent.querySelector('form').id;
            modalForm.addEventListener('submit', (e) => {
              e.preventDefault();

              // Trasferisci i valori dai campi del modale ai campi originali
              const formId = modalForm.id;
              const originalForm = document.getElementById(formId);

              // Trova tutti gli input, select e textarea nel form del modale
              const formElements = modalForm.querySelectorAll('input, select, textarea');

              // Aggiorna i valori corrispondenti nel form originale
              formElements.forEach(element => {
                const originalElement = originalForm.querySelector(`#${element.id}`);
                if (originalElement) {
                  originalElement.value = element.value;
                }
              });

              // Simula l'invio del form originale
              const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true,
              });
              originalForm.dispatchEvent(submitEvent);
            });
          }
        }
      });
    });
  },

  clearContainers: () => {
    document.getElementById('notes-container').innerHTML = '';
    document.getElementById('expenses-container').innerHTML = '';
    document.getElementById('wishlist-container').innerHTML = '';
    document.getElementById('calendar-container').innerHTML = '';
    document.getElementById('calendar-events-container').innerHTML = '';
  }
};

export default EVENTS;