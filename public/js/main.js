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
import TOOL from './modules/tools/tool.js';

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

    // Inizializza il modulo degli strumenti
    TOOL.init(document.getElementById('tools-container'));
  } else {
    // Se l'utente non è autenticato, possiamo comunque inizializzare TOOL
    // se vogliamo renderlo disponibile anche a utenti non autenticati
    const toolsContainer = document.getElementById('tools-container');
    if (toolsContainer) {
      TOOL.init(toolsContainer);
    }
  }

  // Event listener per la pulizia delle risorse prima di chiudere la pagina
  window.addEventListener('beforeunload', () => {
    TOOL.cleanup();
  });
});