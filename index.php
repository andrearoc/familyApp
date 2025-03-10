<?php
// Inizializza eventuali variabili o sessioni
session_start();
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link rel="stylesheet" type="text/css" href="./public/sass/css/style.css">
  <title>Drin App</title>
</head>
<body>
  <?php include 'includes/header.php'; ?>

  <div class="container">
    <div class="header-actions">
        <i id="google-auth-btn" class="fa-solid fa-user"></i>
        <i id="sync-btn" class="fa-solid fa-rotate"></i>
    </div>

    <div class="tab-container">
      <div class="tab-links">
        <button class="tab-link active" onclick="openTab(event, 'notes-tab')">Note</button>
        <button class="tab-link" onclick="openTab(event, 'expenses-tab')">Spese</button>
        <button class="tab-link" onclick="openTab(event, 'wishlist-tab')">Wishlist</button>
				<button class="tab-link" onclick="openTab(event, 'calendar-tab')">Calendario</button>
      </div>

      <!-- Tab Note -->
      <?php include 'tabs/notes.php'; ?>

      <!-- Tab Spese -->
      <?php include 'tabs/expenses.php'; ?>

      <!-- Tab Wishlist -->
      <?php include 'tabs/wishlist.php'; ?>

			<!-- Tab Calendario -->
			<?php include 'tabs/calendar.php'; ?>
    </div>
  </div>

  <?php include 'includes/modals.php'; ?>
  <?php include 'includes/footer.php'; ?>

  <script>
    // Funzione per cambiare tab
    function openTab(evt, tabName) {
      // Nascondi tutti i contenuti dei tab
      const tabContents = document.getElementsByClassName("tab-content");
      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
      }

      // Rimuovi la classe "active" da tutti i tab link
      const tabLinks = document.getElementsByClassName("tab-link");
      for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
      }

      // Mostra il tab corrente e aggiungi la classe "active" al pulsante
      document.getElementById(tabName).classList.add("active");
      evt.currentTarget.classList.add("active");
    }
  </script>

  <!-- Importa i file JavaScript -->
  <script type="module" src="./public/js/main.js"></script>
</body>
</html>