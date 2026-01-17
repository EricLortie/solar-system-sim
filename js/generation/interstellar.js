// Interstellar Object Generation
// Generates objects passing through from interstellar space

import { PHYSICS } from '../constants/physics.js';
import { INTERSTELLAR_TYPES, HYPERBOLIC, EVENT_CONFIG } from '../constants/interstellar.js';
import { generateName } from './names.js';

// Generate an interstellar comet
export function generateInterstellarComet(rng, star) {
    const type = INTERSTELLAR_TYPES.interstellarComet;

    // Approach parameters
    const spawnDistance = rng.random(EVENT_CONFIG.spawnDistance.min, EVENT_CONFIG.spawnDistance.max);
    const perihelion = rng.random(EVENT_CONFIG.minPerihelion, EVENT_CONFIG.maxPerihelion);

    // Calculate hyperbolic trajectory
    // For hyperbola: e > 1, a < 0
    // rp = a(e-1), so a = rp/(e-1)
    const velocityFactor = rng.random(type.minVelocity, type.maxVelocity);
    const eccentricity = 1 + velocityFactor * 0.5 + rng.random(0.1, 0.5);

    const semiMajorAxis = -perihelion / (eccentricity - 1);

    // Random approach direction
    const perihelionAngle = rng.random(0, Math.PI * 2);

    // Calculate starting true anomaly (at spawn distance)
    // r = a(e^2-1)/(1+e*cos(theta))
    // Solving for theta: cos(theta) = (a(e^2-1)/r - 1) / e
    const p = Math.abs(semiMajorAxis) * (eccentricity * eccentricity - 1);
    const cosTheta = (p / (spawnDistance * PHYSICS.AU) - 1) / eccentricity;
    const startingAnomaly = -Math.acos(Math.max(-1, Math.min(1, cosTheta))); // Negative = approaching

    // Calculate mean anomaly at start
    const H = 2 * Math.atanh(Math.sqrt((eccentricity - 1) / (eccentricity + 1)) * Math.tan(startingAnomaly / 2));
    const meanAnomaly = eccentricity * Math.sinh(H) - H;

    return {
        id: Date.now() + rng.randomInt(0, 10000),
        type: 'interstellarComet',
        typeName: type.name,
        name: 'I/' + generateName(rng),
        size: rng.random(type.minSize, type.maxSize),
        color: rng.randomChoice(type.colors),
        tailColor: { ...type.tailColor },
        dustColor: { ...type.dustColor },

        // Orbital elements (hyperbolic)
        semiMajorAxis: semiMajorAxis * PHYSICS.AU,
        eccentricity: eccentricity,
        perihelion: perihelion * PHYSICS.AU,
        perihelionAngle: perihelionAngle,
        inclination: rng.random(-0.4, 0.4),

        // State
        meanAnomaly: meanAnomaly,
        trueAnomaly: startingAnomaly,
        meanMotion: HYPERBOLIC.meanMotion(semiMajorAxis, star.mass) * 0.00002, // Time scale factor

        // Tail activation (same as regular comets)
        tailActivationRadius: 3 * Math.sqrt(star.luminosity) * PHYSICS.AU,
        volatility: rng.random(0.8, 1.2),
        tailBrightness: rng.random(0.7, 1.3),

        // Lifecycle
        spawned: true,
        despawned: false
    };
}

