// slider.js
export default class Slider {
  constructor(options = {}) {
    this.container = null;
    this.slides = [];
    this.currentIndex = 0;
    this.autoplayInterval = null;

    // Opzioni di configurazione con valori predefiniti
    this.config = {
      containerId: options.containerId || 'slider-container',
      slideClass: options.slideClass || 'slider-slide',
      duration: options.duration || 5000,  // durata autoplay in ms
      transitionSpeed: options.transitionSpeed || 300,  // velocità transizione in ms
      showControls: options.showControls !== undefined ? options.showControls : true,
      showIndicators: options.showIndicators !== undefined ? options.showIndicators : true,
      autoplay: options.autoplay !== undefined ? options.autoplay : false,
      infinite: options.infinite !== undefined ? options.infinite : true,
      slidesToShow: options.slidesToShow || 1,
      slidesToScroll: options.slidesToScroll || 1,
      responsive: options.responsive || null,
      onInit: options.onInit || null,
      onChange: options.onChange || null
    };

    // Elementi DOM
    this.elements = {
      container: null,
      slidesWrapper: null,
      slides: [],
      prevButton: null,
      nextButton: null,
      indicators: null
    };
  }

  init(containerId = null) {
    // Permette di specificare un containerId diverso durante l'inizializzazione
    if (containerId) this.config.containerId = containerId;

    // Ottieni il container
    this.elements.container = document.getElementById(this.config.containerId);
    if (!this.elements.container) {
      console.error(`❌ Container con ID "${this.config.containerId}" non trovato`);
      return;
    }

    // Crea la struttura base dello slider
    this.createSliderStructure();

    // Imposta gli eventi
    this.setupEventListeners();

    // Inizia l'autoplay se richiesto
    if (this.config.autoplay) {
      this.startAutoplay();
    }

    // Invoca la callback onInit se fornita
    if (typeof this.config.onInit === 'function') {
      this.config.onInit(this);
    }

    // Adatta lo slider in base alle dimensioni attuali della finestra
    this.applyResponsiveSettings();

    // Mostra il primo slide
    this.goToSlide(0, false);
  }

  createSliderStructure() {
    // Svuota il container
    this.elements.container.innerHTML = '';
    this.elements.container.classList.add('slider-container');

    // Crea il wrapper degli slide
    this.elements.slidesWrapper = document.createElement('div');
    this.elements.slidesWrapper.classList.add('slider-wrapper');
    this.elements.container.appendChild(this.elements.slidesWrapper);

    // Crea i controlli
    if (this.config.showControls) {
      // Pulsante precedente
      this.elements.prevButton = document.createElement('button');
      this.elements.prevButton.classList.add('slider-control', 'slider-prev');
      this.elements.prevButton.innerHTML = '&lt;';
      this.elements.prevButton.setAttribute('aria-label', 'Precedente');
      this.elements.container.appendChild(this.elements.prevButton);

      // Pulsante successivo
      this.elements.nextButton = document.createElement('button');
      this.elements.nextButton.classList.add('slider-control', 'slider-next');
      this.elements.nextButton.innerHTML = '&gt;';
      this.elements.nextButton.setAttribute('aria-label', 'Successivo');
      this.elements.container.appendChild(this.elements.nextButton);
    }

    // Crea gli indicatori
    if (this.config.showIndicators) {
      this.elements.indicators = document.createElement('div');
      this.elements.indicators.classList.add('slider-indicators');
      this.elements.container.appendChild(this.elements.indicators);
    }
  }

