import { googleSheetsService } from './google-sheets-service.js';
import { googleAuthService } from '../google-auth-service.js';
import { noteManager } from '../../../public/js/modules/sheet/note.js';
import { expenseTracker } from '../../../public/js/modules/sheet/expense.js';
import { wishlistManager } from '../../../public/js/modules/sheet/wishlist.js';
import { SHEET_RANGES, GOOGLE_CONFIG } from '../config.js';

export class DataSyncService {
  // Sincronizza tutti i dati
  async syncDataToSheets() {
    try {
      if (!googleAuthService.isAuthenticated()) {
        console.error('Autenticazione necessaria prima della sincronizzazione');
        return false;
      }

      // Attendere che le API siano disponibili
      if (!window.gapi || !window.gapi.client) {
        console.error('API Google non disponibili');
        return false;
      }

      // Sincronizza note, spese e wishlist
      await Promise.all([
        this.syncNotes(),
        this.syncExpenses(),
        this.syncWishlist()
      ]);

      console.log('✅ Sincronizzazione completata');
      return true;
    } catch (error) {
      console.error('Errore durante la sincronizzazione:', error);
      return false;
    }
  }

  // Sincronizza note
  async syncNotes() {
    try {
      if (!googleAuthService.isAuthenticated()) {
        await new Promise(resolve => googleAuthService.authenticate(resolve));
      }

      // Leggi i dati esistenti dal foglio
      const existingData = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.NOTES
      );

      console.log('ExistingData Notes:', existingData);

      // Converti i dati in oggetti note
      if (existingData && Array.isArray(existingData)) {
        noteManager.notes = existingData.map(row => ({
          id: row[0],
          title: row[1],
          content: row[2],
          category: row[3],
          date: row[4]
        }));

        noteManager.renderNotesAsCards();
      }

      // Se ci sono note nel manager, aggiorna il foglio
      if (noteManager.notes && noteManager.notes.length > 0) {
        const noteValues = noteManager.notes.map(note => [
          note.id,
          note.title,
          note.content,
          note.category,
          note.date
        ]);

        // Cancella il range prima di scrivere
        await googleSheetsService.writeSheet(
          GOOGLE_CONFIG.SPREADSHEET_ID,
          `Note!A2:E${2 + noteValues.length}`,
          noteValues
        );
      }

      console.log('✅ Note sincronizzate');
      return true;
    } catch (error) {
      console.error('❌ Errore sincronizzazione note:', error);
      return false;
    }
  }

  // Sincronizza wishlist
  async syncWishlist() {
    try {
      if (!googleAuthService.isAuthenticated()) {
        await new Promise(resolve => googleAuthService.authenticate(resolve));
      }

      // Leggi i dati esistenti dal foglio
      const existingData = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.WISHLIST
      );

      console.log('ExistingData Wishlist:', existingData);

      // Converti i dati in oggetti wishlist
      if (existingData && Array.isArray(existingData)) {
        wishlistManager.wishlist = existingData.map(row => ({
          id: row[0],
          name: row[1],
          estimatedPrice: parseFloat(row[2]),
          priority: row[3] || 'BASSA',
          notes: row[4] || ''
        }));

        wishlistManager.renderWishlistAsCards();
      }

      // Se ci sono elementi nella wishlist, aggiorna il foglio
      if (wishlistManager.wishlist && wishlistManager.wishlist.length > 0) {
        const wishlistValues = wishlistManager.wishlist.map(item => [
          item.id,
          item.name,
          item.estimatedPrice,
          item.priority,
          item.notes
        ]);

        // Cancella il range prima di scrivere
        await googleSheetsService.writeSheet(
          GOOGLE_CONFIG.SPREADSHEET_ID,
          `SpeseCasa!A2:E${2 + wishlistValues.length}`,
          wishlistValues
        );
      }

      console.log('✅ Wishlist sincronizzata');
      return true;
    } catch (error) {
      console.error('❌ Errore sincronizzazione wishlist:', error);
      return false;
    }
  }

  // Sincronizza spese
  async syncExpenses() {
    try {
      if (!googleAuthService.isAuthenticated()) {
        await new Promise(resolve => googleAuthService.authenticate(resolve));
      }

      // Leggi i dati esistenti dal foglio e attendi la Promise
      const existingData = await googleSheetsService.readSheet(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        SHEET_RANGES.EXPENSES
      );

      console.log('ExistingData Expenses:', existingData);

      // Converti i dati in oggetti spese
      if (existingData && Array.isArray(existingData)) {
        expenseTracker.expenses = existingData.map(row => ({
          id: row[0],
          amount: parseFloat(row[1]),
          category: row[2],
          description: row[3],
          date: row[4]
        }));

        expenseTracker.renderExpensesAsCards();
      }

      // Se ci sono spese nel manager, aggiorna il foglio
      if (expenseTracker.expenses && expenseTracker.expenses.length > 0) {
        const expenseValues = expenseTracker.expenses.map(expense => [
          expense.id,
          expense.amount,
          expense.category,
          expense.description,
          expense.date
        ]);

        // Cancella il range prima di scrivere
        await googleSheetsService.writeSheet(
          GOOGLE_CONFIG.SPREADSHEET_ID,
          `ListaSpesa!A2:E${2 + expenseValues.length}`,
          expenseValues
        );
      }

      console.log('✅ Spese sincronizzate');
      return true;
    } catch (error) {
      console.error('❌ Errore sincronizzazione spese:', error);
      return false;
    }
  }

  // Rimuovi un elemento specifico
  async removeItemFromSheets(type, itemId) {
    try {
      if (!googleAuthService.isAuthenticated()) {
        await new Promise(resolve => googleAuthService.authenticate(resolve));
      }

      let sheetName;
      switch(type) {
        case 'ListaSpesa':
          expenseTracker.removeExpense(itemId);
          sheetName = 'ListaSpesa';
          break;
        case 'SpeseCasa':
          wishlistManager.removeWishlistItem(itemId);
          sheetName = 'SpeseCasa';
          break;
        case 'Note':
          noteManager.removeNote(itemId);
          sheetName = 'Note';
          break;
        default:
          console.error('Tipo non valido');
          return false;
      }

      // Rimuovi la riga specifica
      const removed = await googleSheetsService.removeRow(
        GOOGLE_CONFIG.SPREADSHEET_ID,
        sheetName,
        itemId
      );

      if (removed) {
        // Risincronizza dopo la rimozione per assicurare consistenza
        await this.syncDataToSheets();
        console.log(`✅ Elemento ${itemId} rimosso da ${type}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Errore rimozione elemento:', error);
      return false;
    }
  }
}

export const dataSyncService = new DataSyncService();