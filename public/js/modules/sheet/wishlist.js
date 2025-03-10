// wishlist.js
import { SHEET_RANGES, GOOGLE_CONFIG } from '../../../../admin/js/config.js';
import { googleSheetsService } from '../../../../admin/js/sheet/google-sheets-service.js';
import Card from '../card.js';
import Slider from '../slider.js';

class WishlistManager {
  constructor() {
    this.wishlist = [];
    this.slider = null;
    this.container = null;
  }

  init(container) {
    this.container = container;
    this.prepareSliderContainer();
    this.initSlider();
    this.loadWishlist();
  }

  prepareSliderContainer() {
    if (this.container) {
      this.container.innerHTML = '<div id="wishlist-slider" class="slider-section"></div>';
    }
  }

  initSlider() {
    this.slider = new Slider({
      containerId: 'wishlist-slider',
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

  async loadWishlist() {
    try {
      const data = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.WISHLIST
      );

      if (data && Array.isArray(data)) {
        this.wishlist = data.map(row => ({
          id: row[0],
          name: row[1],
          estimatedPrice: parseFloat(row[2]),
          priority: row[3] || 'BASSA',
          notes: row[4] || ''
        }));

        this.renderWishlistAsCards();
      }
    } catch (error) {
      console.error('❌ Errore durante il caricamento della wishlist:', error);
    }
  }

  renderWishlistAsCards() {
    if (!this.slider) return;

    // Pulisci gli slide esistenti
    this.slider.clearSlides();

    // Crea una card per ogni elemento della wishlist
    this.wishlist.forEach(item => {
      const card = Card.createWishlistCard(item, {
        onDelete: (id) => this.removeWishlistItem(id),
        onEdit: (id) => this.editWishlistItem(id)
      });

      // Aggiungi la card allo slider
      this.slider.addSlide(card.render(), false);
    });

    // Se non ci sono elementi nella wishlist, mostra un messaggio
    if (this.wishlist.length === 0) {
      const emptyCard = new Card({
        title: 'Wishlist vuota',
        content: 'Clicca sul pulsante "Aggiungi alla Wishlist" per inserire il tuo primo desiderio.',
        cardClass: 'card card-empty'
      });
      this.slider.addSlide(emptyCard.render(), false);
    }
  }

	editWishlistItem(id) {
		const item = this.wishlist.find(item => item.id === id);
		if (!item) return;

		// Trova la card dell'elemento da modificare
		const cardElement = document.querySelector(`.card[data-id="${id}"].card-wishlist`);
		if (!cardElement) return;

		// Salva il riferimento all'elemento attuale per il ripristino in caso di annullamento
		const originalItem = { ...item };

		// Trasforma i campi in input
		const cardContent = cardElement.querySelector('.card-content');
		const cardTitle = cardElement.querySelector('.card-title');

		// Backup del contenuto originale
		const originalContent = cardContent.innerHTML;
		const originalTitle = cardTitle.innerHTML;

		// Crea il form inline con selezione per la priorità
		cardContent.innerHTML = `
			<div class="inline-edit-form">
				<div class="form-group">
					<label for="inline-wishlist-name-${id}">Nome</label>
					<input type="text" id="inline-wishlist-name-${id}" value="${item.name}" required>
				</div>
				<div class="form-group">
					<label for="inline-wishlist-price-${id}">Prezzo stimato</label>
					<input type="number" id="inline-wishlist-price-${id}" value="${item.estimatedPrice}" step="0.01" required>
				</div>
				<div class="form-group">
					<label for="inline-wishlist-priority-${id}">Priorità</label>
					<select id="inline-wishlist-priority-${id}" required>
						<option value="BASSA" ${item.priority === 'BASSA' ? 'selected' : ''}>Bassa</option>
						<option value="MEDIA" ${item.priority === 'MEDIA' ? 'selected' : ''}>Media</option>
						<option value="ALTA" ${item.priority === 'ALTA' ? 'selected' : ''}>Alta</option>
					</select>
				</div>
				<div class="form-group">
					<label for="inline-wishlist-notes-${id}">Note</label>
					<textarea id="inline-wishlist-notes-${id}">${item.notes || ''}</textarea>
				</div>
				<div class="button-group">
					<button type="button" class="confirm-btn">Conferma</button>
					<button type="button" class="cancel-btn">Annulla</button>
				</div>
			</div>
		`;

		// Cambio il titolo per indicare che è in modalità modifica
		cardTitle.innerHTML = `<i class="fas fa-edit"></i> Modifica Elemento`;

		// Aggiungo classe per lo stile della card in modalità modifica
		cardElement.classList.add('card-editing');

		// Aggiungi event listener per conferma
		const confirmBtn = cardContent.querySelector('.confirm-btn');
		confirmBtn.addEventListener('click', async () => {
			const updatedName = cardContent.querySelector(`#inline-wishlist-name-${id}`).value;
			const updatedPrice = cardContent.querySelector(`#inline-wishlist-price-${id}`).value;
			const updatedPriority = cardContent.querySelector(`#inline-wishlist-priority-${id}`).value;
			const updatedNotes = cardContent.querySelector(`#inline-wishlist-notes-${id}`).value;

			// Verifica che i campi obbligatori non siano vuoti
			if (!updatedName || !updatedPrice) {
				alert('Nome e prezzo sono campi obbligatori');
				return;
			}

			// Aggiorna l'elemento
			await this.updateWishlistItem(item.id, updatedName, updatedPrice, updatedPriority, updatedNotes);

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

  async updateWishlistItem(id, name, estimatedPrice, priority, notes) {
    // Trova l'indice dell'elemento
    const index = this.wishlist.findIndex(item => item.id === id);
    if (index === -1) return null;

    // Aggiorna i dati locali
    this.wishlist[index] = {
      ...this.wishlist[index],
      name,
      estimatedPrice: parseFloat(estimatedPrice),
      priority,
      notes
    };

    // Aggiorna Google Sheets
    try {
      await googleSheetsService.updateRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'SpeseCasa',
        id,
        [id, name, estimatedPrice, priority, notes]
      );
      this.renderWishlistAsCards();
      return this.wishlist[index];
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento dell\'elemento della wishlist:', error);
      return null;
    }
  }

  async addWishlistItem(name, estimatedPrice, priority, notes = '') {
    const newItem = {
      id: Date.now().toString(),
      name,
      estimatedPrice: parseFloat(estimatedPrice),
      priority,
      notes
    };

    this.wishlist.push(newItem);

    // Aggiorna Google Sheets
    const itemValues = [[
      newItem.id,
      newItem.name,
      newItem.estimatedPrice,
      newItem.priority,
      newItem.notes
    ]];

    try {
      await googleSheetsService.writeSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.WISHLIST,
        itemValues
      );
      this.renderWishlistAsCards();
      return newItem;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiunta dell\'elemento alla wishlist:', error);
      // Rimuovi l'elemento dalla wishlist locale in caso di errore
      const index = this.wishlist.findIndex(item => item.id === newItem.id);
      if (index !== -1) this.wishlist.splice(index, 1);
      return null;
    }
  }

  async removeWishlistItem(id) {
    const index = this.wishlist.findIndex(item => item.id === id);
    if (index !== -1) {
      this.wishlist.splice(index, 1);
      this.renderWishlistAsCards();
    }

    // Rimuovi dal foglio Google
    try {
      await googleSheetsService.removeRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        'SpeseCasa',
        id
      );
    } catch (error) {
      console.error('❌ Errore durante la rimozione dell\'elemento dalla wishlist:', error);
    }
  }
}

export const wishlistManager = new WishlistManager();