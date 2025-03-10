// note.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../../admin/js/config.js';
import { googleSheetsService } from '../../../../admin/js/sheet/google-sheets-service.js';
import Card from '../card.js';
import Slider from '../slider.js';

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
		if (!note) {
			return;
		}

		// Trova la card dell'elemento da modificare - nota che aggiungiamo il check per card-note
		// per essere più specifici
		const cardElement = document.querySelector(`.card[data-id="${id}"].card-note`);
		if (!cardElement) {
			return;
		}

		// Salva il riferimento all'elemento attuale per il ripristino in caso di annullamento
		const originalNote = { ...note };

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
					<label for="inline-note-title">Titolo</label>
					<input type="text" id="inline-note-title-${id}" value="${note.title}" required>
				</div>
				<div class="form-group">
					<label for="inline-note-content">Contenuto</label>
					<textarea id="inline-note-content-${id}" required style="min-height: 100px">${note.content}</textarea>
				</div>
				<div class="form-group">
					<label for="inline-note-category">Categoria</label>
					<input type="text" id="inline-note-category-${id}" value="${note.category}" required>
				</div>
				<div class="button-group">
					<button type="button" class="confirm-btn">Conferma</button>
					<button type="button" class="cancel-btn">Annulla</button>
				</div>
			</div>
		`;

		// Cambio il titolo per indicare che è in modalità modifica
		cardTitle.innerHTML = `<i class="fas fa-edit"></i> Modifica Nota`;

		// Aggiungo classe per lo stile della card in modalità modifica
		cardElement.classList.add('card-editing');

		// Aggiungi event listener per conferma
		const confirmBtn = cardContent.querySelector('.confirm-btn');
		confirmBtn.addEventListener('click', async () => {
			const updatedTitle = cardContent.querySelector(`#inline-note-title-${id}`).value;
			const updatedContent = cardContent.querySelector(`#inline-note-content-${id}`).value;
			const updatedCategory = cardContent.querySelector(`#inline-note-category-${id}`).value;

			// Verifica che i campi obbligatori non siano vuoti
			if (!updatedTitle || !updatedContent || !updatedCategory) {
				alert('Tutti i campi sono obbligatori');
				return;
			}

			// Aggiorna l'elemento
			await this.updateNote(note.id, updatedTitle, updatedContent, updatedCategory);

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