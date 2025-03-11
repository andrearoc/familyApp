const UTL = {
	saveData: (key, newData) => {
		// Ottieni i dati esistenti
		let existingData = JSON.parse(localStorage.getItem(key)) || [];

		// Cerca se esiste già un record per la stessa data
		const existingIndex = existingData.findIndex(item => item.data === newData.data);

		if (existingIndex !== -1) {
			// Se esiste, somma le durate
			const oldTime = existingData[existingIndex].durata.split(':');
			const newTime = newData.durata.split(':');

			// Converti in secondi e somma
			const oldSeconds = (+oldTime[0]) * 3600 + (+oldTime[1]) * 60 + (+oldTime[2]);
			const newSeconds = (+newTime[0]) * 3600 + (+newTime[1]) * 60 + (+newTime[2]);
			const totalSeconds = oldSeconds + newSeconds;

			// Riconverti in formato HH:MM:SS
			const timeObj = UTL.formatTime(totalSeconds);

			// Sostituisci il vecchio record con quello aggiornato
			existingData[existingIndex] = {
				data: newData.data,
				durata: timeObj.formatted,
				dataInizio: existingData[existingIndex].dataInizio, // mantiene la prima data di inizio
				dataFine: newData.dataFine // aggiorna con l'ultima data di fine
			};
		} else {
			// Se non esiste, aggiungi il nuovo record
			existingData.push(newData);
		}

		// Filtra per mantenere solo l'ultimo record per ogni data
		existingData = existingData.reduce((acc, current) => {
			const x = acc.find(item => item.data === current.data);
			if (!x) {
				return acc.concat([current]);
			}
			return acc;
		}, []);

		// Salva nel localStorage
		localStorage.setItem(key, JSON.stringify(existingData));
	},

	getData: (key) => {
		return JSON.parse(localStorage.getItem(key)) || [];
	},

	clearData: (key) => {
		localStorage.removeItem(key);
	},

	formatTime: (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		return {
			hours,
			minutes,
			seconds: remainingSeconds,
			formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
		};
	}
};

export default UTL;