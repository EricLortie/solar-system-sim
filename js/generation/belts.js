// Asteroid Belt and Kuiper Belt Generation

import { PHYSICS } from '../constants/physics.js';

// Physics-based asteroid belt generation
// Finds a gap between planets where asteroids can stably orbit
export function generateAsteroidBelt(rng, star, planets) {
    if (planets.length < 2) return null;

    // Find the best gap for an asteroid belt (between rocky and giant planets)
    let bestGapInner = null;
    let bestGapOuter = null;
    let bestGapScore = 0;

    for (let i = 0; i < planets.length - 1; i++) {
        const innerPlanet = planets[i];
        const outerPlanet = planets[i + 1];

        const gapInnerAU = innerPlanet.orbitRadiusAU + innerPlanet.hillSphere * 3;
        const gapOuterAU = outerPlanet.orbitRadiusAU - outerPlanet.hillSphere * 3;

        // Gap must be wide enough (at least 0.5 AU equivalent space)
        const gapWidth = gapOuterAU - gapInnerAU;
        if (gapWidth < 0.3) continue;

        // Score based on: proximity to frost line, gap width, and if it's between rocky/giant
        let score = gapWidth;

        // Prefer gaps near the frost line (like our asteroid belt)
        const midGap = (gapInnerAU + gapOuterAU) / 2;
        const distToFrost = Math.abs(midGap - star.frostLine);
        score += Math.max(0, 2 - distToFrost);

        // Bonus if inner is rocky and outer is giant
        const innerIsRocky = ['rocky', 'terrestrial', 'lavaWorld', 'iceWorld', 'dwarf'].includes(innerPlanet.type);
        const outerIsGiant = ['gasGiant', 'iceGiant'].includes(outerPlanet.type);
        if (innerIsRocky && outerIsGiant) score += 2;

        if (score > bestGapScore) {
            bestGapScore = score;
            bestGapInner = gapInnerAU;
            bestGapOuter = gapOuterAU;
        }
    }

    if (!bestGapInner) return null;

    // Convert to display units
    const innerRadius = bestGapInner * PHYSICS.AU;
    const outerRadius = bestGapOuter * PHYSICS.AU;

    const asteroids = [];
    const count = rng.randomInt(150, 400);

    // Get orbital resonance gaps from the outer planet (Kirkwood gaps analog)
    const outerPlanetIndex = planets.findIndex(p => p.orbitRadiusAU > bestGapOuter);
    let resonanceGaps = [];
    if (outerPlanetIndex > 0) {
        resonanceGaps = PHYSICS.resonanceGaps(planets[outerPlanetIndex].orbitRadiusAU);
    }

    for (let i = 0; i < count; i++) {
        // Distribute asteroids, avoiding resonance gaps
        let radiusAU = rng.random(bestGapInner, bestGapOuter);

        // Check if in resonance gap and nudge if so
        for (const gap of resonanceGaps) {
            if (Math.abs(radiusAU - gap.distance) < gap.width) {
                // Move asteroid out of the resonance gap
                radiusAU += (rng.next() < 0.5 ? -1 : 1) * gap.width * 1.5;
                break;
            }
        }
        radiusAU = Math.max(bestGapInner, Math.min(bestGapOuter, radiusAU));

        // Physics-based orbital speed (Kepler)
        const orbitalPeriod = PHYSICS.orbitalPeriod(radiusAU, star.mass);

        asteroids.push({
            angle: rng.random(0, Math.PI * 2),
            radius: radiusAU * PHYSICS.AU,
            radiusAU: radiusAU,
            eccentricity: rng.random(0, 0.15),
            size: rng.random(0.5, 2),
            orbitalPeriod: orbitalPeriod,
            color: rng.randomChoice(['#666', '#777', '#888', '#999', '#aaa'])
        });
    }

    return { innerRadius, outerRadius, asteroids, innerAU: bestGapInner, outerAU: bestGapOuter };
}

// Physics-based Kuiper belt generation
export function generateKuiperBelt(rng, star, lastPlanetOrbitAU) {
    // Kuiper belt typically starts at 30-50 AU equivalent from star
    // Scale based on star mass and system size
    const innerAU = lastPlanetOrbitAU * 1.3 + rng.random(2, 5);
    const outerAU = innerAU + rng.random(10, 20);

    const innerRadius = innerAU * PHYSICS.AU;
    const outerRadius = outerAU * PHYSICS.AU;

    const objects = [];
    const count = rng.randomInt(200, 500);

    for (let i = 0; i < count; i++) {
        const radiusAU = rng.random(innerAU, outerAU);
        const orbitalPeriod = PHYSICS.orbitalPeriod(radiusAU, star.mass);

        objects.push({
            angle: rng.random(0, Math.PI * 2),
            radius: radiusAU * PHYSICS.AU,
            radiusAU: radiusAU,
            eccentricity: rng.random(0, 0.25), // KBOs have higher eccentricities
            inclination: rng.random(0, 0.3), // Some vertical spread
            size: rng.random(0.3, 1.5),
            orbitalPeriod: orbitalPeriod,
            color: rng.randomChoice(['#556', '#667', '#778', '#889'])
        });
    }

    return { innerRadius, outerRadius, objects, innerAU, outerAU };
}
