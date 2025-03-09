<!-- Questo file contiene le definizioni dei modali per i form -->
<div id="form-modals">
  <!-- Modal Note -->
  <div id="note-form-modal" class="form-modal">
    <div class="form-container">
      <h3>Aggiungi Nota</h3>
      <form id="add-note-form">
        <div class="form-group">
          <label for="note-title">Titolo</label>
          <input type="text" id="note-title" required>
        </div>
        <div class="form-group">
          <label for="note-content">Contenuto</label>
          <textarea id="note-content" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label for="note-category">Categoria</label>
          <select id="note-category">
            <option value="Personale">Personale</option>
            <option value="Lavoro">Lavoro</option>
            <option value="Casa">Casa</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        <button type="submit">Aggiungi Nota</button>
      </form>
    </div>
  </div>

  <!-- Modal Spese -->
  <div id="expense-form-modal" class="form-modal">
    <div class="form-container">
      <h3>Aggiungi Spesa</h3>
      <form id="add-expense-form">
        <div class="form-group">
          <label for="expense-amount">Importo (€)</label>
          <input type="number" id="expense-amount" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label for="expense-category">Categoria</label>
          <select id="expense-category">
            <option value="Alimentari">Alimentari</option>
            <option value="Trasporti">Trasporti</option>
            <option value="Bollette">Bollette</option>
            <option value="Svago">Svago</option>
            <option value="Casa">Casa</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        <div class="form-group">
          <label for="expense-description">Descrizione</label>
          <input type="text" id="expense-description">
        </div>
        <button type="submit">Aggiungi Spesa</button>
      </form>
    </div>
  </div>

  <!-- Modal Wishlist -->
  <div id="wishlist-form-modal" class="form-modal">
    <div class="form-container">
      <h3>Aggiungi alla Wishlist</h3>
      <form id="add-wishlist-form">
        <div class="form-group">
          <label for="wishlist-name">Nome Prodotto</label>
          <input type="text" id="wishlist-name" required>
        </div>
        <div class="form-group">
          <label for="wishlist-price">Prezzo Stimato (€)</label>
          <input type="number" id="wishlist-price" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label for="wishlist-priority">Priorità</label>
          <select id="wishlist-priority">
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BASSA" selected>Bassa</option>
          </select>
        </div>
        <div class="form-group">
          <label for="wishlist-notes">Note</label>
          <textarea id="wishlist-notes" rows="2"></textarea>
        </div>
        <button type="submit">Aggiungi alla Wishlist</button>
      </form>
    </div>
  </div>
</div>