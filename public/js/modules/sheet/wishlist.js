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

    // Qui puoi implementare la logica per aprire un form di modifica
    // Per ora, impostiamo solo i valori del form di aggiunta wishlist
    document.getElementById('wishlist-name').value = item.name;
    document.getElementById('wishlist-price').value = item.estimatedPrice;
    document.getElementById('wishlist-priority').value = item.priority;
    document.getElementById('wishlist-notes').value = item.notes;

    // Creiamo un pulsante temporaneo per la modifica
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Aggiorna Elemento';
    updateBtn.classList.add('update-btn');
    updateBtn.type = 'button';

    // Sostituisci il pulsante di invio con quello di aggiornamento
    const submitBtn = document.querySelector('#add-wishlist-form button[type="submit"]');
    submitBtn.parentNode.insertBefore(updateBtn, submitBtn);
    submitBtn.style.display = 'none';

    // Aggiungi handler per l'aggiornamento
    updateBtn.addEventListener('click', async () => {
      const updatedName = document.getElementById('wishlist-name').value;
      const updatedPrice = document.getElementById('wishlist-price').value;
      const updatedPriority = document.getElementById('wishlist-priority').value;
      const updatedNotes = document.getElementById('wishlist-notes').value;

      await this.updateWishlistItem(id, updatedName, updatedPrice, updatedPriority, updatedNotes);

      // Ripristina il form
      document.getElementById('add-wishlist-form').reset();
      submitBtn.style.display = '';
      updateBtn.remove();
    });

    // Porta l'utente alla sezione del form
    document.getElementById('wishlist-section-tab').click();
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