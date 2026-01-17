// Planet Generation

import { PLANET_TYPES, getPlanetTypeForDistance } from '../constants/planets.js';
import { SYSTEM_ARCHETYPES } from '../constants/archetypes.js';
import { PHYSICS } from '../constants/physics.js';
import { CONFIG } from '../config.js';
import { generateName } from './names.js';
import { generateMoon } from './moons.js';

export function generatePlanet(rng, index, orbitRadiusAU, star, archetype, forceType = null) {
    const typeKey = forceType || getPlanetTypeForDistance(orbitRadiusAU, star, archetype, SYSTEM_ARCHETYPES, rng);
    const type = PLANET_TYPES[typeKey];

    // Generate mass first (needed for physics calculations)
    const mass = rng.random(type.massMin, type.massMax);
    const radius = rng.random(type.radiusMin, type.radiusMax);

    // Physics-based orbital calculations
    const orbitalPeriod = PHYSICS.orbitalPeriod(orbitRadiusAU, star.mass);
    const orbitalVelocity = PHYSICS.orbitalVelocity(orbitRadiusAU, star.mass);
    const hillSphereAU = PHYSICS.hillSphere(orbitRadiusAU, mass, star.mass);

    // Eccentricity based on system type and position
    // Inner planets tend to be more circular, outer can be more eccentric
    let maxEccentricity = 0.1;
    if (orbitRadiusAU > star.frostLine) maxEccentricity = 0.2;
    if (orbitRadiusAU > star.frostLine * 5) maxEccentricity = 0.3;
    const eccentricity = rng.random(0, maxEccentricity);

    const planet = {
        id: index,
        name: generateName(rng),
        type: typeKey,
        typeName: type.name,
        color: rng.randomChoice(type.colors),
        radius: radius,
        mass: mass,
        orbitRadius: orbitRadiusAU * PHYSICS.AU, // Convert to display units
        orbitRadiusAU: orbitRadiusAU,
        eccentricity: eccentricity,
        orbitalPeriod: orbitalPeriod,
        orbitalVelocity: orbitalVelocity,
        hillSphere: hillSphereAU,
        angle: rng.random(0, Math.PI * 2),
        rotationSpeed: rng.random(0.001, 0.01),
        atmosphere: rng.next() < type.atmosphereChance ? rng.randomChoice(type.atmosphereTypes) : 'None',
        composition: { ...type.composition },
        moons: [],
        hasRings: type.hasRings && rng.next() < CONFIG.ringChance,
        hasBands: type.hasBands || false,
        ringColor: `rgba(${rng.randomInt(150, 200)}, ${rng.randomInt(150, 180)}, ${rng.randomInt(130, 160)}, 0.5)`,
        trail: [],
        selected: false
    };

    planet.visualRadius = Math.max(4, Math.min(25, 4 + Math.log(planet.radius + 1) * 8));

    // Temperature calculation using Stefan-Boltzmann approximation
    // T_planet = T_star * sqrt(R_star / (2 * distance)) * (1 - albedo)^0.25
    const albedo = typeKey === 'iceWorld' ? 0.6 : (typeKey === 'gasGiant' ? 0.5 : 0.3);
    planet.temperature = Math.round(star.temperature * Math.sqrt(star.radius / (2 * orbitRadiusAU * 215)) * Math.pow(1 - albedo, 0.25));
    planet.inHabitableZone = orbitRadiusAU >= star.habitableZoneInner && orbitRadiusAU <= star.habitableZoneOuter;
    planet.beyondFrostLine = orbitRadiusAU > star.frostLine;

    // Generate surface details
    generatePlanetSurface(rng, planet, type);

    // Generate moons (more moons for larger planets beyond frost line)
    const moonChanceMultiplier = planet.beyondFrostLine ? 1.5 : 1.0;
    if (rng.next() < type.moonChance * moonChanceMultiplier) {
        const maxMoons = Math.min(type.maxMoons, CONFIG.maxMoons);
        const moonCount = rng.randomInt(1, maxMoons);
        for (let m = 0; m < moonCount; m++) {
            planet.moons.push(generateMoon(rng, planet, m, star));
        }
    }

    // Generate trojan asteroids for larger planets (physics: need significant mass)
    planet.trojans = [];
    if ((typeKey === 'gasGiant' || typeKey === 'iceGiant') && mass > 30 && rng.next() < 0.6) {
        // Trojans exist at L4 and L5 Lagrange points (60 degrees ahead/behind)
        const trojanCount = rng.randomInt(15, 40);
        for (let t = 0; t < trojanCount; t++) {
            planet.trojans.push({
                lagrangePoint: rng.next() < 0.5 ? 4 : 5,
                offsetAngle: rng.random(-0.12, 0.12), // Spread around L4/L5
                offsetRadius: rng.random(-10, 10),
                size: rng.random(0.5, 1.5),
                color: rng.randomChoice(['#666', '#777', '#888'])
            });
        }
    }

    return planet;
}

function generatePlanetSurface(rng, planet, type) {
    planet.surfaceDetails = {
        hasIceCaps: false,
        iceCapsSize: 0,
        hasStorm: false,
        stormAngle: 0,
        stormSize: 0,
        craterCount: 0,
        craters: [],
        bandCount: 0,
        cloudCoverage: 0
    };

    // Ice caps for terrestrial/rocky planets far enough from star
    if (['terrestrial', 'rocky', 'iceWorld'].includes(planet.type) && planet.temperature < 300) {
        planet.surfaceDetails.hasIceCaps = rng.next() < 0.6;
        planet.surfaceDetails.iceCapsSize = rng.random(0.1, 0.3);
    }

    // Great storm for gas giants
    if (planet.type === 'gasGiant' && rng.next() < 0.4) {
        planet.surfaceDetails.hasStorm = true;
        planet.surfaceDetails.stormAngle = rng.random(0, Math.PI * 2);
        planet.surfaceDetails.stormSize = rng.random(0.15, 0.35);
    }

    // Craters for rocky bodies
    if (['rocky', 'dwarf'].includes(planet.type)) {
        planet.surfaceDetails.craterCount = rng.randomInt(3, 8);
        for (let i = 0; i < planet.surfaceDetails.craterCount; i++) {
            planet.surfaceDetails.craters.push({
                angle: rng.random(0, Math.PI * 2),
                distance: rng.random(0.2, 0.7),
                size: rng.random(0.05, 0.15)
            });
        }
    }

    // Bands for gas/ice giants
    if (type.hasBands || planet.type === 'gasGiant') {
        planet.surfaceDetails.bandCount = rng.randomInt(4, 12);
    }

    // Cloud coverage
    if (['terrestrial', 'oceanWorld'].includes(planet.type) && planet.atmosphere !== 'None') {
        planet.surfaceDetails.cloudCoverage = rng.random(0.1, 0.5);
    }
}
