//kolory
function randomHex() {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.random() * 15; // 60–75%
    const l = 80 + Math.random() * 12; // 80–92%
    return hslToHex(h, s, l);
}
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }

    const toHex = (v) =>
        Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const LS = {
    todo: 'toDoCards',
    inprog: 'inProgressCards',
    done: 'doneCards',
};

const $ = (sel) => document.querySelector(sel);

// przyciski
const addPaperToDoBtn = $('#addPaperToDo');
const changePaperColorToDo = $('#changePaperColorToDo');

const addPaperInProgressBtn = $('#addPaperInProgress');
const changePaperColorInProgress = $('#changePaperColorInProgress');

const addPaperDoneBtn = $('#addPaperDone');
const changePaperColorDone = $('#changePaperColorDone');

// kontenery kolumn
const toDoContainer = $('#toDoColumn .container');
const inProgressContainer = $('#inProgressColumn .container');
const doneContainer = $('#doneColumn .container');

// liczniki
const toDoCounter = $('#toDoCounter');
const inProgressCounter = $('#inProgressCounter');
const doneCounter = $('#doneCounter');

const loadCards = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveCards = (key, arr) => localStorage.setItem(key, JSON.stringify(arr));

function updateCounter() {
    toDoCounter.textContent = toDoContainer.querySelectorAll('.card').length;

    if (inProgressCounter) {
        const n = inProgressContainer.querySelectorAll('.card').length;
        inProgressCounter.textContent = `Licznik kart: ${n}`;
    }
    if (doneCounter) {
        const n = doneContainer.querySelectorAll('.card').length;
        doneCounter.textContent = `Licznik kart: ${n}`;
    }
}

// Ustalenie, w której kolumnie jest karta
function columnKeyFor(cardEl) {
    if (cardEl.closest('#toDoColumn')) return LS.todo;
    if (cardEl.closest('#inProgressColumn')) return LS.inprog;
    if (cardEl.closest('#doneColumn')) return LS.done;
    return null;
}

function updateCardColorInStorage(cardEl, newColor) {
    const key = columnKeyFor(cardEl);
    if (!key) return;
    const id = Number(cardEl.dataset.id);
    const arr = loadCards(key);
    const found = arr.find((c) => c.id === id);
    if (found) {
        found.color = newColor;
        saveCards(key, arr);
    }
}

function updateCardTextInStorage(cardEl, newText) {
    const key = columnKeyFor(cardEl);
    if (!key) return;
    const id = Number(cardEl.dataset.id);
    const arr = loadCards(key);
    const found = arr.find((c) => c.id === id);
    if (found) {
        found.text = newText;
        saveCards(key, arr);
    }
}

//nowa karta
function buildCardElement({ id, text, color }, column) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = String(id);
    card.style.backgroundColor = color;

    card.style.border = '2px solid white';
    card.style.borderRadius = '10px';
    card.style.width = '330px';
    card.style.marginLeft = '34px';
    card.style.marginTop = '10px';
    card.style.padding = '8px';

    // pasek z przyciskami
    const bar = document.createElement('div');
    bar.style.display = 'flex';
    bar.style.gap = '8px';
    bar.style.justifyContent = 'flex-end';
    bar.style.alignItems = 'center';

    const mkBtn = (txt, cls) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = txt;
        b.className = cls;
        b.style.fontWeight = '600';
        b.style.color = 'white';
        b.style.backgroundColor = 'rgb(93, 36, 74)';
        b.style.border = '0';
        b.style.cursor = 'pointer';
        b.style.borderRadius = '6px';
        b.style.height = '20px';
        return b;
    };

    const closeBtn = mkBtn('×', 'close-btn');
    const colorBtn = mkBtn('🎨', 'color-btn');

    // color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = color;
    colorInput.className = 'card-color-input';
    colorInput.style.position = 'absolute';
    colorInput.style.opacity = '0';
    colorInput.style.width = '0';
    colorInput.style.height = '0';
    colorInput.style.pointerEvents = 'none';

    colorInput.addEventListener('change', () => {
        const newColor = colorInput.value;
        card.style.backgroundColor = newColor;
        updateCardColorInStorage(card, newColor);
    });

    // strzałki
    let moveLeftBtn = null;
    let moveRightBtn = null;

    if (column === 'todo') {
        moveRightBtn = mkBtn('→', 'move-right-btn');
    } else if (column === 'inprog') {
        moveLeftBtn = mkBtn('←', 'move-left-btn');
        moveRightBtn = mkBtn('→', 'move-right-btn');
    } else if (column === 'done') {
        moveLeftBtn = mkBtn('←', 'move-left-btn');
    }

    // tytuł
    const title = document.createElement('div');
    title.className = 'card-text';
    title.contentEditable = 'true';
    title.textContent = text;
    title.style.fontWeight = '400';
    title.style.color = 'white';
    title.style.marginTop = '6px';
    title.style.outline = 'none';

    // zapis edycji
    title.addEventListener('input', () => {
        updateCardTextInStorage(card, title.textContent || '');
    });

    bar.append(colorBtn, colorInput);
    if (moveLeftBtn) bar.append(moveLeftBtn);
    if (moveRightBtn) bar.append(moveRightBtn);
    bar.append(closeBtn);

    card.append(bar, title);
    return card;
}

function renderCard(cardData, columnKey) {
    const el = buildCardElement(
        cardData,
        columnKey === 'todo'
            ? 'todo'
            : columnKey === 'inprog'
            ? 'inprog'
            : 'done'
    );
    if (columnKey === 'todo') {
        toDoContainer.append(el);
    } else if (columnKey === 'inprog') {
        inProgressContainer.append(el);
    } else if (columnKey === 'done') {
        doneContainer.append(el);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadCards(LS.todo).forEach((c) => renderCard(c, 'todo'));
    loadCards(LS.inprog).forEach((c) => renderCard(c, 'inprog'));
    loadCards(LS.done).forEach((c) => renderCard(c, 'done'));
    updateCounter();
});

