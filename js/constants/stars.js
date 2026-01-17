// Star Class Definitions
// Based on the Morgan-Keenan spectral classification

export const STAR_CLASSES = {
    O: {
        name: 'O-Class (Blue Supergiant)',
        color: '#9bb0ff',
        tempMin: 30000, tempMax: 50000,
        radiusMin: 6.6, radiusMax: 15,
        massMin: 16, massMax: 150,
        luminosityMin: 30000, luminosityMax: 1000000,
        probability: 0.00003
    },
    B: {
        name: 'B-Class (Blue Giant)',
        color: '#aabfff',
        tempMin: 10000, tempMax: 30000,
        radiusMin: 1.8, radiusMax: 6.6,
        massMin: 2.1, massMax: 16,
        luminosityMin: 25, luminosityMax: 30000,
        probability: 0.13
    },
    A: {
        name: 'A-Class (White)',
        color: '#cad7ff',
        tempMin: 7500, tempMax: 10000,
        radiusMin: 1.4, radiusMax: 1.8,
        massMin: 1.4, massMax: 2.1,
        luminosityMin: 5, luminosityMax: 25,
        probability: 0.6
    },
    F: {
        name: 'F-Class (Yellow-White)',
        color: '#f8f7ff',
        tempMin: 6000, tempMax: 7500,
        radiusMin: 1.15, radiusMax: 1.4,
        massMin: 1.04, massMax: 1.4,
        luminosityMin: 1.5, luminosityMax: 5,
        probability: 3
    },
    G: {
        name: 'G-Class (Yellow)',
        color: '#fff4ea',
        tempMin: 5200, tempMax: 6000,
        radiusMin: 0.96, radiusMax: 1.15,
        massMin: 0.8, massMax: 1.04,
        luminosityMin: 0.6, luminosityMax: 1.5,
        probability: 7.6
    },
    K: {
        name: 'K-Class (Orange)',
        color: '#ffd2a1',
        tempMin: 3700, tempMax: 5200,
        radiusMin: 0.7, radiusMax: 0.96,
        massMin: 0.45, massMax: 0.8,
        luminosityMin: 0.08, luminosityMax: 0.6,
        probability: 12.1
    },
    M: {
        name: 'M-Class (Red Dwarf)',
        color: '#ffcc6f',
        tempMin: 2400, tempMax: 3700,
        radiusMin: 0.1, radiusMax: 0.7,
        massMin: 0.08, massMax: 0.45,
        luminosityMin: 0.0001, luminosityMax: 0.08,
        probability: 76.45
    }
};

// Select star class based on weighted probability
export function selectStarClass(rng) {
    const classes = Object.keys(STAR_CLASSES);
    const weights = classes.map(c => STAR_CLASSES[c].probability);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let rand = rng.next() * totalWeight;
    for (let i = 0; i < classes.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
            return classes[i];
        }
    }
    return 'G'; // Default fallback (Sun-like)
}
