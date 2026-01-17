// Planet Type Definitions

export const PLANET_TYPES = {
    gasGiant: {
        name: 'Gas Giant',
        colors: ['#e8c48a', '#d4a574', '#c9956c', '#deb887', '#f4a460'],
        radiusMin: 8, radiusMax: 15,
        massMin: 50, massMax: 500,
        atmosphereChance: 1.0,
        atmosphereTypes: ['Hydrogen/Helium', 'Hydrogen/Methane'],
        moonChance: 0.95,
        maxMoons: 12,
        composition: { hydrogen: 0.75, helium: 0.24, other: 0.01 },
        hasRings: true,
        hasBands: true
    },
    iceGiant: {
        name: 'Ice Giant',
        colors: ['#7ec8e3', '#5dade2', '#85c1e9', '#48c9b0', '#73c6b6'],
        radiusMin: 4, radiusMax: 8,
        massMin: 10, massMax: 50,
        atmosphereChance: 1.0,
        atmosphereTypes: ['Hydrogen/Methane', 'Hydrogen/Ammonia'],
        moonChance: 0.85,
        maxMoons: 8,
        composition: { hydrogen: 0.15, helium: 0.15, water: 0.35, ammonia: 0.2, methane: 0.15 },
        hasRings: true,
        hasBands: false
    },
    terrestrial: {
        name: 'Terrestrial',
        colors: ['#5d9b9b', '#6b8e6b', '#7a9a7a', '#4a7c59', '#5f9ea0'],
        radiusMin: 0.8, radiusMax: 2.0,
        massMin: 0.5, massMax: 5,
        atmosphereChance: 0.7,
        atmosphereTypes: ['Nitrogen/Oxygen', 'Nitrogen', 'Carbon Dioxide', 'None'],
        moonChance: 0.4,
        maxMoons: 3,
        composition: { rock: 0.7, metal: 0.25, water: 0.05 },
        hasRings: false,
        hasBands: false
    },
    rocky: {
        name: 'Rocky',
        colors: ['#a0a0a0', '#8b8b8b', '#9b9b9b', '#7a7a7a', '#b0a090'],
        radiusMin: 0.3, radiusMax: 0.9,
        massMin: 0.05, massMax: 0.8,
        atmosphereChance: 0.2,
        atmosphereTypes: ['Thin Carbon Dioxide', 'Trace', 'None'],
        moonChance: 0.2,
        maxMoons: 2,
        composition: { rock: 0.65, metal: 0.35 },
        hasRings: false,
        hasBands: false
    },
    lavaWorld: {
        name: 'Lava World',
        colors: ['#ff6b35', '#ff8c42', '#e55934', '#ff4500', '#dc143c'],
        radiusMin: 0.5, radiusMax: 1.5,
        massMin: 0.3, massMax: 3,
        atmosphereChance: 0.4,
        atmosphereTypes: ['Sulfur Dioxide', 'Carbon Dioxide', 'Vaporized Rock'],
        moonChance: 0.1,
        maxMoons: 1,
        composition: { rock: 0.5, metal: 0.3, volatiles: 0.2 },
        hasRings: false,
        hasBands: false
    },
    iceWorld: {
        name: 'Ice World',
        colors: ['#e0ffff', '#b0e0e6', '#add8e6', '#87ceeb', '#afeeee'],
        radiusMin: 0.4, radiusMax: 2.5,
        massMin: 0.1, massMax: 4,
        atmosphereChance: 0.5,
        atmosphereTypes: ['Nitrogen', 'Methane', 'None'],
        moonChance: 0.3,
        maxMoons: 2,
        composition: { ice: 0.6, rock: 0.35, metal: 0.05 },
        hasRings: false,
        hasBands: false
    },
    oceanWorld: {
        name: 'Ocean World',
        colors: ['#1e90ff', '#4169e1', '#0077be', '#006994', '#0099cc'],
        radiusMin: 0.8, radiusMax: 2.5,
        massMin: 0.5, massMax: 6,
        atmosphereChance: 0.9,
        atmosphereTypes: ['Nitrogen/Oxygen', 'Nitrogen/Water Vapor', 'Carbon Dioxide'],
        moonChance: 0.5,
        maxMoons: 3,
        composition: { water: 0.7, rock: 0.25, metal: 0.05 },
        hasRings: false,
        hasBands: false
    },
    dwarf: {
        name: 'Dwarf Planet',
        colors: ['#c0c0c0', '#a9a9a9', '#d3d3d3', '#8b8989', '#cdc5bf'],
        radiusMin: 0.1, radiusMax: 0.4,
        massMin: 0.001, massMax: 0.05,
        atmosphereChance: 0.05,
        atmosphereTypes: ['Trace Nitrogen', 'None'],
        moonChance: 0.15,
        maxMoons: 1,
        composition: { ice: 0.5, rock: 0.45, metal: 0.05 },
        hasRings: false,
        hasBands: false
    }
};

