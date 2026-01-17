// Solar System Generation - Main Orchestrator

import { CONFIG } from '../config.js';
import { PHYSICS } from '../constants/physics.js';
import { SYSTEM_ARCHETYPES, selectArchetype } from '../constants/archetypes.js';
import { generateStar, generateSecondStar } from './stars.js';
import { generatePlanet } from './planets.js';
import { generateComet } from './comets.js';
import { generateAsteroidBelt, generateKuiperBelt } from './belts.js';

export function generateSolarSystem(rng) {
    const star = generateStar(rng);
    const planets = [];

    // Select system archetype based on probabilities
    const selectedArchetype = selectArchetype(rng);
    const archetype = SYSTEM_ARCHETYPES[selectedArchetype];

    // Check for binary star
    let secondaryStar = null;
    if (rng.next() < CONFIG.binaryStarChance) {
        secondaryStar = generateSecondStar(rng, star);
    }

    // Determine planet count based on archetype
    const planetCount = rng.randomInt(archetype.planetCount.min, archetype.planetCount.max);

    // Starting orbit in AU
    let currentOrbitAU = star.innerLimit * 2;

    // If binary, start planets further out (beyond binary orbit)
    if (secondaryStar) {
        currentOrbitAU = Math.max(currentOrbitAU, secondaryStar.orbitRadius / PHYSICS.AU + 0.5);
    }

    // Hot Jupiter archetype: place gas giant very close first
    let hotJupiterIndex = -1;
    if (archetype.features.hasHotJupiter && planetCount > 0) {
        const hotJupiterOrbit = rng.random(0.03, 0.08); // Very close orbit (< 0.1 AU)
        const hotJupiter = generatePlanet(rng, 0, hotJupiterOrbit, star, selectedArchetype, 'gasGiant');
        planets.push(hotJupiter);
        hotJupiterIndex = 0;
        // Next planets start beyond the hot Jupiter's Hill sphere influence
        currentOrbitAU = hotJupiterOrbit + hotJupiter.hillSphere * 15;
    }

    // Generate remaining planets using Hill sphere spacing
    for (let i = (hotJupiterIndex >= 0 ? 1 : 0); i < planetCount; i++) {
        // Spacing based on position relative to frost line
        let spacingFactor;
        if (currentOrbitAU < star.frostLine * 0.5) {
            // Inner system: tighter spacing (Titius-Bode-like)
            spacingFactor = rng.random(1.4, 1.8);
        } else if (currentOrbitAU < star.frostLine * 2) {
            // Frost line region: moderate spacing
            spacingFactor = rng.random(1.6, 2.2);
        } else {
            // Outer system: wider spacing
            spacingFactor = rng.random(1.8, 2.5);
        }

        // Compact systems have tighter spacing
        if (selectedArchetype === 'compact') {
            spacingFactor = rng.random(1.2, 1.5);
        }

        // Sparse systems have wider spacing
        if (selectedArchetype === 'sparse') {
            spacingFactor = rng.random(2.5, 4.0);
        }

        currentOrbitAU *= spacingFactor;

        // Generate the planet
        const planet = generatePlanet(rng, i, currentOrbitAU, star, selectedArchetype);

        // Ensure minimum separation based on Hill spheres
        if (planets.length > 0) {
            const prevPlanet = planets[planets.length - 1];
            const minSeparation = PHYSICS.minPlanetSeparation(
                prevPlanet.orbitRadiusAU, prevPlanet.mass,
                currentOrbitAU, planet.mass,
                star.mass
            );
            const actualSeparation = currentOrbitAU - prevPlanet.orbitRadiusAU;

            // If too close, push orbit outward
            if (actualSeparation < minSeparation) {
                currentOrbitAU = prevPlanet.orbitRadiusAU + minSeparation * 1.2;
                planet.orbitRadiusAU = currentOrbitAU;
                planet.orbitRadius = currentOrbitAU * PHYSICS.AU;
                planet.orbitalPeriod = PHYSICS.orbitalPeriod(currentOrbitAU, star.mass);
                planet.orbitalVelocity = PHYSICS.orbitalVelocity(currentOrbitAU, star.mass);
                planet.hillSphere = PHYSICS.hillSphere(currentOrbitAU, planet.mass, star.mass);
            }
        }

        planets.push(planet);
    }

    // Generate asteroid belt in a resonance gap (if archetype allows)
    let asteroidBelt = null;
    if (archetype.features.asteroidBelt && planets.length >= 3) {
        asteroidBelt = generateAsteroidBelt(rng, star, planets);
    }

    // Generate Kuiper belt (if archetype allows)
    let kuiperBelt = null;
    if (archetype.features.kuiperBelt && planets.length > 0) {
        const lastPlanetOrbitAU = planets[planets.length - 1].orbitRadiusAU;
        kuiperBelt = generateKuiperBelt(rng, star, lastPlanetOrbitAU);
    }

    // Generate comets
    const comets = [];
    const cometCount = rng.randomInt(CONFIG.cometCount.min, CONFIG.cometCount.max);
    for (let i = 0; i < cometCount; i++) {
        comets.push(generateComet(rng, star));
    }

    return {
        star,
        secondaryStar,
        planets,
        asteroidBelt,
        kuiperBelt,
        comets,
        archetype: selectedArchetype,
        archetypeName: archetype.name
    };
}
