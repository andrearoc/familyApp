import UTL from './utils.js';

const HCL = {
	display: null,
	startTime: null,
	timerInterval: null,
	historyDiv: null,  // Nuovo elemento per lo storico

	createInterface: () => {
		const container = document.createElement('div');
		container.className = 'timer-container';

		HCL.display = document.createElement('div');
		HCL.display.className = 'timer-display';
		HCL.display.textContent = '00:00:00';

		const startBtn = document.createElement('button');
		startBtn.textContent = 'Avvia Timer';
		startBtn.addEventListener('click', HCL.startTimer);

		const stopBtn = document.createElement('button');
		stopBtn.textContent = 'Ferma Timer';
		stopBtn.addEventListener('click', HCL.stopTimer);
		stopBtn.disabled = true;

		// Creiamo il div per lo storico
		HCL.historyDiv = document.createElement('div');
		HCL.historyDiv.className = 'timer-history';
		HCL.historyDiv.innerHTML = '<h3>Storico Tempi</h3>';

		container.appendChild(HCL.display);
		container.appendChild(startBtn);
		container.appendChild(stopBtn);
		container.appendChild(HCL.historyDiv);

		// Mostra subito lo storico al caricamento
		HCL.updateHistory();

		return container;
	},

	updateHistory: () => {
		const data = UTL.getData('hourCalculator');
		if (!HCL.historyDiv) return;

		// Ordina i dati per data, dal più recente
		data.sort((a, b) => new Date(b.data) - new Date(a.data));

		let html = '<h3>Storico Tempi</h3>';
		if (data.length === 0) {
			html += '<p>Nessun tempo registrato</p>';
		} else {
			html += '<table class="history-table">';
			html += '<tr><th>Data</th><th>Durata Totale</th></tr>';
			data.forEach(record => {
				html += `
					<tr>
						<td>${record.data}</td>
						<td>${record.durata}</td>
					</tr>
				`;
			});
			html += '</table>';
		}

		HCL.historyDiv.innerHTML = html;
	},

	startTimer: (e) => {
		HCL.startTime = new Date();
		e.target.disabled = true;
		e.target.nextElementSibling.disabled = false;

		HCL.timerInterval = setInterval(() => {
			const currentTime = new Date();
			const elapsedSeconds = Math.floor((currentTime - HCL.startTime) / 1000);
			const timeObj = UTL.formatTime(elapsedSeconds);
			HCL.display.textContent = timeObj.formatted;
		}, 1000);
	},

	stopTimer: (e) => {
		clearInterval(HCL.timerInterval);
		const endTime = new Date();

		const data = {
			dataInizio: HCL.startTime.toISOString(),
			dataFine: endTime.toISOString(),
			durata: HCL.display.textContent,
			data: HCL.startTime.toLocaleDateString()
		};

		UTL.saveData('hourCalculator', data);
		e.target.disabled = true;
		e.target.previousElementSibling.disabled = false;

		// Aggiorna lo storico dopo il salvataggio
		HCL.updateHistory();
	},

	cleanup: () => {
		if (HCL.timerInterval) {
			clearInterval(HCL.timerInterval);
		}
	}
};

export default HCL;