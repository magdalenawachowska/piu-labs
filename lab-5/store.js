import { randomHsl, uid } from './helpers.js';

const LS_KEY = 'shapes-state-v1';

class Store {
    constructor() {
        const saved = this.#load();
        this.state = saved ?? {
            shapes: [], // {id, type: "circle"|"square", color}
        };

        this.subscribers = new Set();
        this.lastAction = { type: 'init' };
    }

    //observer
    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.getState(), this.lastAction);
        return () => this.subscribers.delete(callback);
    }

    notify() {
        this.#save(this.state);
        for (const cb of this.subscribers) {
            cb(this.getState(), this.lastAction);
        }
    }

    getState() {
        const circles = this.state.shapes.filter(
            (s) => s.type === 'circle'
        ).length;
        const squares = this.state.shapes.filter(
            (s) => s.type === 'square'
        ).length;

        return {
            shapes: this.state.shapes,
            counters: { circles, squares },
        };
    }

    addShape(type) {
        const shape = {
            id: uid(),
            type,
            color: randomHsl(),
        };

        this.state = {
            ...this.state,
            shapes: [...this.state.shapes, shape],
        };

        this.lastAction = { type: 'add', shape };
        this.notify();
    }

    removeShape(id) {
        const removed = this.state.shapes.find((s) => s.id === id);
        if (!removed) return;

        this.state = {
            ...this.state,
            shapes: this.state.shapes.filter((s) => s.id !== id),
        };

        this.lastAction = { type: 'remove', id, removed };
        this.notify();
    }

    recolor(type) {
        const updated = this.state.shapes.map((s) =>
            s.type === type ? { ...s, color: randomHsl() } : s
        );

        const affectedIds = updated
            .filter(
                (s, i) =>
                    s.type === type && s.color !== this.state.shapes[i].color
            )
            .map((s) => s.id);

        this.state = { ...this.state, shapes: updated };
        this.lastAction = { type: 'recolor', shapeType: type, affectedIds };
        this.notify();
    }

    resetType(type) {
        const removedIds = this.state.shapes
            .filter((s) => s.type === type)
            .map((s) => s.id);

        this.state = {
            ...this.state,
            shapes: this.state.shapes.filter((s) => s.type !== type),
        };

        this.lastAction = { type: 'resetType', shapeType: type, removedIds };
        this.notify();
    }

    //localStorage
    #load() {
        try {
            const raw = localStorage.getItem(LS_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    #save(state) {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(state));
        } catch {
            // ignore
        }
    }
}

export const store = new Store();
