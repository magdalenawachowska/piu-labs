export function randomHsl() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 75%)`;
}

export function uid() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
