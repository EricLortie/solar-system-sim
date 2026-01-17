// Interstellar Object Types and Constants
// These are objects that pass through from outside the solar system

import { PHYSICS } from './physics.js';

// Interstellar object categories
export const INTERSTELLAR_TYPES = {
    // Interstellar comets like 'Oumuamua or Borisov
    interstellarComet: {
        name: 'Interstellar Comet',
        description: 'An icy body from another star system',
        minSize: 0.5,
        maxSize: 4,
        colors: ['#aaddff', '#cceeFF', '#88bbdd'],
        hasTail: true,
        tailColor: { r: 150, g: 200, b: 255 },
        dustColor: { r: 200, g: 180, b: 150 },
        probability: 0.5,  // Most common interstellar visitor
        minVelocity: 1.2,  // Relative to solar system escape velocity
        maxVelocity: 3.0
    },

    // Rogue planets ejected from other systems
    roguePlanet: {
        name: 'Rogue Planet',
        description: 'A planet wandering between stars',
        minSize: 4,
        maxSize: 25,
        types: {
            frozen: {
                name: 'Frozen World',
                colors: ['#667788', '#556677', '#778899'],
                probability: 0.4
            },
            gasGiant: {
                name: 'Gas Giant',
                colors: ['#cc9966', '#aa7755', '#ddaa77', '#8877aa'],
                probability: 0.35
            },
            iceGiant: {
                name: 'Ice Giant',
                colors: ['#6699bb', '#5588aa', '#77aacc'],
                probability: 0.25
            }
        },
        hasTail: false,
        probability: 0.3,
        minVelocity: 0.8,
        maxVelocity: 2.0
    },

    // Rogue black holes - stellar mass
    rogueBlackHole: {
        name: 'Rogue Black Hole',
        description: 'A stellar-mass black hole drifting through space',
        minMass: 3,    // Solar masses
        maxMass: 50,
        probability: 0.05,  // Very rare
        minVelocity: 0.5,
        maxVelocity: 1.5,
        // Schwarzschild radius = 2GM/c^2, scaled for visualization
        getVisualRadius: (mass) => Math.max(3, mass * 0.8)
    },

    // Passing star system (very rare event)
    passingSystem: {
        name: 'Passing Star System',
        description: 'Another star system passing through our neighborhood',
        probability: 0.15,
        minVelocity: 0.3,
        maxVelocity: 1.0,
        // System generation is handled separately
    }
};

// Hyperbolic trajectory physics
export const HYPERBOLIC = {
    // Calculate hyperbolic trajectory parameters
    // For objects on unbound trajectories (eccentricity > 1)

    // Perihelion distance for a hyperbolic orbit
    // rp = a(e-1) where a is semi-major axis (negative for hyperbola)
    perihelion(semiMajorAxis, eccentricity) {
        return Math.abs(semiMajorAxis) * (eccentricity - 1);
    },

    // Velocity at infinity (hyperbolic excess velocity)
    // v_inf = sqrt(-GM/a) = sqrt(mu/|a|)
    velocityAtInfinity(semiMajorAxis, starMass) {
        return Math.sqrt(starMass / Math.abs(semiMajorAxis));
    },

    // True anomaly limits for hyperbola
    // cos(theta_inf) = -1/e
    asymptoteAngle(eccentricity) {
        return Math.acos(-1 / eccentricity);
    },

    // Position on hyperbolic trajectory
    // r = a(1-e^2)/(1+e*cos(theta))
    getPosition(semiMajorAxis, eccentricity, trueAnomaly, perihelionAngle) {
        const a = Math.abs(semiMajorAxis);
        const r = a * (eccentricity * eccentricity - 1) / (1 + eccentricity * Math.cos(trueAnomaly));

        const angle = trueAnomaly + perihelionAngle;
        return {
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            r: r,
            angle: angle
        };
    },

    // Mean motion for hyperbolic orbit (used for time progression)
    // n = sqrt(mu/|a|^3)
    meanMotion(semiMajorAxis, starMass) {
        const a = Math.abs(semiMajorAxis);
        return Math.sqrt(starMass / (a * a * a));
    },

    // Convert mean anomaly to eccentric anomaly (hyperbolic)
    // M = e*sinh(H) - H
    // Solved iteratively
    eccentricAnomalyFromMean(meanAnomaly, eccentricity, iterations = 10) {
        let H = meanAnomaly; // Initial guess
        for (let i = 0; i < iterations; i++) {
            const f = eccentricity * Math.sinh(H) - H - meanAnomaly;
            const fp = eccentricity * Math.cosh(H) - 1;
            H = H - f / fp;
        }
        return H;
    },

    // Convert eccentric anomaly to true anomaly (hyperbolic)
    // tan(theta/2) = sqrt((e+1)/(e-1)) * tanh(H/2)
    trueAnomalyFromEccentric(eccentricAnomaly, eccentricity) {
        const tanHalfTheta = Math.sqrt((eccentricity + 1) / (eccentricity - 1)) *
                             Math.tanh(eccentricAnomaly / 2);
        return 2 * Math.atan(tanHalfTheta);
    }
};

// Event timing configuration
export const EVENT_CONFIG = {
    // Base check interval (simulation time units)
    checkInterval: 500,

    // Base probability per check (adjusted by time scale)
    baseProbability: 0.002,

    // Maximum active interstellar objects at once
    maxActiveObjects: 5,

    // Maximum passing systems at once
    maxPassingSystems: 1,

    // Distance at which objects spawn (AU)
    spawnDistance: { min: 80, max: 150 },

    // Distance at which objects are removed (AU)
    despawnDistance: 200,

    // Minimum perihelion distance (AU) - objects pass through inner system
    minPerihelion: 0.5,
    maxPerihelion: 30
};
