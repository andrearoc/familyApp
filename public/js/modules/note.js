// note.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../admin/js/config.js';
import { googleSheetsService } from '../../../admin/js/sheet/google-sheets-service.js';
import Card from './card.js';
import Slider from './slider.js';

class NoteManager {
  constructor() {
    this.notes = [];
    this.slider = null;
    this.container = null;
  }

  init(container) {
    this.container = container;
    this.prepareSliderContainer();
    this.initSlider();
    this.loadNotes();
  }

  prepareSliderContainer() {
    if (this.container) {
      this.container.innerHTML = '<div id="notes-slider" class="slider-section"></div>';
    }
  }

  initSlider() {
    this.slider = new Slider({
      containerId: 'notes-slider',
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

  async loadNotes() {
    try {
      const data = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.NOTES
      );

      if (data && Array.isArray(data)) {
        this.notes = data.map(row => ({
          id: row[0],
          title: row[1],
          content: row[2],
          category: row[3],
          date: row[4]
        }));

        this.renderNotesAsCards();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento delle note:', error);
    }
  }

  renderNotesAsCards() {
    if (!this.slider) return;

    // Pulisci gli slide esistenti
    this.slider.clearSlides();

    // Crea una card per ogni nota
    this.notes.forEach(note => {
      const card = Card.createNoteCard(note, {
        onDelete: (id) => this.removeNote(id),
        onEdit: (id) => this.editNote(id)
      });

      // Aggiungi la card allo slider
      this.slider.addSlide(card.render(), false);
    });

    // Se non ci sono note, mostra un messaggio
    if (this.notes.length === 0) {
      const emptyCard = new Card({
        title: 'Nessuna nota',
        content: 'Clicca sul pulsante "Aggiungi Nota" per creare la tua prima nota.',
        cardClass: 'card card-empty'
      });
      this.slider.addSlide(emptyCard.render(), false);
    }
  }

  editNote(id) {
    const note = this.notes.find(note => note.id === id);
    if (!note) return;

    // Qui puoi implementare la logica per aprire un form di modifica
    // Per ora, impostiamo solo i valori del form di aggiunta note
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('note-category').value = note.category;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Nota';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-note-form button[type="submit"]');
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedTitle = document.getElementById('note-title').value;
      const updatedContent = document.getElementById('note-content').value;
      const updatedCategory = document.getElementById('note-category').value;

      await this.updateNote(id, updatedTitle, updatedContent, updatedCategory);

      // Ripristina il form
      document.getElementById('add-note-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();
    });

    // Porta l'utente alla sezione del form
    document.getElementById('notes-section-tab').click();
  }

  async updateNote(id, title, content, category) {
    // Trova l'indice della nota
    const index = this.notes.findIndex(note => note.id === id);
    if (index === -1) return null;

    // Aggiorna i dati locali
    this.notes[index] = {
      ...this.notes[index],
      title,
      content,
      category
    };

    // Aggiorna Google Sheets
    try {
      await googleSheetsService.updateRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'Note',
        id,
        [id, title, content, category, this.notes[index].date]
      );
      this.renderNotesAsCards();
      return this.notes[index];
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento della nota:', error);
      return null;
    }
  }

  async addNote(title, content, category) {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      category,
      date: new Date().toLocaleDateString()
    };

    this.notes.push(newNote);

    // Aggiorna Google Sheets
    const noteValues = [[
      newNote.id,
      newNote.title,
      newNote.content,
      newNote.category,
      newNote.date
    ]];

    try {
      await googleSheetsService.writeSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.NOTES,
        noteValues
      );
      this.renderNotesAsCards();
      return newNote;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiunta della nota:', error);
      // Rimuovi la nota dal array locale in caso di errore
      const index = this.notes.findIndex(note => note.id === newNote.id);
      if (index !== -1) this.notes.splice(index, 1);
      return null;
    }
  }

  async removeNote(id) {
    const index = this.notes.findIndex(note => note.id === id);
    if (index !== -1) {
      this.notes.splice(index, 1);
      this.renderNotesAsCards();
    }

    // Rimuovi dal foglio Google
    try {
      await googleSheetsService.removeRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'Note',
        id
      );
    } catch (error) {
      console.error('❌ Errore durante la rimozione della nota:', error);
    }
  }
}

export const noteManager = new NoteManager();