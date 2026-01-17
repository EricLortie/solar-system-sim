// Configuration settings for the solar system simulator
// Modify these values to customize generation behavior

export const CONFIG = {
    // Planet generation
    minPlanets: 3,
    maxPlanets: 12,
    maxMoons: 8,

    // Feature chances
    asteroidBeltChance: 0.6,
    ringChance: 0.4,
    binaryStarChance: 0.2,

    // Orbit settings
    baseOrbitRadius: 80,
    orbitSpacing: 60,

    // Simulation
    timeScale: 1,
    trailLength: 50,

    // Comets
    cometCount: { min: 1, max: 3 }
};

// Update config from UI inputs
export function updateConfig(key, value) {
    if (key in CONFIG) {
        CONFIG[key] = value;
    }
}
