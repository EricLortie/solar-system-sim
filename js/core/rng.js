// Seeded Random Number Generator
export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    random(min = 0, max = 1) {
        return min + this.next() * (max - min);
    }

    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    randomChoice(arr) {
        return arr[Math.floor(this.next() * arr.length)];
    }
}

// Global RNG instance
export let rng = new SeededRandom(Date.now());

export function setRandomSeed(seed) {
    if (typeof seed === 'string') {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }
        seed = Math.abs(hash);
    }
    rng = new SeededRandom(seed);
    return seed;
}

export function getRng() {
    return rng;
}
