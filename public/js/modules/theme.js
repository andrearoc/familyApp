import MDL from './modal.js';

// Gestore dedicato per il tema che usa lo stesso approccio di ExpenseStorageManager
class ThemeStorageManager {
	constructor() {
		this.storageKey = 'app_theme_settings';
		this.loadTheme();
	}

	saveTheme(colors) {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(colors));
			return true;
		} catch (error) {
			console.error('Errore nel salvataggio del tema:', error);
			return false;
		}
	}

	loadTheme() {
		try {
			const savedTheme = localStorage.getItem(this.storageKey);
			return savedTheme ? JSON.parse(savedTheme) : null;
		} catch (error) {
			console.error('Errore nel caricamento del tema:', error);
			return null;
		}
	}
}

const TEMA = {
	// Palette predefinite
	palettes: {
		// Temi Naturali
		verde: {
			primary: '#2A5D43',
			secondary: '#E8F6F0',
			text: '#3C4A3E',
			accent: '#4cd68f',
			border: '#2f905e'
		},
		salvia: {
			primary: '#536F54',
			secondary: '#EFF4EF',
			text: '#2F3E2F',
			accent: '#7FA984',
			border: '#698B6C'
		},
		foresta: {
			primary: '#1B4332',
			secondary: '#E6F2ED',
			text: '#2D3D35',
			accent: '#40916C',
			border: '#2D6A4F'
		},

		// Temi Acquatici
		blu: {
			primary: '#1B4965',
			secondary: '#E8F1F5',
			text: '#2C3E50',
			accent: '#5FA8D3',
			border: '#3498db'
		},
		oceano: {
			primary: '#006D77',
			secondary: '#E6F3F4',
			text: '#2C3E46',
			accent: '#83C5BE',
			border: '#42949D'
		},
		turchese: {
			primary: '#2A9D8F',
			secondary: '#E9F5F4',
			text: '#264D49',
			accent: '#4FBDB1',
			border: '#37A99C'
		},

		// Temi Caldi
		rosso: {
			primary: '#912F40',
			secondary: '#FFE6E8',
			text: '#2C1810',
			accent: '#FF6B6B',
			border: '#E74C3C'
		},
		terracotta: {
			primary: '#BC6C25',
			secondary: '#FFF1E6',
			text: '#2F1810',
			accent: '#DDA15E',
			border: '#CC7A2D'
		},
		ambra: {
			primary: '#C84C09',
			secondary: '#FFF0E6',
			text: '#2C1810',
			accent: '#FF9F6B',
			border: '#E65D0E'
		},

		// Temi Viola
		viola: {
			primary: '#4A266A',
			secondary: '#F5E6FA',
			text: '#2C1810',
			accent: '#9B4DCA',
			border: '#8E44AD'
		},
		lavanda: {
			primary: '#735D78',
			secondary: '#F7EFF9',
			text: '#2B222D',
			accent: '#B392B9',
			border: '#846A89'
		},
		melanzana: {
			primary: '#5E366E',
			secondary: '#F6EFF8',
			text: '#2C1836',
			accent: '#A355C0',
			border: '#713D86'
		},

		// Temi Neutri
		grigio: {
			primary: '#4A4E69',
			secondary: '#F0F1F4',
			text: '#2B2D3E',
			accent: '#9A9EC5',
			border: '#5C6387'
		},
		seppia: {
			primary: '#6B4F4F',
			secondary: '#F4EFEF',
			text: '#2D2121',
			accent: '#A97979',
			border: '#7E5D5D'
		},
		tortora: {
			primary: '#6D6875',
			secondary: '#F4F3F4',
			text: '#2D2B30',
			accent: '#B1ACB9',
			border: '#817986'
		},

		// Temi Moderni
		indaco: {
			primary: '#33415C',
			secondary: '#EEF0F4',
			text: '#242B3A',
			accent: '#7D8BA1',
			border: '#485272'
		},
		petrolio: {
			primary: '#264653',
			secondary: '#ECF0F2',
			text: '#1A2C35',
			accent: '#4D8B9C',
			border: '#355B6B'
		},
		prugna: {
			primary: '#5F0F40',
			secondary: '#F9E6EF',
			text: '#2C1021',
			accent: '#B71375',
			border: '#7A1351'
		}
	},

	storage: new ThemeStorageManager(),

	init() {
		// Carica il tema salvato o usa quello di default
		const savedTheme = this.storage.loadTheme();
		if (savedTheme) {
			this.applyTheme(savedTheme);
		}

		// Seleziona il pulsante modifica tema
		const themeBtn = document.getElementById('editTheme')
		themeBtn.addEventListener('click', () => this.openThemeModal());
	},

	createColorPicker() {
		const container = document.createElement('div');
		container.className = 'theme-picker-container';

		// Aggiungi palette predefinite
		const palettesDiv = document.createElement('div');
		palettesDiv.className = 'predefined-palettes';

		Object.entries(this.palettes).forEach(([name, colors]) => {
			const paletteBtn = document.createElement('button');
			paletteBtn.className = 'palette-button';
			paletteBtn.style.backgroundColor = colors.primary;
			paletteBtn.title = name.charAt(0).toUpperCase() + name.slice(1);
			paletteBtn.addEventListener('click', () => {
				this.applyTheme(colors);
				this.storage.saveTheme(colors);
				MDL.close();
			});
			palettesDiv.appendChild(paletteBtn);
		});

		// Aggiungi color picker personalizzato
		const customPicker = document.createElement('div');
		customPicker.className = 'custom-picker';

		const headerCustomPicker = document.createElement('h4');
		// inseriamo il testo html personalizza il tuo colore
		headerCustomPicker.innerHTML = 'Personalizza il tuo colore <i class="fa-solid fa-palette"></i>';
		customPicker.appendChild(headerCustomPicker);

		const colorInput = document.createElement('input');
		colorInput.type = 'color';
		colorInput.value = getComputedStyle(document.documentElement)
			.getPropertyValue('--primary-color').trim();

		colorInput.addEventListener('change', (e) => {
			const primary = e.target.value;
			const colors = this.generatePaletteFromPrimary(primary);
			this.applyTheme(colors);
			this.storage.saveTheme(colors);
		});

		customPicker.appendChild(colorInput);
		container.appendChild(palettesDiv);
		container.appendChild(customPicker);

		return container;
	},

	generatePaletteFromPrimary(primaryColor) {
		// Genera una palette completa partendo dal colore primario
		return {
			primary: primaryColor,
			secondary: this.adjustColor(primaryColor, { lightness: 95 }),
			text: this.adjustColor(primaryColor, { saturation: -30, lightness: -20 }),
			accent: this.adjustColor(primaryColor, { hue: 30, saturation: 20, lightness: 20 }),
			border: this.adjustColor(primaryColor, { lightness: 20 })
		};
	},

	adjustColor(hex, { hue = 0, saturation = 0, lightness = 0 }) {
		// Converte hex in HSL, modifica i valori e riconverte in hex
		let r = parseInt(hex.slice(1, 3), 16);
		let g = parseInt(hex.slice(3, 5), 16);
		let b = parseInt(hex.slice(5, 7), 16);

		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		h = (h * 360 + hue) % 360;
		s = Math.min(Math.max(s * 100 + saturation, 0), 100);
		l = Math.min(Math.max(l * 100 + lightness, 0), 100);

		// Converti HSL in RGB
		h /= 360;
		s /= 100;
		l /= 100;

		function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		}

		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;

		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);

		const toHex = x => {
			const hex = Math.round(x * 255).toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		};

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	},

	applyTheme(colors) {
		document.documentElement.style.setProperty('--primary-color', colors.primary);
		document.documentElement.style.setProperty('--secondary-color', colors.secondary);
		document.documentElement.style.setProperty('--text-color', colors.text);
		document.documentElement.style.setProperty('--accent-color', colors.accent);
		document.documentElement.style.setProperty('--border-color', colors.border);
	},

	openThemeModal() {
		MDL.open(
			'Seleziona un tema',
			this.createColorPicker()
		);
	}
};

export default TEMA;