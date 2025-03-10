import { GOOGLE_CONFIG } from '../config.js';
import { googleAuthService } from '../google-auth-service.js';

export class GoogleCalendarService {
  // Carica l'API di Calendar se non è già disponibile
  async loadCalendarAPI() {
    return new Promise((resolve, reject) => {
      try {
        window.gapi.client.load('calendar', 'v3', () => {
          console.log('✅ API Calendar caricata');
          resolve();
        });
      } catch (error) {
        console.error('❌ Errore caricamento API Calendar:', error);
        reject(error);
      }
    });
  }

  // Ottieni eventi dal calendario
  async getEvents(calendarId = GOOGLE_CONFIG.CALENDAR_ID, timeMin, timeMax) {
    try {
      // Assicurati che sia autenticato
      if (!googleAuthService.isAuthenticated()) {
        console.error('Utente non autenticato');
        return null;
      }

      // Controlla che le API siano caricate
      if (!window.gapi || !window.gapi.client) {
        console.error('API Google non disponibili');
        return null;
      }

      // Assicurati che l'API calendar sia caricata
      if (!window.gapi.client.calendar) {
        await this.loadCalendarAPI();
      }

      // Configura i parametri per la richiesta
      const params = {
        'calendarId': calendarId,
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 50,
        'orderBy': 'startTime'
      };

      // Aggiungi opzionalmente timeMin e timeMax se forniti
      if (timeMin) params.timeMin = timeMin.toISOString();
      if (timeMax) params.timeMax = timeMax.toISOString();

      const response = await window.gapi.client.calendar.events.list(params);

      console.log(`✅ Lettura eventi calendario ${calendarId}`);
      if (response && response.result && response.result.items) {
        return response.result.items;
      } else {
        console.warn('Risposta senza eventi');
        return [];
      }
    } catch (error) {
      console.error(`❌ Errore lettura eventi calendario ${calendarId}:`, error);
      return null;
    }
  }

  // Crea un nuovo evento nel calendario
  async createEvent(calendarId = GOOGLE_CONFIG.CALENDAR_ID, event) {
    try {
      // Assicurati che sia autenticato
      if (!googleAuthService.isAuthenticated()) {
        await new Promise((resolve) => {
          googleAuthService.authenticate(resolve);
        });
      }

      // Assicurati che l'API calendar sia caricata
      if (!window.gapi.client.calendar) {
        await this.loadCalendarAPI();
      }

      const response = await window.gapi.client.calendar.events.insert({
        'calendarId': calendarId,
        'resource': event
      });

      console.log(`✅ Evento creato in ${calendarId}`);
      return response.result;
    } catch (error) {
      console.error(`❌ Errore creazione evento in ${calendarId}:`, error);
      throw error;
    }
  }

  // Aggiorna un evento esistente
  async updateEvent(calendarId = GOOGLE_CONFIG.CALENDAR_ID, eventId, event) {
    try {
      // Assicurati che sia autenticato
      if (!googleAuthService.isAuthenticated()) {
        await new Promise((resolve) => {
          googleAuthService.authenticate(resolve);
        });
      }

      // Assicurati che l'API calendar sia caricata
      if (!window.gapi.client.calendar) {
        await this.loadCalendarAPI();
      }

      const response = await window.gapi.client.calendar.events.update({
        'calendarId': calendarId,
        'eventId': eventId,
        'resource': event
      });

      console.log(`✅ Evento ${eventId} aggiornato in ${calendarId}`);
      return response.result;
    } catch (error) {
      console.error(`❌ Errore aggiornamento evento ${eventId}:`, error);
      throw error;
    }
  }

  // Elimina un evento esistente
  async deleteEvent(calendarId = GOOGLE_CONFIG.CALENDAR_ID, eventId) {
    try {
      // Assicurati che sia autenticato
      if (!googleAuthService.isAuthenticated()) {
        await new Promise((resolve) => {
          googleAuthService.authenticate(resolve);
        });
      }

      // Assicurati che l'API calendar sia caricata
      if (!window.gapi.client.calendar) {
        await this.loadCalendarAPI();
      }

      const response = await window.gapi.client.calendar.events.delete({
        'calendarId': calendarId,
        'eventId': eventId
      });

      console.log(`✅ Evento ${eventId} eliminato da ${calendarId}`);
      return true;
    } catch (error) {
      console.error(`❌ Errore eliminazione evento ${eventId}:`, error);
      return false;
    }
  }

  // Incorpora il calendario in una pagina web
  embedCalendar(containerId, calendarId = GOOGLE_CONFIG.CALENDAR_ID) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Contenitore ${containerId} non trovato`);
      return false;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';

    container.innerHTML = '';
    container.appendChild(iframe);

    console.log(`✅ Calendario incorporato in ${containerId}`);
    return true;
  }
}

export const googleCalendarService = new GoogleCalendarService();