const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: block;
            font-family: system-ui, Arial;
        }
        h1 {
            font-size: 1.5rem;
            color: blue;
        }
        p.description {
            font-size: 1rem;
            color: gray;
        }
        hello-element b {
            color: red;
        }
    </style>
    <h1>
        <!-- Tutaj zostanie wyświetlona zawartość Light DOM -->
        <slot></slot>
    </h1>
    <p class="description">
        <slot name="description">Default description.</slot>
    </p>
`;

export default class HelloElement extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('hello-element', HelloElement);
