import { GOOGLE_CONFIG } from './config.js';
import { googleAuthService } from './google-auth-service.js';

export class GoogleSheetsService {
  // Legge i valori da un foglio
  async readSheet(spreadsheetId = GOOGLE_CONFIG.SPREADSHEET_ID, range) {
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

      // Assicurati che l'API sheets sia caricata
      if (!window.gapi.client.sheets) {
        await this.loadSheetsAPI();
      }

      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });

      console.log(`✅ Lettura foglio ${spreadsheetId} - Range ${range}`);
      if (response && response.result && response.result.values) {
        return response.result.values;
      } else {
        console.warn('Risposta senza valori');
        return [];
      }
    } catch (error) {
      console.error(`❌ Errore lettura foglio ${spreadsheetId}:`, error);
      return null;
    }
  }

  // Carica l'API di Sheets se non è già disponibile
  async loadSheetsAPI() {
    return new Promise((resolve, reject) => {
      try {
        window.gapi.client.load('sheets', 'v4', () => {
          console.log('✅ API Sheets caricata');
          resolve();
        });
      } catch (error) {
        console.error('❌ Errore caricamento API Sheets:', error);
        reject(error);
      }
    });
  }

  // Scrive valori in un foglio
  async writeSheet(spreadsheetId = GOOGLE_CONFIG.SPREADSHEET_ID, range, values) {
    try {
      // Assicurati che sia autenticato
      if (!googleAuthService.isAuthenticated()) {
        await new Promise((resolve) => {
          googleAuthService.authenticate(resolve);
        });
      }

      // Assicurati che l'API sheets sia caricata
      if (!window.gapi.client.sheets) {
        await this.loadSheetsAPI();
      }

      // Determina il tipo di operazione (append o update) in base al range
      let operation;
      let rangeToAppend = range;

      // Se il range termina con un numero specifico, è un update, altrimenti è un append
      if (range.match(/\d+$/)) {
        operation = 'update';
      } else {
        operation = 'append';
        // Per append, assicurati che il range sia corretto
        rangeToAppend = range.replace(/!.*$/, '!A1');
      }

      let response;

      if (operation === 'append') {
        response = await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: rangeToAppend,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: values
          }
        });
      } else {
        response = await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: range,
          valueInputOption: 'RAW',
          resource: {
            values: values
          }
        });
      }

      console.log(`✅ Scrittura foglio ${spreadsheetId} - Range ${range} - Operazione: ${operation}`);
      return response;
    } catch (error) {
      console.error(`❌ Errore scrittura foglio ${spreadsheetId}:`, error);
      throw error;
    }
  }

	async removeRow(spreadsheetId = GOOGLE_CONFIG.SPREADSHEET_ID, sheetName, rowId) {
		try {
			// Assicurati che sia autenticato
			if (!googleAuthService.isAuthenticated()) {
				await new Promise((resolve) => {
					googleAuthService.authenticate(resolve);
				});
			}

			// Assicurati che l'API sheets sia caricata
			if (!window.gapi.client.sheets) {
				await this.loadSheetsAPI();
			}

			// Leggi prima i valori attuali del foglio
			const values = await this.readSheet(spreadsheetId, `${sheetName}!A:Z`);

			if (!values || values.length === 0) {
				console.error('Nessun dato trovato');
				return false;
			}

			// Trova l'indice della riga da rimuovere
			const rowIndex = values.findIndex(row => row[0] === rowId.toString());

			if (rowIndex === -1) {
				console.error(`Riga con ID ${rowId} non trovata in ${sheetName}`);
				return false;
			}

			// Ottieni l'ID del foglio
			const sheetId = await this.getSheetId(spreadsheetId, sheetName);

			// Logging aggiuntivo per debug
			console.log(`Foglio: ${sheetName}, ID ottenuto: ${sheetId}`);

			if (sheetId === null) {
				console.error(`Foglio ${sheetName} non trovato`);
				return false;
			}

			const request = {
				spreadsheetId: spreadsheetId,
				resource: {
					requests: [{
						deleteDimension: {
							range: {
								sheetId: sheetId,
								dimension: 'ROWS',
								startIndex: rowIndex,  // MODIFICATO: tolto il +1
								endIndex: rowIndex + 1
							}
						}
					}]
				}
			};

			console.log('Esecuzione richiesta di rimozione:', request);

			const response = await window.gapi.client.sheets.spreadsheets.batchUpdate(request);
			console.log(`✅ Riga ${rowId} rimossa con successo da ${sheetName}`, response);
			return true;
		} catch (error) {
			console.error('❌ Errore rimozione riga:', error);
			return false;
		}
	}

	async getSheetId(spreadsheetId, sheetName) {
		try {
			// Assicurati che l'API sheets sia caricata
			if (!window.gapi.client.sheets) {
				await this.loadSheetsAPI();
			}

			const response = await window.gapi.client.sheets.spreadsheets.get({
				spreadsheetId: spreadsheetId
			});

			if (response && response.result && response.result.sheets) {
				// Log di tutti i nomi dei fogli per debugging
				console.log('Fogli disponibili:', response.result.sheets.map(s => s.properties.title));
				console.log('Cercando foglio:', sheetName);

				// Controlla il tipo di dati, poiché potrebbe essere un problema di confronto
				console.log('Tipo di dati dei nomi dei fogli:',
					response.result.sheets.map(s => typeof s.properties.title));
				console.log('Tipo di dati di sheetName:', typeof sheetName);

				// Trasforma in stringa per sicurezza
				const sheetNameStr = String(sheetName);

				// Cerca corrispondenza esatta
				const sheet = response.result.sheets.find(s => s.properties.title === sheetNameStr);

				if (sheet) {
					console.log('Trovato foglio con ID:', sheet.properties.sheetId);
					return sheet.properties.sheetId;
				} else {
					console.log('Nessuna corrispondenza esatta trovata per:', sheetNameStr);

					// Mostra tutti i confronti per debug
					response.result.sheets.forEach(s => {
						console.log(`Confronto: "${s.properties.title}" === "${sheetNameStr}" = ${s.properties.title === sheetNameStr}`);
					});
				}

				return null;
			}

			return null;
		} catch (error) {
			console.error(`❌ Errore nel recupero dell'ID del foglio ${sheetName}:`, error);
			return null;
		}
	}
}

export const googleSheetsService = new GoogleSheetsService();