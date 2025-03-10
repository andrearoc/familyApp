import { googleAuthService } from '../../admin/js/google-auth-service.js';
import { expenseManager } from './modules/expenseEstimator.js';
import { dataSyncService } from '../../admin/js/sheet/data-sync-service.js';
import { googleCalendarService } from '../../admin/js/calendar/google-calendar-service.js';
import TEMA from './modules/theme.js';
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

    // Inizializza e incorpora il calendario
    googleCalendarService.embedCalendar('calendar-container');

    // Carica gli eventi del calendario
    loadCalendarEvents();
  }

  // Gestione autenticazione
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

        // Inizializza e incorpora il calendario dopo l'autenticazione
        googleCalendarService.embedCalendar('calendar-container');

        // Carica gli eventi del calendario
        loadCalendarEvents();
      });
    }
  });

  // Funzione per pulire i contenitori
  function clearContainers() {
    document.getElementById('notes-container').innerHTML = '';
    document.getElementById('expenses-container').innerHTML = '';
    document.getElementById('wishlist-container').innerHTML = '';
    document.getElementById('calendar-container').innerHTML = '';
  }

  // Aggiungi listener per i form di aggiunta elementi
  setupFormListeners();

  // Aggiungi listener per i pulsanti di apertura modali
  setupModalButtons();

  // Aggiungi listener per il pulsante sincronizzazione
  document.getElementById('sync-btn').addEventListener('click', async () => {
    await dataSyncService.syncDataToSheets();
    // Aggiorna tutti i dati dopo la sincronizzazione
    await expenseManager.refreshAll();
  });
});

// Funzione per caricare gli eventi del calendario
async function loadCalendarEvents() {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const events = await googleCalendarService.getEvents(
    undefined, // Usa l'ID predefinito
    today,
    nextMonth
  );

  console.log('Eventi caricati:', events);
  // Elabora gli eventi come necessario
}

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
      const event = {
        'summary': title,
        'description': description,
        'start': {
          'dateTime': new Date(start).toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': new Date(end).toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      googleCalendarService.createEvent(undefined, event)
        .then(() => {
          // Aggiorna la visualizzazione del calendario
          googleCalendarService.embedCalendar('calendar-container');
          document.getElementById('add-event-form').reset();
          MDL.close();
        });
    }
  });
}

// Imposta i listener per i pulsanti di apertura modali
function setupModalButtons() {
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
}