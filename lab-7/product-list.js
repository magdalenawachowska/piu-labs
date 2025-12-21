class ProductList extends HTMLElement {
    #products = [];

    set products(value) {
        this.#products = Array.isArray(value) ? value : [];
        this.render();
    }

    get products() {
        return this.#products;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = '';
        this.classList.add('products');

        for (const p of this.#products) {
            const item = document.createElement('shop-item');
            item.product = p;
            this.appendChild(item);
        }
    }
}

customElements.define('product-list', ProductList);
