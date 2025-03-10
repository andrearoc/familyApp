// calendar.js
import { GOOGLE_CONFIG } from '../../../../admin/js/config.js';
import { googleCalendarService } from '../../../../admin/js/calendar/google-calendar-service.js';
import Card from '../card.js';
import Slider from '../slider.js';
import MDL from '../modal.js';

class CalendarManager {
  constructor() {
    this.events = [];
    this.slider = null;
    this.container = null;
  }

  init(container) {
    this.container = container;
    this.prepareSliderContainer();
    this.initSlider();
    this.loadEvents();
  }

  prepareSliderContainer() {
    if (this.container) {
      this.container.innerHTML = '<div id="calendar-events-slider" class="slider-section"></div>';
    }
  }

  initSlider() {
    this.slider = new Slider({
      containerId: 'calendar-events-slider',
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

    this.slider.init();
  }

  async loadEvents() {
    try {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      const events = await googleCalendarService.getEvents(
        GOOGLE_CONFIG.CALENDAR_ID,
        today,
        nextMonth
      );

      if (events && Array.isArray(events)) {
        this.events = events.map(event => this.formatEvent(event));
        this.renderEventsAsCards();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento degli eventi:', error);
    }
  }

  formatEvent(event) {
    // Estrai le date di inizio e fine
    const startDate = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    const endDate = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);

    // Controlla se è un evento tutto il giorno
    const isAllDay = !event.start.dateTime;

    // Formatta le date
    const formatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: isAllDay ? undefined : '2-digit',
      minute: isAllDay ? undefined : '2-digit'
    };

    const formattedStart = startDate.toLocaleDateString('it-IT', formatOptions);
    const formattedEnd = endDate.toLocaleDateString('it-IT', formatOptions);

    return {
      id: event.id,
      title: event.summary || 'Evento senza titolo',
      description: event.description || '',
      location: event.location || '',
      startDate: startDate,
      endDate: endDate,
      isAllDay: isAllDay,
      formattedStart: formattedStart,
      formattedEnd: formattedEnd,
      color: event.colorId || '',
      rawEvent: event
    };
  }

  renderEventsAsCards() {
    if (!this.slider) return;

    // Pulisci gli slide esistenti
    this.slider.clearSlides();

    // Ordina gli eventi per data di inizio
    this.events.sort((a, b) => a.startDate - b.startDate);

    // Crea una card per ogni evento
    this.events.forEach(event => {
      const card = this.createEventCard(event);
      this.slider.addSlide(card.render(), false);
    });

    // Se non ci sono eventi, mostra un messaggio
    if (this.events.length === 0) {
      const emptyCard = new Card({
        title: 'Nessun evento',
        content: 'Clicca sul pulsante "Aggiungi Evento" per creare il tuo primo evento.',
        cardClass: 'card card-empty'
      });
      this.slider.addSlide(emptyCard.render(), false);
    }
  }

  createEventCard(event) {
    // Costruisci il contenuto della card
    let content = '';

    // Aggiungi la data/ora formattata
    if (event.isAllDay) {
      content += `<div class="event-date">Tutto il giorno - ${event.formattedStart}</div>`;
    } else {
      if (this.isSameDay(event.startDate, event.endDate)) {
        // Stesso giorno, mostra solo orari
        content += `<div class="event-date">${event.formattedStart} - ${event.endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>`;
      } else {
        // Giorni diversi, mostra entrambe le date complete
        content += `<div class="event-date">Da: ${event.formattedStart}<br>A: ${event.formattedEnd}</div>`;
      }
    }

    // Aggiungi descrizione se presente
    if (event.description) {
      content += `<div class="event-description">${event.description}</div>`;
    }

    // Aggiungi luogo se presente
    if (event.location) {
      content += `<div class="event-location">📍 ${event.location}</div>`;
    }

    return new Card({
      id: event.id,
      title: event.title,
      content: content,
      category: event.isAllDay ? 'Giornata intera' : 'Evento',
      date: event.formattedStart.split(',')[0], // Solo il giorno della settimana
      type: 'event',
      cardClass: `card card-event ${this.getEventColorClass(event.color)}`,
      data: event,
      onDelete: (id) => this.removeEvent(id),
      onEdit: (id) => this.editEvent(id)
    });
  }

  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  getEventColorClass(colorId) {
    // Mappa dei colorId di Google Calendar a classi CSS
    const colorMap = {
      '1': 'event-blue',
      '2': 'event-green',
      '3': 'event-purple',
      '4': 'event-red',
      '5': 'event-yellow',
      '6': 'event-orange',
      '7': 'event-cyan',
      '8': 'event-grey',
      '9': 'event-brown',
      '10': 'event-teal',
      '11': 'event-pink'
    };

    return colorMap[colorId] || 'event-default';
  }

  async removeEvent(id) {
    try {
      const result = await googleCalendarService.deleteEvent(
        GOOGLE_CONFIG.CALENDAR_ID,
        id
      );

      if (result) {
        // Rimuovi l'evento dall'array locale
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
          this.events.splice(index, 1);
          this.renderEventsAsCards();
        }
      }
    } catch (error) {
      console.error('❌ Errore durante l\'eliminazione dell\'evento:', error);
    }
  }

