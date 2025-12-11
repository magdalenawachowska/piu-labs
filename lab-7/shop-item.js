import loadTemplate from './loadTemplate.js';

let templatePromise = loadTemplate('./template.html');

class ShopItem extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        templatePromise.then((tpl) => {
            shadow.appendChild(tpl.content.cloneNode(true));
        });
    }
}

customElements.define('shop-item', ShopItem);