// Generate a rogue planet
export function generateRoguePlanet(rng, star) {
    const type = INTERSTELLAR_TYPES.roguePlanet;

    // Select subtype
    const subtypeRoll = rng.next();
    let subtype;
    let cumProb = 0;
    for (const [key, st] of Object.entries(type.types)) {
        cumProb += st.probability;
        if (subtypeRoll < cumProb) {
            subtype = { key, ...st };
            break;
        }
    }
    if (!subtype) subtype = { key: 'frozen', ...type.types.frozen };

    const spawnDistance = rng.random(EVENT_CONFIG.spawnDistance.min, EVENT_CONFIG.spawnDistance.max);
    const perihelion = rng.random(EVENT_CONFIG.minPerihelion * 2, EVENT_CONFIG.maxPerihelion);

    const velocityFactor = rng.random(type.minVelocity, type.maxVelocity);
    const eccentricity = 1 + velocityFactor * 0.3 + rng.random(0.05, 0.3);

    const semiMajorAxis = -perihelion / (eccentricity - 1);
    const perihelionAngle = rng.random(0, Math.PI * 2);

    const p = Math.abs(semiMajorAxis) * (eccentricity * eccentricity - 1);
    const cosTheta = (p / (spawnDistance * PHYSICS.AU) - 1) / eccentricity;
    const startingAnomaly = -Math.acos(Math.max(-1, Math.min(1, cosTheta)));

    const H = 2 * Math.atanh(Math.sqrt((eccentricity - 1) / (eccentricity + 1)) * Math.tan(startingAnomaly / 2));
    const meanAnomaly = eccentricity * Math.sinh(H) - H;

    const size = rng.random(type.minSize, type.maxSize);

    return {
        id: Date.now() + rng.randomInt(0, 10000),
        type: 'roguePlanet',
        typeName: type.name,
        subtype: subtype.key,
        subtypeName: subtype.name,
        name: 'Rogue-' + generateName(rng),
        size: size,
        visualRadius: Math.max(4, Math.sqrt(size) * 3),
        color: rng.randomChoice(subtype.colors),
        mass: size * (subtype.key === 'gasGiant' ? 50 : subtype.key === 'iceGiant' ? 20 : 2),

        // Orbital elements
        semiMajorAxis: semiMajorAxis * PHYSICS.AU,
        eccentricity: eccentricity,
        perihelion: perihelion * PHYSICS.AU,
        perihelionAngle: perihelionAngle,
        inclination: rng.random(-0.3, 0.3),

        // State
        meanAnomaly: meanAnomaly,
        trueAnomaly: startingAnomaly,
        meanMotion: HYPERBOLIC.meanMotion(semiMajorAxis, star.mass) * 0.00002,

        // Visual details
        hasBands: subtype.key === 'gasGiant' || subtype.key === 'iceGiant',
        bandCount: subtype.key === 'gasGiant' ? rng.randomInt(4, 8) : rng.randomInt(2, 4),

        spawned: true,
        despawned: false
    };
}

// Generate a rogue black hole
export function generateRogueBlackHole(rng, star) {
    const type = INTERSTELLAR_TYPES.rogueBlackHole;

    const spawnDistance = rng.random(EVENT_CONFIG.spawnDistance.min, EVENT_CONFIG.spawnDistance.max);
    const perihelion = rng.random(EVENT_CONFIG.minPerihelion * 3, EVENT_CONFIG.maxPerihelion * 2);

    const velocityFactor = rng.random(type.minVelocity, type.maxVelocity);
    const eccentricity = 1 + velocityFactor * 0.2 + rng.random(0.05, 0.2);

    const semiMajorAxis = -perihelion / (eccentricity - 1);
    const perihelionAngle = rng.random(0, Math.PI * 2);

    const p = Math.abs(semiMajorAxis) * (eccentricity * eccentricity - 1);
    const cosTheta = (p / (spawnDistance * PHYSICS.AU) - 1) / eccentricity;
    const startingAnomaly = -Math.acos(Math.max(-1, Math.min(1, cosTheta)));

    const H = 2 * Math.atanh(Math.sqrt((eccentricity - 1) / (eccentricity + 1)) * Math.tan(startingAnomaly / 2));
    const meanAnomaly = eccentricity * Math.sinh(H) - H;

    const mass = rng.random(type.minMass, type.maxMass);

    return {
        id: Date.now() + rng.randomInt(0, 10000),
        type: 'rogueBlackHole',
        typeName: type.name,
        name: 'BH-' + rng.randomInt(1000, 9999),
        mass: mass,
        visualRadius: type.getVisualRadius(mass),

        // Orbital elements
        semiMajorAxis: semiMajorAxis * PHYSICS.AU,
        eccentricity: eccentricity,
        perihelion: perihelion * PHYSICS.AU,
        perihelionAngle: perihelionAngle,
        inclination: rng.random(-0.2, 0.2),

        // State
        meanAnomaly: meanAnomaly,
        trueAnomaly: startingAnomaly,
        meanMotion: HYPERBOLIC.meanMotion(semiMajorAxis, star.mass) * 0.00002,

        // Accretion disk properties
        hasAccretionDisk: rng.next() < 0.3,
        diskColor: rng.randomChoice(['#ff6600', '#ffaa00', '#ff4400']),

        spawned: true,
        despawned: false
    };
}

