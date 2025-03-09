// card.js
export default class Card {
  constructor(options = {}) {
    this.config = {
      id: options.id || Date.now().toString(),
      title: options.title || '',
      content: options.content || '',
      category: options.category || '',
      date: options.date || new Date().toLocaleDateString(),
      footer: options.footer || '',
      image: options.image || null,
      cardClass: options.cardClass || 'card',
      onClick: options.onClick || null,
      onDelete: options.onDelete || null,
      onEdit: options.onEdit || null,
      type: options.type || 'default',
      data: options.data || {}
    };

    // Elemento DOM della card
    this.element = null;
  }

  render() {
    const card = document.createElement('div');
    // card.classList.add(this.config.cardClass);
		card.classList.add(`card-${this.config.type.replace(/\s+/g, '-')}`);
    card.dataset.id = this.config.id;
    card.dataset.type = this.config.type;

    // Aggiungi una classe specifica per il tipo di card
    card.classList.add(`card-${this.config.type}`);

    // Struttura della card
    let cardHTML = '';

    // Header della card (se c'è un titolo)
    if (this.config.title) {
      cardHTML += `
        <div class="card-header">
          <h3 class="card-title">${this.config.title}</h3>
          <div class="card-date">${this.config.date}</div>
        </div>
      `;
    }

    // Immagine della card (se presente)
    if (this.config.image) {
      cardHTML += `
        <div class="card-image">
          <img src="${this.config.image}" alt="${this.config.title}">
        </div>
      `;
    }

    // Contenuto della card
    cardHTML += `
      <div class="card-body">
        <div class="card-content">${this.config.content}</div>
        ${this.config.category ? `<div class="card-category">${this.config.category}</div>` : ''}
      </div>
    `;

    // Footer della card (se presente)
    if (this.config.footer || this.config.onDelete || this.config.onEdit) {
      cardHTML += `
        <div class="card-footer">
          ${this.config.footer ? `<div class="card-footer-content">${this.config.footer}</div>` : ''}
          <div class="card-actions">
            ${this.config.onEdit ? '<button class="card-edit-btn" aria-label="Modifica">✏️</button>' : ''}
            ${this.config.onDelete ? '<button class="card-delete-btn" aria-label="Elimina">🗑️</button>' : ''}
          </div>
        </div>
      `;
    }

    // Imposta l'HTML della card
    card.innerHTML = cardHTML;

    // Aggiungi gli event listener
    if (this.config.onClick) {
      card.addEventListener('click', (e) => {
        // Evita che il click propaghi se l'utente ha cliccato sui pulsanti
        if (!e.target.closest('.card-actions button')) {
          this.config.onClick(this.config.id, this.config.data, e);
        }
      });
    }

    // Aggiungi gli event listener per modifica ed eliminazione
    if (this.config.onEdit) {
      const editBtn = card.querySelector('.card-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.config.onEdit(this.config.id, this.config.data, e);
        });
      }
    }

    if (this.config.onDelete) {
      const deleteBtn = card.querySelector('.card-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.config.onDelete(this.config.id, this.config.type, e);
        });
      }
    }

    this.element = card;
    return card;
  }

  // Aggiorna i dati della card
  update(newOptions = {}) {
    // Aggiorna la configurazione con le nuove opzioni
    this.config = { ...this.config, ...newOptions };

    // Se la card è già stata renderizzata, aggiorna il DOM
    if (this.element) {
      const newElement = this.render();
      this.element.replaceWith(newElement);
      this.element = newElement;
    }

    return this.element;
  }

  // Crea una card per le note
  static createNoteCard(note, options = {}) {
    return new Card({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      date: note.date,
      type: 'note',
      data: note,
      ...options
    });
  }

  // Crea una card per le spese
  static createExpenseCard(expense, options = {}) {
    const formattedAmount = parseFloat(expense.amount).toFixed(2);

    return new Card({
      id: expense.id,
      title: expense.description || 'Spesa',
      content: `<div class="expense-amount">${formattedAmount} €</div>`,
      category: expense.category,
      date: expense.date,
      type: 'expense',
      data: expense,
      ...options
    });
  }

  // Crea una card per la wishlist
  static createWishlistCard(item, options = {}) {
    const formattedPrice = parseFloat(item.estimatedPrice).toFixed(2);
    let priorityClass = '';

    switch (item.priority.toUpperCase()) {
      case 'ALTA':
        priorityClass = 'priority-high';
        break;
      case 'MEDIA':
        priorityClass = 'priority-medium';
        break;
      case 'BASSA':
      default:
        priorityClass = 'priority-low';
        break;
    }

    return new Card({
      id: item.id,
      title: item.name,
      content: `
        <div class="wishlist-price">${formattedPrice} €</div>
        <div class="wishlist-priority ${priorityClass}">Priorità: ${item.priority}</div>
        ${item.notes ? `<div class="wishlist-notes">${item.notes}</div>` : ''}
      `,
      category: 'Wishlist',
      date: '',
      type: 'wishlist',
      data: item,
      ...options
    });
  }
}