  setupEventListeners() {
    // Eventi per i controlli
    if (this.config.showControls) {
      this.elements.prevButton.addEventListener('click', () => this.prev());
      this.elements.nextButton.addEventListener('click', () => this.next());
    }

    // Eventi swipe per il touch
    let startX, endX;
    const minSwipeDistance = 50;

    this.elements.container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.elements.container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const distance = endX - startX;

      if (Math.abs(distance) >= minSwipeDistance) {
        if (distance > 0) {
          this.prev();
        } else {
          this.next();
        }
      }
    }, { passive: true });

    // Responsive
    window.addEventListener('resize', () => {
      this.applyResponsiveSettings();
    });

    // Pausa autoplay quando il mouse è sopra lo slider
    this.elements.container.addEventListener('mouseenter', () => {
      if (this.config.autoplay) {
        this.stopAutoplay();
      }
    });

    this.elements.container.addEventListener('mouseleave', () => {
      if (this.config.autoplay) {
        this.startAutoplay();
      }
    });
  }

  // Aggiunge uno slide allo slider
  addSlide(content, isHTML = true) {
    const slide = document.createElement('div');
    slide.classList.add(this.config.slideClass);

    if (isHTML) {
      slide.innerHTML = content;
    } else {
      slide.appendChild(content);
    }

    this.elements.slidesWrapper.appendChild(slide);
    this.elements.slides.push(slide);

    // Aggiorna gli indicatori
    if (this.config.showIndicators) {
      this.updateIndicators();
    }

    return slide;
  }

  // Aggiorna indicatori
  updateIndicators() {
    if (!this.elements.indicators) return;

    this.elements.indicators.innerHTML = '';

    const totalSlides = Math.ceil(this.elements.slides.length / this.config.slidesToShow);

    for (let i = 0; i < totalSlides; i++) {
      const indicator = document.createElement('button');
      indicator.classList.add('slider-indicator');
      indicator.setAttribute('aria-label', `Vai allo slide ${i + 1}`);

      if (i === this.currentIndex) {
        indicator.classList.add('active');
      }

      indicator.addEventListener('click', () => this.goToSlide(i));
      this.elements.indicators.appendChild(indicator);
    }
  }

  // Va allo slide successivo
  next() {
    const nextIndex = this.currentIndex + 1;
    const totalSlides = Math.ceil(this.elements.slides.length / this.config.slidesToShow);

    if (nextIndex >= totalSlides) {
      if (this.config.infinite) {
        this.goToSlide(0);
      }
    } else {
      this.goToSlide(nextIndex);
    }
  }

  // Va allo slide precedente
  prev() {
    const prevIndex = this.currentIndex - 1;
    const totalSlides = Math.ceil(this.elements.slides.length / this.config.slidesToShow);

    if (prevIndex < 0) {
      if (this.config.infinite) {
        this.goToSlide(totalSlides - 1);
      }
    } else {
      this.goToSlide(prevIndex);
    }
  }

  // Va a uno slide specifico
  goToSlide(index, animate = true) {
    if (index === this.currentIndex) return;

    const totalSlides = Math.ceil(this.elements.slides.length / this.config.slidesToShow);

    // Controlla se l'indice è valido
    if (index < 0 || index >= totalSlides) {
      return;
    }

    // Calcola la posizione in percentuale
    const translateX = -(index * 100) + '%';

    // Imposta la transizione
    if (animate) {
      this.elements.slidesWrapper.style.transition = `transform ${this.config.transitionSpeed}ms ease`;
    } else {
      this.elements.slidesWrapper.style.transition = 'none';
    }

    // Sposta gli slide
    this.elements.slidesWrapper.style.transform = `translateX(${translateX})`;

    // Aggiorna l'indice corrente
    this.currentIndex = index;

    // Aggiorna gli indicatori
    if (this.config.showIndicators) {
      const indicators = this.elements.indicators.querySelectorAll('.slider-indicator');
      indicators.forEach((indicator, i) => {
        if (i === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }

    // Invoca la callback onChange se fornita
    if (typeof this.config.onChange === 'function') {
      this.config.onChange(index, this);
    }
  }

  // Avvia l'autoplay
  startAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }

    this.autoplayInterval = setInterval(() => {
      this.next();
    }, this.config.duration);
  }

  // Ferma l'autoplay
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  // Applica le impostazioni responsive
  applyResponsiveSettings() {
    if (!this.config.responsive) return;

    const windowWidth = window.innerWidth;
    let appliedSettings = null;

    // Trova le impostazioni responsive appropriate
    for (const breakpoint of this.config.responsive) {
      if (windowWidth <= breakpoint.breakpoint) {
        appliedSettings = breakpoint.settings;
      }
    }

    // Applica le nuove impostazioni
    if (appliedSettings) {
      Object.assign(this.config, appliedSettings);

      // Aggiorna la disposizione degli slide
      this.updateSlideLayout();

      // Aggiorna gli indicatori
      if (this.config.showIndicators) {
        this.updateIndicators();
      }
    }
  }

  // Aggiorna la disposizione degli slide
  updateSlideLayout() {
    const slideWidth = 100 / this.config.slidesToShow;

    // Imposta la larghezza degli slide
    this.elements.slides.forEach(slide => {
      slide.style.width = `${slideWidth}%`;
    });

    // Aggiorna i controlli
    if (this.elements.prevButton) {
      this.elements.prevButton.style.display = this.config.showControls ? 'block' : 'none';
    }

    if (this.elements.nextButton) {
      this.elements.nextButton.style.display = this.config.showControls ? 'block' : 'none';
    }

    // Aggiorna gli indicatori
    if (this.elements.indicators) {
      this.elements.indicators.style.display = this.config.showIndicators ? 'flex' : 'none';
    }
  }

  // Rimuove tutti gli slide
  clearSlides() {
    this.elements.slidesWrapper.innerHTML = '';
    this.elements.slides = [];
    this.currentIndex = 0;

    // Aggiorna gli indicatori
    if (this.config.showIndicators) {
      this.updateIndicators();
    }
  }

  // Distrugge lo slider
  destroy() {
    // Rimuovi gli eventi
    if (this.elements.prevButton) {
      this.elements.prevButton.removeEventListener('click', () => this.prev());
    }

    if (this.elements.nextButton) {
      this.elements.nextButton.removeEventListener('click', () => this.next());
    }

    // Ferma l'autoplay
    this.stopAutoplay();

    // Rimuovi la struttura
    if (this.elements.container) {
      this.elements.container.innerHTML = '';
    }

    // Reset delle variabili
    this.elements = {
      container: null,
      slidesWrapper: null,
      slides: [],
      prevButton: null,
      nextButton: null,
      indicators: null
    };
  }
}