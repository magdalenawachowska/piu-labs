import { Ajax } from './script.js';

const api = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
});

const loadBtn = document.getElementById('load-data-btn');
const loadWithErrorBtn = document.getElementById('load-data-error-btn');
const loadTimeoutBtn = document.getElementById('load-data-timeout-btn');

const resetBtn = document.getElementById('reset-btn');
const postBtn = document.getElementById('post-btn');
const putBtn = document.getElementById('put-btn');
const deleteBtn = document.getElementById('delete-btn');

const listEl = document.getElementById('data-list');
const errorEl = document.getElementById('error-container');
const loaderEl = document.getElementById('loader');

const loaderMinDuration = 500;

function setLoading(isLoading) {
    loaderEl.style.display = isLoading ? 'inline-block' : 'none';
}

function clearView() {
    listEl.innerHTML = '';
    errorEl.textContent = '';
}

function renderTodos(todos) {
    listEl.innerHTML = '';
    todos.forEach((todo) => {
        const li = document.createElement('li');
        li.textContent = `#${todo.id} - ${todo.title} (completed: ${todo.completed})`;
        listEl.appendChild(li);
    });
}

function renderMessage(message) {
    listEl.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = message;
    listEl.appendChild(li);
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withLoaderAndDelay(taskFn) {
    clearView();
    setLoading(true);

    const start = Date.now();
    let result = null;
    let error = null;

    try {
        result = await taskFn();
    } catch (err) {
        error = err;
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(loaderMinDuration - elapsed, 0);
    if (remaining > 0) {
        await delay(remaining);
    }

    setLoading(false);

    if (error) {
        errorEl.textContent = error.message;
        console.error(error);
    }

    return { result, error };
}

loadBtn.addEventListener('click', async () => {
    const { result, error } = await withLoaderAndDelay(() =>
        api.get('/todos?_limit=12')
    );

    if (!error) {
        renderTodos(result);
    }
});

loadWithErrorBtn.addEventListener('click', async () => {
    const { error } = await withLoaderAndDelay(() => api.get('/wrong-url'));

    if (!error) {
        renderMessage('This should not happen (no error).');
    }
});

loadTimeoutBtn.addEventListener('click', async () => {
    const { result, error } = await withLoaderAndDelay(() =>
        api.get('/todos/1', { timeout: 10 })
    );

    if (!error && result) {
        renderMessage(`#${result.id} - ${result.title}`);
    }
});

resetBtn.addEventListener('click', () => {
    setLoading(false);
    clearView();
});

postBtn.addEventListener('click', async () => {
    const { result, error } = await withLoaderAndDelay(() =>
        api.post('/posts', {
            title: 'New post from Ajax demo',
            body: 'Lorem ipsum dolor sit amet.',
            userId: 1,
        })
    );

    if (!error && result) {
        renderMessage(
            `Created post id=${result.id}, title="${result.title} (simulation)"`
        );
    }
});

putBtn.addEventListener('click', async () => {
    const { result, error } = await withLoaderAndDelay(() =>
        api.put('/posts/1', {
            id: 1,
            title: 'Updated title from Ajax demo',
            body: 'Updated body from Ajax demo.',
            userId: 1,
        })
    );

    if (!error && result) {
        renderMessage(
            `Updated post id=${result.id}, title="${result.title} (simulation)"`
        );
    }
});

deleteBtn.addEventListener('click', async () => {
    const { error } = await withLoaderAndDelay(() => api.delete('/posts/1'));

    if (!error) {
        renderMessage('Deleted post with id=1 (simulation)');
    }
});
