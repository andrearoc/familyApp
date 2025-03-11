/**
 * Tool.js - Versione modificata per interfaccia stile iOS
 */
import MDL from '../modal.js';
import { generatePassword, togglePasswordGenerator } from './passwordGenerator.js';
import { generateQRCode, createInterface as createQRInterface } from './qrGenerator.js';
import { convertUnit } from './unitConverter.js';
import { DOC } from './documents.js';
import HCL from './hourCalculator.js';

// Oggetto principale che gestisce tutti gli strumenti
const TOOL = {
  toolsConfig: [
    {
      id: 'passwordGenerator',
      name: 'Password',
      icon: 'fa-key',
      getContent: () => {
        const content = document.createElement('div');
        content.innerHTML = `
          <h3>Generatore di Password</h3>
          <div class="input-group">
            <label for="pwdLength">Lunghezza:</label>
            <input type="number" id="pwdLength" min="8" max="32" value="12">
            <button id="generatePwdBtn">Genera</button>
          </div>
          <div id="pwdResult" class="result-container"></div>
        `;

        // Aggiungiamo listener dopo che il contenuto è stato inserito nel DOM
        setTimeout(() => {
          document.getElementById('generatePwdBtn').addEventListener('click', () => {
            const length = parseInt(document.getElementById('pwdLength').value);
            const password = generatePassword(length);
            const resultDiv = document.getElementById('pwdResult');

            resultDiv.innerHTML = `
              <div class="password-display">${password}</div>
              <button id="copyPwdBtn">Copia</button>
            `;

            document.getElementById('copyPwdBtn').addEventListener('click', () => {
              navigator.clipboard.writeText(password)
                .then(() => alert('Password copiata negli appunti'))
                .catch(err => console.error('Errore durante la copia: ', err));
            });
          });
        }, 10);

        return content;
      }
    },
    {
      id: 'qrGenerator',
      name: 'QR Code',
      icon: 'fa-qrcode',
      getContent: () => {
        return createQRInterface();
      }
    },
    {
      id: 'unitConverter',
      name: 'Convertitore',
      icon: 'fa-exchange-alt',
      getContent: () => {
        const content = document.createElement('div');
        content.innerHTML = `
          <h3>Convertitore di Unità</h3>
          <div class="unit-converter-form">
            <div class="input-group">
              <input type="number" id="unitValue" placeholder="Valore">
              <select id="fromUnit">
                <option value="meters">Metri</option>
                <option value="centimeters">Centimetri</option>
                <option value="kilometers">Chilometri</option>
                <option value="miles">Miglia</option>
                <option value="liters">Litri</option>
                <option value="milliliters">Millilitri</option>
                <option value="centiliters">Centilitri</option>
                <option value="deciliters">Decilitri</option>
                <option value="hectoliters">Ettolitri</option>
              </select>
              <span class="arrow">→</span>
              <select id="toUnit">
                <option value="centimeters">Centimetri</option>
                <option value="meters">Metri</option>
                <option value="kilometers">Chilometri</option>
                <option value="miles">Miglia</option>
                <option value="milliliters">Millilitri</option>
                <option value="liters">Litri</option>
                <option value="centiliters">Centilitri</option>
                <option value="deciliters">Decilitri</option>
                <option value="hectoliters">Ettolitri</option>
              </select>
              <button id="convertBtn">Converti</button>
            </div>
            <div id="conversionResult" class="result-container"></div>
          </div>
        `;

        // Aggiungiamo listener dopo che il contenuto è stato inserito nel DOM
        setTimeout(() => {
          document.getElementById('convertBtn').addEventListener('click', () => {
            const value = parseFloat(document.getElementById('unitValue').value);
            const fromUnit = document.getElementById('fromUnit').value;
            const toUnit = document.getElementById('toUnit').value;

            try {
              const result = convertUnit(value, fromUnit, toUnit);
              document.getElementById('conversionResult').textContent =
                `${value} ${TOOL.getUnitLabel(fromUnit)} = ${result.toFixed(4)} ${TOOL.getUnitLabel(toUnit)}`;
            } catch (error) {
              document.getElementById('conversionResult').textContent = error.message;
            }
          });
        }, 10);

        return content;
      }
    },
    {
      id: 'documentManager',
      name: 'Documenti',
      icon: 'fa-file-alt',
      getContent: () => {
        const content = DOC.createInterface();
        // Aggiorniamo la lista dei documenti dopo che il contenuto è stato inserito nel DOM
        setTimeout(() => {
          DOC.updateDocumentsList();
        }, 10);
        return content;
      }
    },
    {
      id: 'hourCalculator',
      name: 'Ore',
      icon: 'fa-clock',
      getContent: () => {
        return HCL.createInterface();
      }
    }
  ],

  init(toolsContainer) {
    if (!toolsContainer) {
      console.error('Container degli strumenti non trovato');
      return;
    }

    // Inizializza il modal
    MDL.init();

    // Crea il container per le icone stile iOS
    const appsGrid = document.createElement('div');
    appsGrid.className = 'app-grid';
    toolsContainer.appendChild(appsGrid);

    // Crea le icone per ogni tool
    this.toolsConfig.forEach(tool => {
      this.createAppIcon(appsGrid, tool);
    });

    console.log('Interfaccia strumenti stile iOS inizializzata con successo');
  },

  createAppIcon(container, tool) {
    const appIcon = document.createElement('div');
    appIcon.className = 'app-icon';
    appIcon.id = `app-${tool.id}`;

    appIcon.innerHTML = `
      <div class="icon-circle">
        <i class="fas ${tool.icon}"></i>
      </div>
      <div class="icon-name">${tool.name}</div>
    `;

    appIcon.addEventListener('click', () => {
      // Apri il modal con il contenuto del tool
      MDL.open(tool.name, tool.getContent());
    });

    container.appendChild(appIcon);
  },

  // Funzione di utility per le etichette delle unità
  getUnitLabel(unit) {
    const labels = {
      meters: 'metri',
      centimeters: 'centimetri',
      kilometers: 'chilometri',
      miles: 'miglia',
      liters: 'litri',
      milliliters: 'millilitri',
      centiliters: 'centilitri',
      deciliters: 'decilitri',
      hectoliters: 'ettolitri'
    };

    return labels[unit] || unit;
  },

  // Metodo per pulire le risorse
  cleanup() {
    // Rimuovi gli event listener aggiunti alle icone
    this.toolsConfig.forEach(tool => {
      const iconElement = document.getElementById(`app-${tool.id}`);
      if (iconElement) {
        const newIcon = iconElement.cloneNode(true);
        iconElement.parentNode.replaceChild(newIcon, iconElement);
      }
    });

    // Chiama i metodi di cleanup per i moduli che ne hanno bisogno
    HCL.cleanup();
  }
};

export default TOOL;