  editEvent(id) {
    const event = this.events.find(event => event.id === id);
    if (!event) return;

    // Imposta i valori del form di modifica
    const eventStartElement = document.getElementById('event-start');
    const eventEndElement = document.getElementById('event-end');

    document.getElementById('event-title').value = event.title;

    // Formatta le date per l'input datetime-local
    if (event.isAllDay) {
      // Per eventi giornalieri, setta solo la data
      const startDate = this.formatDateForInput(event.startDate);
      const endDate = this.formatDateForInput(event.endDate);

      eventStartElement.value = startDate.split('T')[0] + 'T00:00';
      eventEndElement.value = endDate.split('T')[0] + 'T23:59';
    } else {
      eventStartElement.value = this.formatDateForInput(event.startDate);
      eventEndElement.value = this.formatDateForInput(event.endDate);
    }

    document.getElementById('event-description').value = event.description;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Evento';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-event-form button[type="submit"]');
		MDL.open('Modifica Evento', document.getElementById('add-event-form'));
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedTitle = document.getElementById('event-title').value;
      const updatedStart = document.getElementById('event-start').value;
      const updatedEnd = document.getElementById('event-end').value;
      const updatedDescription = document.getElementById('event-description').value;

      const updatedEvent = {
        'summary': updatedTitle,
        'description': updatedDescription,
        'start': {
          'dateTime': new Date(updatedStart).toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': new Date(updatedEnd).toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      await this.updateEvent(id, updatedEvent);

      // Ripristina il form
      document.getElementById('add-event-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();

      // Chiudi il modale se disponibile
      if (window.MDL && typeof window.MDL.close === 'function') {
        window.MDL.close();
      }
    });

    // Apri il modale se disponibile
    if (window.MDL && typeof window.MDL.open === 'function') {
      const modalContent = document.getElementById('add-event-modal');
      if (modalContent) {
        const modalTitle = 'Modifica Evento';
        const formContainer = modalContent.querySelector('.form-container');
        window.MDL.open(modalTitle, formContainer.cloneNode(true));

        // Riconnetti gli event listener al form clonato
        this.setupModalFormListeners(id, event);
      }
    }
  }

  setupModalFormListeners(eventId, eventData) {
    const modalForm = document.querySelector('#modale-risultato form');
    if (modalForm) {
      modalForm.id = 'add-event-form-modal';

      // Imposta i valori nel form modale
      modalForm.querySelector('#event-title').value = eventData.title;

      const eventStartElement = modalForm.querySelector('#event-start');
      const eventEndElement = modalForm.querySelector('#event-end');

      if (eventData.isAllDay) {
        const startDate = this.formatDateForInput(eventData.startDate);
        const endDate = this.formatDateForInput(eventData.endDate);

        eventStartElement.value = startDate.split('T')[0] + 'T00:00';
        eventEndElement.value = endDate.split('T')[0] + 'T23:59';
      } else {
        eventStartElement.value = this.formatDateForInput(eventData.startDate);
        eventEndElement.value = this.formatDateForInput(eventData.endDate);
      }

      modalForm.querySelector('#event-description').value = eventData.description;

      // Aggiungi handler per l'aggiornamento
      const updateBtn = document.createElement('button');
      updateBtn.textContent = 'Aggiorna Evento';
      updateBtn.classList.add('update-btn');
      updateBtn.type = 'button';

      // Sostituisci il pulsante di invio con quello di aggiornamento
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
        submitBtn.style.display = 'none';

        updateBtn.addEventListener('click', async () => {
          const updatedTitle = modalForm.querySelector('#event-title').value;
          const updatedStart = modalForm.querySelector('#event-start').value;
          const updatedEnd = modalForm.querySelector('#event-end').value;
          const updatedDescription = modalForm.querySelector('#event-description').value;

          const updatedEvent = {
            'summary': updatedTitle,
            'description': updatedDescription,
            'start': {
              'dateTime': new Date(updatedStart).toISOString(),
              'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            'end': {
              'dateTime': new Date(updatedEnd).toISOString(),
              'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          };

          await this.updateEvent(eventId, updatedEvent);

          // Chiudi il modale
          if (window.MDL && typeof window.MDL.close === 'function') {
            window.MDL.close();
          }
        });
      }
    }
  }

  formatDateForInput(date) {
    // Formatta una data per l'input datetime-local
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  }

  async updateEvent(id, eventData) {
    try {
      const result = await googleCalendarService.updateEvent(
        GOOGLE_CONFIG.CALENDAR_ID,
        id,
        eventData
      );

      if (result) {
        // Ricarica tutti gli eventi per aggiornare la vista
        await this.loadEvents();
      }
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento dell\'evento:', error);
    }
  }

  async addEvent(title, start, end, description = '') {
    try {
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

      const result = await googleCalendarService.createEvent(
        GOOGLE_CONFIG.CALENDAR_ID,
        event
      );

      if (result) {
        // Aggiungi il nuovo evento all'array locale
        const formattedEvent = this.formatEvent(result);
        this.events.push(formattedEvent);
        this.renderEventsAsCards();
        return formattedEvent;
      }
    } catch (error) {
      console.error('❌ Errore durante la creazione dell\'evento:', error);
      return null;
    }
  }
}

export const calendarManager = new CalendarManager();