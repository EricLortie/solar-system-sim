// Moon Generation

import { MOON_TYPES } from '../constants/moons.js';
import { generateMoonName } from './names.js';

export function generateMoon(rng, planet, index, star) {
    const moonTypeKeys = Object.keys(MOON_TYPES);
    let typeKey;

    // Moon type based on planet type and position
    if (planet.type === 'iceGiant' || planet.type === 'iceWorld') {
        typeKey = rng.next() < 0.7 ? 'icy' : rng.randomChoice(moonTypeKeys);
    } else if (planet.type === 'lavaWorld') {
        typeKey = rng.next() < 0.5 ? 'volcanic' : 'rocky';
    } else if (planet.beyondFrostLine) {
        // Beyond frost line, more icy moons
        typeKey = rng.next() < 0.5 ? 'icy' : rng.randomChoice(moonTypeKeys);
    } else {
        typeKey = rng.randomChoice(moonTypeKeys);
    }

    const type = MOON_TYPES[typeKey];

    // Moon mass in Earth masses (very small)
    const moonMass = rng.random(0.0001, 0.01); // Roughly Moon to Ganymede range

    // Moon orbit radius based on planet Hill sphere
    // Moons typically orbit within ~0.5 Hill radii
    const maxMoonOrbitAU = planet.hillSphere * 0.4;
    const minMoonOrbitAU = planet.hillSphere * 0.02;

    // Spacing based on index
    const moonOrbitAU = minMoonOrbitAU + (maxMoonOrbitAU - minMoonOrbitAU) * ((index + 1) / 8);

    // Display orbit radius (scaled for visibility)
    const baseOrbitRadius = planet.visualRadius + 15 + index * 12;

    // Orbital period around planet using simplified Kepler
    // T = 2*pi * sqrt(a^3 / (G*M_planet))
    // Normalize so inner moons orbit faster
    const planetMassSolar = planet.mass / 333000;
    const moonOrbitalPeriod = Math.sqrt(Math.pow(moonOrbitAU, 3) / planetMassSolar) * 10; // Scale factor for visibility

    return {
        id: index,
        name: generateMoonName(planet.name, index),
        type: typeKey,
        typeName: type.name,
        color: rng.randomChoice(type.colors),
        mass: moonMass,
        radius: rng.random(0.1, 0.4),
        visualRadius: rng.random(2, 5),
        orbitRadius: baseOrbitRadius,
        orbitRadiusAU: moonOrbitAU,
        orbitalPeriod: Math.max(5, moonOrbitalPeriod), // Minimum for visual stability
        angle: rng.random(0, Math.PI * 2),
        eccentricity: rng.random(0, 0.1)
    };
}
