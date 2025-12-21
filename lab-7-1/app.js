import './components/hello-element.js';
import './components/card-element.js';

const log = document.querySelector('p');

const cities = ['Kraków', 'Poznań', 'Gdańsk', 'Wrocław'];
let cityIndex = 0;

const card = document.querySelector('card-element');

const btnChange = document.querySelector('button');
btnChange.addEventListener('click', () => {
    card.title = cities[++cityIndex % cities.length];
    card.shuffleDesc();
});

card.addEventListener('desc-shuffled', (e) => {
    log.innerText = `Opis ${e.detail.title} pomieszano na: ${e.detail.newDesc}`;
});