// Get appropriate planet type based on distance from star
export function getPlanetTypeForDistance(distanceAU, star, archetype, archetypes, rng) {
    const frostLine = star.frostLine;
    const hzInner = star.habitableZoneInner;
    const hzOuter = star.habitableZoneOuter;
    const arch = archetypes[archetype];

    // Hot Jupiter archetype - first planet is always a gas giant
    if (arch.features.hasHotJupiter && distanceAU < 0.1) {
        return 'gasGiant';
    }

    // Super-Earth archetype - no gas giants, larger rocky/terrestrial
    if (archetype === 'superEarth') {
        if (distanceAU < hzInner * 0.5) {
            return rng.randomChoice(['lavaWorld', 'rocky']);
        }
        return rng.randomChoice(['terrestrial', 'terrestrial', 'oceanWorld', 'rocky', 'iceWorld']);
    }

    // Compact archetype - small planets only
    if (archetype === 'compact') {
        if (distanceAU < hzInner * 0.3) {
            return rng.randomChoice(['lavaWorld', 'rocky']);
        }
        return rng.randomChoice(['rocky', 'terrestrial', 'iceWorld', 'dwarf']);
    }

    // Physics-based type selection for other archetypes
    // Inside frost line: rocky/terrestrial planets (volatiles blown away)
    if (distanceAU < frostLine * 0.5) {
        if (distanceAU < star.innerLimit * 3) {
            return 'lavaWorld'; // Very close to star
        }
        if (distanceAU < hzInner) {
            return rng.randomChoice(['rocky', 'rocky', 'lavaWorld']);
        }
        if (distanceAU <= hzOuter) {
            return rng.randomChoice(['terrestrial', 'terrestrial', 'oceanWorld', 'rocky']);
        }
        return rng.randomChoice(['rocky', 'iceWorld', 'terrestrial']);
    }

    // Near frost line: transition zone
    if (distanceAU < frostLine * 1.5) {
        return rng.randomChoice(['iceWorld', 'iceWorld', 'terrestrial', 'gasGiant']);
    }

    // Beyond frost line: gas/ice giants can form (more material available)
    if (distanceAU < frostLine * 4) {
        if (arch.features.outerGiantZone) {
            return rng.randomChoice(['gasGiant', 'gasGiant', 'iceGiant', 'iceWorld']);
        }
        return rng.randomChoice(['iceWorld', 'iceWorld', 'dwarf']);
    }

    // Far outer system
    if (distanceAU < frostLine * 8) {
        if (arch.features.outerGiantZone) {
            return rng.randomChoice(['iceGiant', 'iceGiant', 'gasGiant', 'iceWorld']);
        }
        return rng.randomChoice(['iceWorld', 'dwarf', 'dwarf']);
    }

    // Very far outer system
    return rng.randomChoice(['dwarf', 'dwarf', 'iceWorld']);
}
