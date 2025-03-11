// documents.js
export const DOC = {
	currentDocuments: [],
	docTypes: {
			IDENTITY_CARD: 'identity_card',
			HEALTH_CARD: 'health_card',
			DRIVERS_LICENSE: 'drivers_license'
	},

	createInterface() {
		const content = document.createElement('div');
		content.classList.add('documents-container');

		content.innerHTML = `
			<div class="doc-form-container">
				<h3>Gestione Documenti</h3>
				<select id="doc-type" class="w-full mb-4">
					<option value="">Seleziona tipo documento</option>
					<option value="identity_card">Carta d'Identità</option>
					<option value="health_card">Tessera Sanitaria</option>
					<option value="drivers_license">Patente di Guida</option>
				</select>

				<div id="dynamic-form"></div>
			</div>
			<div id="documents-list" class="documents-list"></div>
		`;

		this.attachEventListeners(content);
		return content;
	},

	attachEventListeners(container) {
		// Gestione cambio tipo documento
		const docTypeSelect = container.querySelector('#doc-type');
		docTypeSelect.addEventListener('change', (e) => {
			this.generateForm(e.target.value);
		});

		// Delegazione eventi per il form dinamico
		const dynamicForm = container.querySelector('#dynamic-form');
		dynamicForm.addEventListener('click', (e) => {
			if (e.target.matches('.save-document-btn')) {
				const formType = e.target.dataset.docType;
				this.saveDocument(formType);
			}
		});

		// Delegazione eventi per la lista documenti
		const documentsList = container.querySelector('#documents-list');
		documentsList.addEventListener('click', (e) => {
			if (e.target.matches('.delete-document-btn')) {
				const docId = parseInt(e.target.dataset.docId);
				this.deleteDocument(docId);
			}
		});
	},

	generateForm(docType) {
		const formContainer = document.getElementById('dynamic-form');
		let formHTML = '';

		switch(docType) {
			case this.docTypes.IDENTITY_CARD:
				formHTML = `
					<form id="identity-card-form" class="identity-card-form doc-form">
						<h4>Cognome</h4>
						<input type="text" id="surname" placeholder="Cognome" required>
						<h4>Nome</h4>
						<input type="text" id="name" placeholder="Nome" required>
						<h4>Data di nascita</h4>
						<input type="date" id="birthDate" required>
						<h4>Luogo di nascita</h4>
						<input type="text" id="birthPlace" placeholder="Luogo di nascita" required>
						<h4>Nazionalità</h4>
						<input type="text" id="nationality" placeholder="Nazionalità" required>
						<h4>Comune di residenza</h4>
						<input type="text" id="residenceCity" placeholder="Comune di residenza" required>
						<h4>Indirizzo di residenza</h4>
						<input type="text" id="residenceAddress" placeholder="Indirizzo" required>
						<h4>Numero documento</h4>
						<input type="text" id="documentNumber" placeholder="Numero documento" required>
						<h4>Data di rilascio</h4>
						<input type="date" id="issueDate" required>
						<h4>Data di scadenza</h4>
						<input type="date" id="expiryDate" required>
						<h4>Genere</h4>
						<select id="gender" required>
							<option value="M">M</option>
							<option value="F">F</option>
						</select>
						<h4>Altezza (cm)</h4>
						<input type="text" id="height" placeholder="Altezza (cm)" required>
						<h4>Foto</h4>
						<input type="file" id="photo" accept="image/*" required>
						<button type="button" class="save-document-btn" data-doc-type="identity_card">
							Salva Documento
						</button>
					</form>`;
				break;

			case this.docTypes.HEALTH_CARD:
				formHTML = `
					<form id="health-card-form" class="health-card-form doc-form">
						<h4>Cognome</h4>
						<input type="text" id="surname" placeholder="Cognome" required>
						<h4>Nome</h4>
						<input type="text" id="name" placeholder="Nome" required>
						<h4>Codice Fiscale</h4>
						<input type="text" id="fiscalCode" placeholder="Codice Fiscale" required>
						<h4>Data di nascita</h4>
						<input type="date" id="birthDate" required>
						<h4>Numero tessera</h4>
						<input type="text" id="cardNumber" placeholder="Numero tessera" required>
						<h4>Data di scadenza</h4>
						<input type="date" id="expiryDate" required>
						<h4>ASL di appartenenza</h4>
						<input type="text" id="healthDistrict" placeholder="ASL di appartenenza" required>
						<button type="button" class="save-document-btn" data-doc-type="health_card">
							Salva Documento
						</button>
					</form>`;
				break;

			case this.docTypes.DRIVERS_LICENSE:
				formHTML = `
					<form id="drivers-license-form" class="drivers-license-form doc-form">
						<h4>Cognome</h4>
						<input type="text" id="surname" placeholder="Cognome" required>
						<h4>Nome</h4>
						<input type="text" id="name" placeholder="Nome" required>
						<h4>Data di nascita</h4>
						<input type="date" id="birthDate" required>
						<h4>Luogo di nascita</h4>
						<input type="text" id="birthPlace" placeholder="Luogo di nascita" required>
						<h4>Numero patente</h4>
						<input type="text" id="licenseNumber" placeholder="Numero patente" required>
						<h4>Data di rilascio</h4>
						<input type="date" id="issueDate" required>
						<h4>Data di scadenza</h4>
						<input type="date" id="expiryDate" required>
						<h4>Ente di rilascio</h4>
						<input type="text" id="issuingAuthority" placeholder="Ente di rilascio" required>
						<h4>Categorie</h4>
						<div class="license-categories">
							<label>Categorie:</label>
							<div class="checkbox-group">
								<div><input type="checkbox" id="catAM"> <label for="catAM">AM</label></div>
								<div><input type="checkbox" id="catA1"> <label for="catA1">A1</label></div>
								<div><input type="checkbox" id="catA2"> <label for="catA2">A2</label></div>
								<div><input type="checkbox" id="catA"> <label for="catA">A</label></div>
								<div><input type="checkbox" id="catB"> <label for="catB">B</label></div>
							</div>
						</div>
						<h4>Foto</h4>
						<input type="file" id="photo" accept="image/*" required>
						<button type="button" class="save-document-btn" data-doc-type="drivers_license">
							Salva Documento
						</button>
					</form>`;
				break;
		}

		formContainer.innerHTML = formHTML;
	},

	saveDocument(type) {
		const formData = this.collectFormData(type);
		if (formData) {
			this.currentDocuments.push({
				type,
				data: formData,
				id: Date.now()
			});
			this.updateDocumentsList();
			document.getElementById(`${type}-form`).reset();
		}
	},

	collectFormData(type) {
		const formId = `${type.replace('_', '-')}-form`;
		const form = document.getElementById(formId);

		if (!form) {
			console.error(`Form with id ${formId} not found`);
			return null;
		}

		const data = {};
		const elements = form.querySelectorAll('input, select');

		elements.forEach(element => {
			if (element.type === 'file') {
				// Per ora salviamo solo il nome del file
				data[element.id] = element.files[0] ? element.files[0].name : '';
			} else if (element.type === 'checkbox') {
				data[element.id] = element.checked;
			} else {
				data[element.id] = element.value.trim();
			}
		});

		return data;
	},

	updateDocumentsList() {
		const container = document.getElementById('documents-list');
		if (!container) return;

		if (this.currentDocuments.length === 0) {
			container.innerHTML = '<div class="empty-state">Nessun documento salvato</div>';
			return;
		}

		container.innerHTML = this.currentDocuments.map(doc => this.generateDocumentHTML(doc)).join('');
	},

	generateDocumentHTML(doc) {
		const docTypeLabels = {
			identity_card: "Carta d'Identità",
			health_card: "Tessera Sanitaria",
			drivers_license: "Patente di Guida"
		};

		return `
			<div class="document-card ${doc.type}">
				<h4>${docTypeLabels[doc.type]}</h4>
				<div class="doc-details">
					<p><strong>${doc.data.surname} ${doc.data.name}</strong></p>
					<p>Data di nascita: ${doc.data.birthDate}</p>
					${this.getSpecificDocumentDetails(doc)}
				</div>
				<button class="delete-document-btn" data-doc-id="${doc.id}">
					<i class="fas fa-trash"></i>
				</button>
			</div>
			`;
	},

	getSpecificDocumentDetails(doc) {
		switch(doc.type) {
			case this.docTypes.IDENTITY_CARD:
				return `
					<p>Documento N°: ${doc.data.documentNumber}</p>
					<p>Scadenza: ${doc.data.expiryDate}</p>`;

			case this.docTypes.HEALTH_CARD:
				return `
					<p>Codice Fiscale: ${doc.data.fiscalCode}</p>
					<p>Numero Tessera: ${doc.data.cardNumber}</p>`;

			case this.docTypes.DRIVERS_LICENSE:
				return `
					<p>Patente N°: ${doc.data.licenseNumber}</p>
					<p>Scadenza: ${doc.data.expiryDate}</p>`;

			default:
				return '';
		}
	},

	deleteDocument(id) {
		this.currentDocuments = this.currentDocuments.filter(doc => doc.id !== id);
		this.updateDocumentsList();
	}
};