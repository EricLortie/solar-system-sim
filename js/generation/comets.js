// Comet Generation

import { COMET_TYPES } from '../constants/comets.js';
import { PHYSICS } from '../constants/physics.js';

export function generateComet(rng, star) {
    const perihelion = rng.random(30, 100);
    const aphelion = rng.random(400, 1000);
    const semiMajorAxis = (perihelion + aphelion) / 2;
    const eccentricity = (aphelion - perihelion) / (aphelion + perihelion);

    // Select comet type
    const cometTypeKeys = Object.keys(COMET_TYPES);
    const typeKey = rng.randomChoice(cometTypeKeys);
    const cometType = COMET_TYPES[typeKey];

    // Calculate tail activation radius based on star luminosity and comet volatility
    // More luminous stars activate tails further out, more volatile comets activate further
    // Base: ~2-3 AU for water ice around Sun-like star
    const baseActivationRadius = 2.5 * Math.sqrt(star.luminosity);
    const tailActivationRadius = baseActivationRadius * cometType.volatility * PHYSICS.AU;

    return {
        perihelion: perihelion,
        aphelion: aphelion,
        semiMajorAxis: semiMajorAxis,
        eccentricity: eccentricity,
        angle: rng.random(0, Math.PI * 2),
        orbitalPeriod: rng.random(100, 500),
        inclination: rng.random(-0.3, 0.3),
        size: rng.random(1, 3),
        type: typeKey,
        typeName: cometType.name,
        color: cometType.color,
        tailColor: cometType.tailColor,
        dustColor: cometType.dustColor,
        volatility: cometType.volatility,
        tailBrightness: cometType.tailBrightness,
        tailActivationRadius: tailActivationRadius
    };
}
