// Funzione di utilità per generare QR code
const generateQRBase = (text, typeNumber = 4, errorCorrectionLevel = 'L') => {
	const qr = qrcode(typeNumber, errorCorrectionLevel);
	qr.addData(text);
	qr.make();
	return qr;
};

const createDownloadLink = (data, format, filename = 'qrcode') => {
	const link = document.createElement('a');
	link.download = `${filename}.${format}`;
	link.href = data;
	link.textContent = `Scarica ${format.toUpperCase()}`;
	link.className = 'download-button';
	return link;
};

const generateQRCode = async (text, format = 'svg') => {
	const outputDiv = document.getElementById('qr-output');
	outputDiv.innerHTML = '';

	try {
		const qr = generateQRBase(text);

		switch (format) {
			case 'svg':
				const svgString = qr.createSvgTag({ cellSize: 4, margin: 4 });
				outputDiv.innerHTML = svgString;
				const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
				const svgUrl = URL.createObjectURL(svgBlob);
				outputDiv.appendChild(createDownloadLink(svgUrl, 'svg', `qr-${text.substring(0, 10)}`));
				break;

			case 'png':
			case 'jpeg':
				const imgType = format === 'png' ? 'png' : 'jpg';
				const canvas = document.createElement('canvas');
				const size = qr.getModuleCount() * 4 + 8; // cellSize * moduleCount + margin
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d');

				// Sfondo bianco per JPEG
				if (format === 'jpeg') {
					ctx.fillStyle = '#FFFFFF';
					ctx.fillRect(0, 0, size, size);
				}

				// Disegna il QR code
				const imgData = qr.createDataURL(4, 4);
				const img = new Image();
				img.src = imgData;
				img.onload = () => {
					ctx.drawImage(img, 0, 0);
					const dataUrl = canvas.toDataURL(`image/${imgType}`);
					const displayImg = document.createElement('img');
					displayImg.src = dataUrl;
					outputDiv.appendChild(displayImg);
					outputDiv.appendChild(createDownloadLink(dataUrl, imgType, `qr-${text.substring(0, 10)}`));
				};
				break;

			default:
				throw new Error('Formato non supportato');
		}
	} catch (error) {
		outputDiv.innerHTML = `Errore nella generazione del QR code: ${error.message}`;
	}
};

// Funzione per creare l'interfaccia del generatore
const createInterface = () => {
	const container = document.createElement('div');
	container.className = 'qr-generator-container';

	container.innerHTML = `
		<div class="input-group">
			<h4>Incolla nel tab qui sotto il link di cui vuoi generare il QR code</h4>
			<input type="text" id="qr-input" placeholder="..........." class="qr-input">
			<select id="qr-format" class="qr-format">
				<option value="svg">SVG</option>
				<option value="png">PNG</option>
				<option value="jpeg">JPEG</option>
			</select>
			<button id="generate-qr" class="generate-button">Genera QR Code</button>
		</div>
		<div id="qr-output" class="qr-output"></div>
	`;

	// Aggiungi event listener
	setTimeout(() => {
		const button = container.querySelector('#generate-qr');
		button.addEventListener('click', () => {
			const text = container.querySelector('#qr-input').value;
			const format = container.querySelector('#qr-format').value;
			if (text) {
				generateQRCode(text, format);
			} else {
				alert('Inserisci un testo per generare il QR code');
			}
		});
	}, 0);

	return container;
};

export {
	generateQRCode,
	createInterface
};