addPaperToDoBtn.addEventListener('click', () => {
    const card = { id: Date.now(), text: 'Nowa karta', color: randomHex() };
    renderCard(card, 'todo');
    const arr = loadCards(LS.todo);
    arr.push(card);
    saveCards(LS.todo, arr);
    updateCounter();
});

if (addPaperInProgressBtn) {
    addPaperInProgressBtn.addEventListener('click', () => {
        const card = { id: Date.now(), text: 'Nowa karta', color: randomHex() };
        renderCard(card, 'inprog');
        const arr = loadCards(LS.inprog);
        arr.push(card);
        saveCards(LS.inprog, arr);
        updateCounter();
    });
}

if (addPaperDoneBtn) {
    addPaperDoneBtn.addEventListener('click', () => {
        const card = { id: Date.now(), text: 'Nowa karta', color: randomHex() };
        renderCard(card, 'done');
        const arr = loadCards(LS.done);
        arr.push(card);
        saveCards(LS.done, arr);
        updateCounter();
    });
}

function moveCardBetween(cardEl, fromKey, toKey, toContainer, toColumnKey) {
    const id = Number(cardEl.dataset.id);

    //znalezienie karty
    const fromArr = loadCards(fromKey);
    const idx = fromArr.findIndex((c) => c.id === id);
    if (idx === -1) return;

    //ze storage
    const [moved] = fromArr.splice(idx, 1);

    //aktualizacja tekstu
    moved.text = cardEl.querySelector('.card-text')?.textContent || moved.text;

    // zapisanie zmian w storage
    saveCards(fromKey, fromArr);
    const toArr = loadCards(toKey);
    toArr.push(moved);
    saveCards(toKey, toArr);

    cardEl.remove();
    renderCard(moved, toColumnKey);

    updateCounter();
}

toDoContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.card');
    if (!card) return;

    // usuń
    if (btn.classList.contains('close-btn')) {
        const id = Number(card.dataset.id);
        card.remove();
        saveCards(
            LS.todo,
            loadCards(LS.todo).filter((c) => c.id !== id)
        );
        updateCounter();
        return;
    }

    // kolor pojedynczej karty
    if (btn.classList.contains('color-btn')) {
        const picker = card.querySelector('.card-color-input');
        if (picker) picker.click();
        return;
    }

    // przenieś → do In Progress
    if (btn.classList.contains('move-right-btn')) {
        moveCardBetween(
            card,
            LS.todo,
            LS.inprog,
            inProgressContainer,
            'inprog'
        );
    }
});

inProgressContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.card');
    if (!card) return;

    const id = Number(card.dataset.id);

    if (btn.classList.contains('close-btn')) {
        card.remove();
        saveCards(
            LS.inprog,
            loadCards(LS.inprog).filter((c) => c.id !== id)
        );
        updateCounter();
        return;
    }

    if (btn.classList.contains('color-btn')) {
        const picker = card.querySelector('.card-color-input');
        if (picker) picker.click();
        return;
    }

    if (btn.classList.contains('move-left-btn')) {
        moveCardBetween(card, LS.inprog, LS.todo, toDoContainer, 'todo');
        return;
    }

    if (btn.classList.contains('move-right-btn')) {
        moveCardBetween(card, LS.inprog, LS.done, doneContainer, 'done');
        return;
    }
});

doneContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.card');
    if (!card) return;

    const id = Number(card.dataset.id);

    if (btn.classList.contains('close-btn')) {
        card.remove();
        saveCards(
            LS.done,
            loadCards(LS.done).filter((c) => c.id !== id)
        );
        updateCounter();
        return;
    }

    if (btn.classList.contains('color-btn')) {
        const picker = card.querySelector('.card-color-input');
        if (picker) picker.click();
        return;
    }

    if (btn.classList.contains('move-left-btn')) {
        moveCardBetween(
            card,
            LS.done,
            LS.inprog,
            inProgressContainer,
            'inprog'
        );
        return;
    }
});

//kolorowanie calej kolumny
changePaperColorToDo.addEventListener('click', () => {
    const cards = loadCards(LS.todo);
    const map = new Map(cards.map((c) => [c.id, c]));
    toDoContainer.querySelectorAll('.card').forEach((el) => {
        const id = Number(el.dataset.id);
        const newColor = randomHex();
        el.style.backgroundColor = newColor;
        const data = map.get(id);
        if (data) data.color = newColor;
    });
    saveCards(LS.todo, Array.from(map.values()));
});

changePaperColorInProgress?.addEventListener('click', () => {
    const cards = loadCards(LS.inprog);
    const map = new Map(cards.map((c) => [c.id, c]));
    inProgressContainer.querySelectorAll('.card').forEach((el) => {
        const id = Number(el.dataset.id);
        const newColor = randomHex();
        el.style.backgroundColor = newColor;
        const data = map.get(id);
        if (data) data.color = newColor;
    });
    saveCards(LS.inprog, Array.from(map.values()));
});

changePaperColorDone?.addEventListener('click', () => {
    const cards = loadCards(LS.done);
    const map = new Map(cards.map((c) => [c.id, c]));
    doneContainer.querySelectorAll('.card').forEach((el) => {
        const id = Number(el.dataset.id);
        const newColor = randomHex();
        el.style.backgroundColor = newColor;
        const data = map.get(id);
        if (data) data.color = newColor;
    });
    saveCards(LS.done, Array.from(map.values()));
});