// Generate a passing star system
export function generatePassingSystem(rng, primaryStar) {
    const type = INTERSTELLAR_TYPES.passingSystem;

    // This system passes at a great distance
    const spawnDistance = rng.random(120, 180);
    const perihelion = rng.random(40, 80); // Passes fairly far out

    const velocityFactor = rng.random(type.minVelocity, type.maxVelocity);
    const eccentricity = 1 + velocityFactor * 0.15 + rng.random(0.02, 0.1);

    const semiMajorAxis = -perihelion / (eccentricity - 1);
    const perihelionAngle = rng.random(0, Math.PI * 2);

    const p = Math.abs(semiMajorAxis) * (eccentricity * eccentricity - 1);
    const cosTheta = (p / (spawnDistance * PHYSICS.AU) - 1) / eccentricity;
    const startingAnomaly = -Math.acos(Math.max(-1, Math.min(1, cosTheta)));

    const H = 2 * Math.atanh(Math.sqrt((eccentricity - 1) / (eccentricity + 1)) * Math.tan(startingAnomaly / 2));
    const meanAnomaly = eccentricity * Math.sinh(H) - H;

    // Generate a simple star for the passing system
    const starClasses = ['M', 'K', 'G', 'F'];
    const starClass = rng.randomChoice(starClasses);
    const starColors = { M: '#ffaa77', K: '#ffcc88', G: '#ffff99', F: '#ffffcc' };
    const starTemps = { M: 3200, K: 4500, G: 5500, F: 6500 };
    const starMasses = { M: 0.4, K: 0.7, G: 1.0, F: 1.3 };
    const starRadii = { M: 0.5, K: 0.8, G: 1.0, F: 1.2 };

    // Generate a few planets for the passing system
    const planetCount = rng.randomInt(1, 5);
    const planets = [];
    let orbitAU = 0.3;

    for (let i = 0; i < planetCount; i++) {
        orbitAU *= rng.random(1.5, 2.5);
        planets.push({
            id: i,
            orbitRadiusLocal: orbitAU * PHYSICS.AU * 0.15, // Scale down for visual
            angle: rng.random(0, Math.PI * 2),
            orbitSpeed: 0.01 / Math.sqrt(orbitAU),
            size: rng.random(2, 6),
            color: rng.randomChoice(['#aa8866', '#6688aa', '#88aa66', '#cc9966', '#667788'])
        });
    }

    return {
        id: Date.now() + rng.randomInt(0, 10000),
        type: 'passingSystem',
        typeName: 'Passing Star System',
        name: generateName(rng) + ' System',

        // The star
        star: {
            name: generateName(rng),
            class: starClass,
            color: starColors[starClass],
            temperature: starTemps[starClass],
            mass: starMasses[starClass],
            radius: starRadii[starClass],
            visualRadius: 8 + starRadii[starClass] * 6
        },

        // Its planets (relative positions)
        planets: planets,

        // Orbital elements for the whole system
        semiMajorAxis: semiMajorAxis * PHYSICS.AU,
        eccentricity: eccentricity,
        perihelion: perihelion * PHYSICS.AU,
        perihelionAngle: perihelionAngle,
        inclination: rng.random(-0.15, 0.15),

        // State
        meanAnomaly: meanAnomaly,
        trueAnomaly: startingAnomaly,
        meanMotion: HYPERBOLIC.meanMotion(semiMajorAxis, primaryStar.mass) * 0.000015,

        spawned: true,
        despawned: false
    };
}

// Get position of an interstellar object
export function getInterstellarPosition(obj, time) {
    // Update mean anomaly
    const M = obj.meanAnomaly + obj.meanMotion * time;

    // Convert to eccentric anomaly (hyperbolic)
    const H = HYPERBOLIC.eccentricAnomalyFromMean(M, obj.eccentricity);

    // Convert to true anomaly
    const theta = HYPERBOLIC.trueAnomalyFromEccentric(H, obj.eccentricity);

    // Get position
    const pos = HYPERBOLIC.getPosition(
        obj.semiMajorAxis / PHYSICS.AU,
        obj.eccentricity,
        theta,
        obj.perihelionAngle
    );

    // Apply inclination (simplified - just affects y)
    const y = pos.y * Math.cos(obj.inclination);

    return {
        x: pos.x * PHYSICS.AU,
        y: y * PHYSICS.AU,
        r: pos.r * PHYSICS.AU,
        angle: pos.angle,
        trueAnomaly: theta,
        distanceAU: pos.r
    };
}
