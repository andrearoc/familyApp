const MDL = {
	init: () => {
		// Creiamo la struttura del modal se non esiste già
		let backdrop;  // Dichiariamo backdrop qui

		if (!document.getElementById('modal-backdrop')) {
			backdrop = document.createElement('div');
			backdrop.id = 'modal-backdrop';
			backdrop.style.display = 'none';
			document.body.appendChild(backdrop);
		} else {
			backdrop = document.getElementById('modal-backdrop');
		}

		if (!document.getElementById('modale-risultato')) {
			const modal = document.createElement('div');
			modal.id = 'modale-risultato';
			modal.className = 'modal';
			modal.style.display = 'none';

			modal.innerHTML = `
				<div class="modal-header">
					<h2 id="modal-title">Titolo</h2>
					<span id="close-button" class="close-button"><i class="fas fa-times"></i></span>
				</div>
				<div class="modal-content" id="modal-content">
					<p>Contenuto del modale</p>
				</div>
			`;

			document.body.appendChild(modal);

			// Event listener per chiudere il modal
			const closeBtn = modal.querySelector('#close-button');
			closeBtn.addEventListener('click', MDL.close);

			// Chiudi il modal se si clicca fuori
			backdrop.addEventListener('click', MDL.close);
		}
	},

	open: (title = '', content = null) => {
		const modal = document.getElementById('modale-risultato');
		const backdrop = document.getElementById('modal-backdrop');
		const titleEl = document.getElementById('modal-title');
		const contentEl = document.getElementById('modal-content');

		// Aggiorna titolo e contenuto
		titleEl.textContent = title;
		if (content) {
			if (typeof content === 'string') {
				contentEl.innerHTML = content;
			} else if (content instanceof Node) {
				contentEl.innerHTML = '';
				contentEl.appendChild(content);
			}
		}

		// Mostra il modal e il backdrop
		modal.style.display = 'block';
		backdrop.style.display = 'block';

		// Aggiungi classe per l'animazione
		setTimeout(() => {
			modal.classList.add('show');
			backdrop.classList.add('show');
		}, 10);
	},

	close: () => {
		const modal = document.getElementById('modale-risultato');
		const backdrop = document.getElementById('modal-backdrop');
		const contentEl = document.getElementById('modal-content');

		// Rimuovi classe per l'animazione
		modal.classList.remove('show');
		backdrop.classList.remove('show');

		// Nascondi dopo l'animazione
		setTimeout(() => {
			modal.style.display = 'none';
			backdrop.style.display = 'none';
			// Pulisci il contenuto
			contentEl.innerHTML = '';
		}, 300); // Tempo dell'animazione
	},

	setContent: (content) => {
		const contentEl = document.getElementById('modal-content');
		contentEl.innerHTML = '';

		if (typeof content === 'string') {
			contentEl.innerHTML = content;
		} else if (content instanceof Node) {
			contentEl.appendChild(content);
		}
	}
};

export default MDL;