// Star Generation

import { STAR_CLASSES, selectStarClass } from '../constants/stars.js';
import { PHYSICS } from '../constants/physics.js';
import { generateName } from './names.js';

export function generateStar(rng) {
    const selectedClass = selectStarClass(rng);
    const starClass = STAR_CLASSES[selectedClass];

    const temperature = rng.random(starClass.tempMin, starClass.tempMax);
    const radius = rng.random(starClass.radiusMin, starClass.radiusMax);
    const mass = rng.random(starClass.massMin, starClass.massMax);
    const luminosity = rng.random(starClass.luminosityMin, starClass.luminosityMax);

    const hzInner = Math.sqrt(luminosity / 1.1);
    const hzOuter = Math.sqrt(luminosity / 0.53);

    // Calculate physics-based zones
    const frostLine = PHYSICS.frostLine(luminosity);
    const innerLimit = PHYSICS.innerLimit(mass, radius);

    return {
        class: selectedClass,
        name: generateName(rng) + ' Star',
        fullName: starClass.name,
        color: starClass.color,
        temperature: Math.round(temperature),
        radius: radius,
        mass: mass,
        luminosity: luminosity,
        habitableZoneInner: hzInner,
        habitableZoneOuter: hzOuter,
        frostLine: frostLine,
        innerLimit: innerLimit,
        visualRadius: 20 + radius * 2,
        flares: [],
        nextFlare: rng.random(2000, 8000)
    };
}

export function generateSecondStar(rng, primaryStar) {
    // Secondary star is usually smaller
    const classes = ['K', 'M', 'G', 'F'];
    const selectedClass = rng.randomChoice(classes.filter(c => {
        return STAR_CLASSES[c].massMax < primaryStar.mass;
    })) || 'M';

    const starClass = STAR_CLASSES[selectedClass];

    const temperature = rng.random(starClass.tempMin, starClass.tempMax);
    const radius = rng.random(starClass.radiusMin, starClass.radiusMax);
    const mass = rng.random(starClass.massMin, Math.min(starClass.massMax, primaryStar.mass * 0.8));
    const luminosity = rng.random(starClass.luminosityMin, starClass.luminosityMax);

    return {
        class: selectedClass,
        name: generateName(rng) + ' B',
        fullName: starClass.name,
        color: starClass.color,
        temperature: Math.round(temperature),
        radius: radius,
        mass: mass,
        luminosity: luminosity,
        visualRadius: 20 + radius * 2,
        orbitRadius: rng.random(30, 60),
        orbitalPeriod: rng.random(50, 200),
        angle: rng.random(0, Math.PI * 2)
    };
}
