/**
 * Modulo per la gestione dei tab nell'interfaccia utente
 */
const TAB = {
  init: () => {
    // Aggiungi listener ai pulsanti tab
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
      tabLinks[i].addEventListener('click', (event) => {
        TAB.openTab(event, event.currentTarget.getAttribute('data-tab-target'));
      });
    }

    // Imposta il primo tab come attivo all'inizializzazione
    if (tabLinks.length > 0 && tabLinks[0].getAttribute('data-tab-target')) {
      TAB.openTab({ currentTarget: tabLinks[0] }, tabLinks[0].getAttribute('data-tab-target'));
    }
  },

  openTab: (evt, tabName) => {
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
};

export default TAB;