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
		const currentTab = document.getElementById(tabName);
		if (currentTab) {
			currentTab.classList.add("active");
			evt.currentTarget.classList.add("active");
		} else {
			console.warn(`Tab con ID ${tabName} non trovato nel DOM`);
			// Se il tab non esiste, torna al primo tab
			if (tabContents.length > 0) {
				tabContents[0].classList.add("active");
				if (tabLinks.length > 0) {
					tabLinks[0].classList.add("active");
				}
			}
		}
	}
};

export default TAB;