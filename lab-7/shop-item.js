import loadTemplate from './loadTemplate.js';

const templatePromise = loadTemplate('./template.html');

class ShopItem extends HTMLElement {
    #product = null;
    #ready = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set product(value) {
        this.#product = value;

        //opoznienie renderowania
        if (this.#ready) this.render();
    }

    get product() {
        return this.#product;
    }

    async connectedCallback() {
        if (!this.shadowRoot.hasChildNodes()) {
            const tpl = await templatePromise;
            this.shadowRoot.appendChild(tpl.content.cloneNode(true));

            this.shadowRoot
                .querySelector('.button')
                ?.addEventListener('click', () => {
                    if (!this.#product) return;

                    this.dispatchEvent(
                        new CustomEvent('add-to-cart', {
                            detail: this.#product,
                            bubbles: true,
                            composed: true,
                        })
                    );
                });
        }

        this.#ready = true;
        this.render();
    }

    render() {
        // jeśli nie ma danych albo jeszcze nie ma template — wyjdź
        if (!this.#ready || !this.#product) return;

        const p = this.#product;

        const img = this.shadowRoot.querySelector('.img');
        const nameEl = this.shadowRoot.querySelector('.name');
        const priceEl = this.shadowRoot.querySelector('.price');
        const promoEl = this.shadowRoot.querySelector('.promo');
        const sizesEl = this.shadowRoot.querySelector('.sizes');
        const colorsEl = this.shadowRoot.querySelector('.colors');

        if (img) {
            img.src = p.image ?? '';
            img.alt = p.name ?? '';
        }

        if (nameEl) nameEl.textContent = p.name ?? 'Bez nazwy';
        if (priceEl)
            priceEl.textContent = `${Number(p.price ?? 0).toFixed(2)} zł`;
        if (promoEl) promoEl.textContent = p.promo ?? '';
        if (sizesEl) sizesEl.textContent = p.sizes ?? '';

        if (colorsEl) {
            colorsEl.innerHTML = '';

            let i = 0;
            for (const c of p.colors ?? []) {
                const dot = document.createElement('span');
                dot.className = 'color';
                if (i == 0) dot.classList.add('selected');
                dot.dataset.color = c;
                dot.title = c;
                colorsEl.appendChild(dot);
                i++;
            }
        }
    }
}
customElements.define('shop-item', ShopItem);
