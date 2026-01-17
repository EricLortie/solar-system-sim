// Solar System Generation - Main Orchestrator

import { CONFIG } from '../config.js';
import { PHYSICS } from '../constants/physics.js';
import { SYSTEM_ARCHETYPES, selectArchetype } from '../constants/archetypes.js';
import { PLANET_TYPES } from '../constants/planets.js';
import { getPresetForSeed } from '../constants/presets.js';
import { generateStar, generateSecondStar } from './stars.js';
import { generatePlanet } from './planets.js';
import { generateComet } from './comets.js';
import { generateAsteroidBelt, generateKuiperBelt } from './belts.js';

// Generate a solar system from a preset definition
export function generateFromPreset(preset, rng) {
    const starData = preset.star;

    // Build the star object (matching generateStar output format)
    const star = {
        name: starData.name,
        class: starData.class,
        fullName: starData.fullName,
        temperature: starData.temperature,
        mass: starData.mass,
        radius: starData.radius,
        luminosity: starData.luminosity,
        color: starData.color,
        frostLine: starData.frostLine,
        habitableZoneInner: starData.habitableZoneInner,
        habitableZoneOuter: starData.habitableZoneOuter,
        innerLimit: starData.innerLimit,
        visualRadius: 30 + starData.radius * 3,  // Match generateStar formula
        coronaSize: 1.3 + Math.log(starData.luminosity + 1) * 0.1,
        flareChance: starData.class === 'M' ? 0.3 : 0.1,
        flares: [],  // Required for renderer
        nextFlare: rng.random(2000, 8000)  // Required for renderer
    };

    // Build planets from preset data
    const planets = preset.planets.map((pData, index) => {
        const type = PLANET_TYPES[pData.type];
        const orbitalPeriod = PHYSICS.orbitalPeriod(pData.orbitRadiusAU, star.mass);
        const orbitalVelocity = PHYSICS.orbitalVelocity(pData.orbitRadiusAU, star.mass);
        const hillSphereAU = PHYSICS.hillSphere(pData.orbitRadiusAU, pData.mass, star.mass);

        // Temperature calculation
        const albedo = pData.type === 'iceWorld' ? 0.6 : (pData.type === 'gasGiant' ? 0.5 : 0.3);
        const temperature = Math.round(star.temperature * Math.sqrt(star.radius / (2 * pData.orbitRadiusAU * 215)) * Math.pow(1 - albedo, 0.25));

        const planet = {
            id: index,
            name: pData.name,
            type: pData.type,
            typeName: type.name,
            color: pData.color,
            radius: pData.radius,
            mass: pData.mass,
            orbitRadius: pData.orbitRadiusAU * PHYSICS.AU,
            orbitRadiusAU: pData.orbitRadiusAU,
            eccentricity: pData.eccentricity,
            orbitalPeriod: orbitalPeriod,
            orbitalVelocity: orbitalVelocity,
            hillSphere: hillSphereAU,
            angle: rng.random(0, Math.PI * 2),
            rotationSpeed: rng.random(0.001, 0.01),
            atmosphere: pData.atmosphere,
            composition: pData.composition,
            moons: [],
            hasRings: pData.hasRings,
            prominentRings: pData.prominentRings || false,
            hasBands: pData.hasBands || false,
            ringColor: `rgba(${rng.randomInt(150, 200)}, ${rng.randomInt(150, 180)}, ${rng.randomInt(130, 160)}, 0.5)`,
            trail: [],
            selected: false,
            visualRadius: Math.max(4, Math.min(25, 4 + Math.log(pData.radius + 1) * 8)),
            temperature: temperature,
            inHabitableZone: pData.orbitRadiusAU >= star.habitableZoneInner && pData.orbitRadiusAU <= star.habitableZoneOuter,
            beyondFrostLine: pData.orbitRadiusAU > star.frostLine,
            trojans: []
        };

        // Generate surface details
        planet.surfaceDetails = {
            hasIceCaps: ['terrestrial', 'rocky', 'iceWorld'].includes(pData.type) && temperature < 300,
            iceCapsSize: rng.random(0.1, 0.3),
            hasStorm: pData.hasStorm || false,
            stormAngle: rng.random(0, Math.PI * 2),
            stormSize: pData.stormSize || 0.2,
            craterCount: ['rocky', 'dwarf'].includes(pData.type) ? rng.randomInt(3, 8) : 0,
            craters: [],
            bandCount: pData.hasBands ? rng.randomInt(4, 12) : 0,
            cloudCoverage: ['terrestrial', 'oceanWorld'].includes(pData.type) ? rng.random(0.1, 0.5) : 0
        };

        // Generate craters for rocky planets
        for (let i = 0; i < planet.surfaceDetails.craterCount; i++) {
            planet.surfaceDetails.craters.push({
                angle: rng.random(0, Math.PI * 2),
                distance: rng.random(0.2, 0.7),
                size: rng.random(0.05, 0.15)
            });
        }

        // Build moons from preset data
        if (pData.moons && pData.moons.length > 0) {
            planet.moons = pData.moons.map((mData, mIndex) => ({
                id: mIndex,
                name: mData.name,
                type: mData.type,
                typeName: mData.type.charAt(0).toUpperCase() + mData.type.slice(1) + ' Moon',
                color: mData.color,
                size: mData.size,
                orbitRadius: mData.orbitRadius,
                angle: rng.random(0, Math.PI * 2),
                orbitSpeed: 0.02 / Math.sqrt(mData.orbitRadius / 30)
            }));
        }

        // Add trojans for gas giants
        if ((pData.type === 'gasGiant' || pData.type === 'iceGiant') && pData.mass > 30) {
            const trojanCount = rng.randomInt(15, 40);
            for (let t = 0; t < trojanCount; t++) {
                planet.trojans.push({
                    lagrangePoint: rng.next() < 0.5 ? 4 : 5,
                    offsetAngle: rng.random(-0.12, 0.12),
                    offsetRadius: rng.random(-10, 10),
                    size: rng.random(0.5, 1.5),
                    color: rng.randomChoice(['#666', '#777', '#888'])
                });
            }
        }

        return planet;
    });

    // Build asteroid belt if defined
    let asteroidBelt = null;
    if (preset.asteroidBelt) {
        asteroidBelt = {
            innerRadius: preset.asteroidBelt.innerRadius * PHYSICS.AU,
            outerRadius: preset.asteroidBelt.outerRadius * PHYSICS.AU,
            asteroids: []
        };

        const count = preset.asteroidBelt.count || 200;
        for (let i = 0; i < count; i++) {
            const radiusAU = preset.asteroidBelt.innerRadius +
                rng.next() * (preset.asteroidBelt.outerRadius - preset.asteroidBelt.innerRadius);
            asteroidBelt.asteroids.push({
                orbitRadius: radiusAU * PHYSICS.AU,
                angle: rng.random(0, Math.PI * 2),
                size: rng.random(0.5, 2),
                color: rng.randomChoice(['#888', '#999', '#777', '#aaa']),
                orbitSpeed: 0.001 / Math.sqrt(radiusAU)
            });
        }
    }

    // Build Kuiper belt if defined
    let kuiperBelt = null;
    if (preset.kuiperBelt) {
        kuiperBelt = {
            innerRadius: preset.kuiperBelt.innerRadius * PHYSICS.AU,
            outerRadius: preset.kuiperBelt.outerRadius * PHYSICS.AU,
            objects: []
        };

        const count = preset.kuiperBelt.count || 150;
        for (let i = 0; i < count; i++) {
            const radiusAU = preset.kuiperBelt.innerRadius +
                rng.next() * (preset.kuiperBelt.outerRadius - preset.kuiperBelt.innerRadius);
            kuiperBelt.objects.push({
                orbitRadius: radiusAU * PHYSICS.AU,
                angle: rng.random(0, Math.PI * 2),
                size: rng.random(0.5, 2.5),
                color: rng.randomChoice(['#aaa', '#bbb', '#999', '#ccc']),
                orbitSpeed: 0.0005 / Math.sqrt(radiusAU)
            });
        }
    }

    // Build comets
    const comets = [];
    if (preset.comets && preset.comets.length > 0) {
        for (const cData of preset.comets) {
            comets.push({
                name: cData.name,
                perihelion: cData.perihelion,
                aphelion: cData.aphelion,
                semiMajorAxis: (cData.perihelion + cData.aphelion) / 2,
                eccentricity: cData.eccentricity,
                angle: rng.random(0, Math.PI * 2),
                orbitAngle: rng.random(0, Math.PI * 2),
                tailActive: false,
                tailLength: 0,
                color: '#88ccff'
            });
        }
    }

    return {
        star,
        secondaryStar: null,
        planets,
        asteroidBelt,
        kuiperBelt,
        comets,
        archetype: 'preset',
        archetypeName: preset.name,
        isPreset: true
    };
}

export function generateSolarSystem(rng, seed = null) {
    // Check if seed matches a preset
    const preset = getPresetForSeed(seed);
    if (preset) {
        return generateFromPreset(preset, rng);
    }
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
