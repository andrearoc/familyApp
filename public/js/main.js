/**
 * File principale dell'applicazione
 * Si occupa delle inizializzazioni e del coordinamento dei moduli
 */
import { googleAuthService } from '../../admin/js/google-auth-service.js';
import { expenseManager } from './modules/sheet/expenseEstimator.js';
import { calendarManager } from './modules/calendar/calendar.js';

import TEMA from './modules/theme.js';
import MDL from './modules/modal.js';
import TAB from './modules/tabManager.js';
import EVENTS from './modules/eventsManager.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inizializza i moduli dell'interfaccia utente
  MDL.init();  // Sistema modal
  TEMA.init(); // Tema
  TAB.init();  // Sistema di gestione dei tab

  // Inizializza il sistema di gestione degli eventi
  EVENTS.init();

  // Inizializza l'autenticazione Google
  googleAuthService.initClient();

  // Inizializza i contenitori se l'utente è già autenticato
  if (googleAuthService.isAuthenticated()) {
    expenseManager.init(
      document.getElementById('notes-container'),
      document.getElementById('expenses-container'),
      document.getElementById('wishlist-container')
    );

    // Carica gli eventi del calendario
    calendarManager.init(document.getElementById('calendar-events-container'));
  }
});