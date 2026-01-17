// System Archetypes - Different patterns of planetary system formation

export const SYSTEM_ARCHETYPES = {
    solarLike: {
        name: 'Solar System Type',
        description: 'Rocky inner planets, gas giants beyond frost line',
        probability: 0.35,
        planetCount: { min: 4, max: 10 },
        features: {
            hasHotJupiter: false,
            innerRockyZone: true,
            outerGiantZone: true,
            asteroidBelt: true,
            kuiperBelt: true
        }
    },
    hotJupiter: {
        name: 'Hot Jupiter System',
        description: 'Gas giant very close to star, few other planets',
        probability: 0.15,
        planetCount: { min: 1, max: 4 },
        features: {
            hasHotJupiter: true,
            innerRockyZone: false,
            outerGiantZone: false,
            asteroidBelt: false,
            kuiperBelt: true
        }
    },
    superEarth: {
        name: 'Super-Earth System',
        description: 'Multiple large rocky planets, tightly packed',
        probability: 0.25,
        planetCount: { min: 3, max: 7 },
        features: {
            hasHotJupiter: false,
            innerRockyZone: true,
            outerGiantZone: false,
            asteroidBelt: false,
            kuiperBelt: true
        }
    },
    compact: {
        name: 'Compact Multi-Planet',
        description: 'Many small planets in tight orbits (like TRAPPIST-1)',
        probability: 0.15,
        planetCount: { min: 5, max: 8 },
        features: {
            hasHotJupiter: false,
            innerRockyZone: true,
            outerGiantZone: false,
            asteroidBelt: false,
            kuiperBelt: false
        }
    },
    sparse: {
        name: 'Sparse System',
        description: 'Few widely-spaced planets',
        probability: 0.10,
        planetCount: { min: 2, max: 4 },
        features: {
            hasHotJupiter: false,
            innerRockyZone: true,
            outerGiantZone: true,
            asteroidBelt: true,
            kuiperBelt: true
        }
    }
};

// Select archetype based on weighted probability
export function selectArchetype(rng) {
    const archetypeKeys = Object.keys(SYSTEM_ARCHETYPES);
    const weights = archetypeKeys.map(k => SYSTEM_ARCHETYPES[k].probability);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let rand = rng.next() * totalWeight;
    for (let i = 0; i < archetypeKeys.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
            return archetypeKeys[i];
        }
    }
    return 'solarLike'; // Default fallback
}
