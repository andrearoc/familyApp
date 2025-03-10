import { GOOGLE_CONFIG } from './config.js';

export class GoogleAuthService {
  constructor() {
    this.tokenStorageKey = 'google_oauth_token';
    this.initialized = false;
  }

  // Carica le librerie Google necessarie
  loadGoogleLibraries() {
    const scripts = [
      'https://apis.google.com/js/api.js',
      'https://accounts.google.com/gsi/client'
    ];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });

    console.log('✅ Librerie Google caricate');
    return true;
  }

  // Inizializza il client Google
		initClient() {
			try {
				this.loadGoogleLibraries();

				window.gapi.load('client', () => {
					window.gapi.client.init({
						apiKey: GOOGLE_CONFIG.API_KEY,
						discoveryDocs: [
							"https://sheets.googleapis.com/$discovery/rest?version=v4",
							"https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
						]
					});
				});

				console.log('✅ Client Google inizializzato');
				this.initialized = true;
				return true;
			} catch (error) {
				console.error('❌ Errore inizializzazione client:', error);
				return false;
			}
		}

  // Autenticazione
	authenticate(callback) {
		try {
			if (!this.initialized) {
				this.initClient();
			}

			const savedToken = localStorage.getItem(this.tokenStorageKey);
			if (savedToken) {
				const parsedToken = JSON.parse(savedToken);
				if (Date.now() - parsedToken.obtained_at < 3600000) {
					// Token ancora valido
					if (callback) callback();
					return true;
				}
			}

			const tokenClient = window.google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CONFIG.CLIENT_ID,
				scope: GOOGLE_CONFIG.SCOPES,
				callback: (tokenResponse) => {
					console.log('✅ Token ottenuto:', tokenResponse);
					localStorage.setItem(this.tokenStorageKey, JSON.stringify({
						...tokenResponse,
						obtained_at: Date.now()
					}));

					// Esegui il callback dopo aver ottenuto il token
					if (callback) callback();
				}
			});

			tokenClient.requestAccessToken({
				prompt: 'consent'
			});

			return true;
		} catch (error) {
			console.error('❌ Errore di autenticazione:', error);
			return false;
		}
	}

  // Verifica se l'utente è autenticato
  isAuthenticated() {
    const savedToken = localStorage.getItem(this.tokenStorageKey);
    if (savedToken) {
      const parsedToken = JSON.parse(savedToken);
      return Date.now() - parsedToken.obtained_at < 3600000; // Token valido per 1 ora
    }
    return false;
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenStorageKey);
    console.log('✅ Logout eseguito');
  }
}

export const googleAuthService = new GoogleAuthService();