import loadTemplate from '../utils/loadTemplate.js';

const template = await loadTemplate('./components/card-element.html');

export default class CardElement extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }

    // getter i setter dla 'title'
    get title() {
        return this.getAttribute('title');
    }
    set title(value) {
        this.setAttribute('title', value);
    }

    // getter i setter dla 'desc'
    get desc() {
        return this.getAttribute('desc');
    }
    set desc(value) {
        this.setAttribute('desc', value);
    }

    connectedCallback() {
        this.shadowRoot.querySelector('h3').textContent =
            this.getAttribute('title') || 'Untitled';
        this.shadowRoot.querySelector('p').textContent =
            this.getAttribute('desc') || '';
        //this.addEventListener('click', this.#handleOnClick);
        this.shadowRoot.addEventListener('click', this.#handleOnClick);
    }

    static get observedAttributes() {
        return ['title', 'desc'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        if (name === 'title')
            this.shadowRoot.querySelector('h3').textContent = newVal;
        if (name === 'desc')
            this.shadowRoot.querySelector('p').textContent = newVal;
    }

    shuffleDesc() {
        this.desc = this.desc
            .split(' ')
            .sort(() => Math.random() - 0.5)
            .join(' ');
        this.#emitChange();
    }

    #emitChange() {
        this.dispatchEvent(
            new CustomEvent('desc-shuffled', {
                detail: { title: this.title, newDesc: this.desc },
                bubbles: true, // pozwala "płynąć" w górę DOM
                composed: true, // pozwala "przebić się" przez Shadow DOM
            })
        );
    }

    // Koniecznie funkcja strzałkowa, aby zachować kontekst 'this' - z wasami - normalna funkcja
    //najwieksza roznica- funkcje ze strzalkami zachowuja this stad albo gdzie jest uruchomiony

    //#handleOnClick = () => this.shuffleDesc();      //po klikaniu na calosc
    #handleOnClick = (e) => {
        if (e.target.tagName === 'P') this.shuffleDesc(); //po klikaniu na opis
    };

    disconnectedCallback() {
        //this.removeEventListener('click', this.#handleOnClick);
        this.shadowRoot.removeEventListener('click', this.#handleOnClick);
    }
}

customElements.define('card-element', CardElement);
