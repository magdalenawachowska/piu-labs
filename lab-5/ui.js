import { store } from './store.js';

export function initUI() {
    const circlesCounterEl = document.getElementById('circles-counter');
    const squaresCounterEl = document.getElementById('squares-counter');

    const addCBtn = document.getElementById('add-c-btn');
    const addSBtn = document.getElementById('add-s-btn');
    const resetCBtn = document.getElementById('reset-c-btn');
    const resetSBtn = document.getElementById('reset-s-btn');

    const recolorCBtn = document.getElementById('recolor-c-btn');
    const recolorSBtn = document.getElementById('recolor-s-btn');

    const container = document.getElementById('container');
    const cDiv = document.getElementById('circles-container');
    const sDiv = document.getElementById('squares-container');

    //eventy ui
    addCBtn.addEventListener('click', () => store.addShape('circle'));
    addSBtn.addEventListener('click', () => store.addShape('square'));
    resetCBtn.addEventListener('click', () => store.resetType('circle'));
    resetSBtn.addEventListener('click', () => store.resetType('square'));

    recolorCBtn?.addEventListener('click', () => store.recolor('circle'));
    recolorSBtn?.addEventListener('click', () => store.recolor('square'));

    //usuwanie- delegacja
    container.addEventListener('click', (e) => {
        const el = e.target.closest('.shape');
        if (!el) return;
        store.removeShape(el.dataset.id);
    });

    const renderedIds = new Set();

    function createShapeEl(shape) {
        const el = document.createElement('div');
        el.className = `shape ${shape.type}`;
        el.style.backgroundColor = shape.color;
        el.dataset.id = shape.id;
        el.dataset.type = shape.type;
        return el;
    }

    function fullRender(state) {
        cDiv.innerHTML = '';
        sDiv.innerHTML = '';
        renderedIds.clear();

        for (const shape of state.shapes) {
            const el = createShapeEl(shape);
            (shape.type === 'circle' ? cDiv : sDiv).appendChild(el);
            renderedIds.add(shape.id);
        }
    }

    function updateCounters(state) {
        circlesCounterEl.textContent = state.counters.circles;
        squaresCounterEl.textContent = state.counters.squares;
    }

    store.subscribe((state, action) => {
        updateCounters(state);

        switch (action.type) {
            case 'init':
                fullRender(state);
                break;

            case 'add': {
                const { shape } = action;
                const el = createShapeEl(shape);
                (shape.type === 'circle' ? cDiv : sDiv).appendChild(el);
                renderedIds.add(shape.id);
                break;
            }

            case 'remove': {
                const el = container.querySelector(`[data-id="${action.id}"]`);
                if (el) el.remove();
                renderedIds.delete(action.id);
                break;
            }

            case 'resetType': {
                for (const id of action.removedIds) {
                    const el = container.querySelector(`[data-id="${id}"]`);
                    if (el) el.remove();
                    renderedIds.delete(id);
                }
                break;
            }

            case 'recolor': {
                for (const id of action.affectedIds) {
                    const shape = state.shapes.find((s) => s.id === id);
                    const el = container.querySelector(`[data-id="${id}"]`);
                    if (el && shape) el.style.backgroundColor = shape.color;
                }
                break;
            }
        }
    });
}
