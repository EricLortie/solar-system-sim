// Orbital Physics Constants and Calculations
// All units normalized: 1 AU = 100 units, 1 Solar Mass = 1, 1 Earth Mass = 1
// Time unit chosen so Earth year = 365 time units

export const PHYSICS = {
    G: 1, // Gravitational constant (normalized)
    AU: 200, // 1 AU in our distance units (increased for better visual spacing)

    // Calculate orbital period using Kepler's 3rd law: T^2 = (4*pi^2 * a^3) / (G * M)
    // Simplified: T = sqrt(a^3 / M) * 365 (in days, for a in AU, M in solar masses)
    orbitalPeriod(semiMajorAxisAU, starMassSolar) {
        return Math.sqrt(Math.pow(semiMajorAxisAU, 3) / starMassSolar) * 365;
    },

    // Orbital velocity at distance r for circular orbit: v = sqrt(G*M/r)
    // Returns velocity factor (higher = faster)
    orbitalVelocity(distanceAU, starMassSolar) {
        return Math.sqrt(starMassSolar / distanceAU);
    },

    // Hill sphere radius: r_H = a * (m_planet / (3 * M_star))^(1/3)
    // This is the region where a planet's gravity dominates
    hillSphere(orbitRadiusAU, planetMassEarth, starMassSolar) {
        const planetMassSolar = planetMassEarth / 333000; // Earth masses to Solar masses
        return orbitRadiusAU * Math.pow(planetMassSolar / (3 * starMassSolar), 1/3);
    },

    // Minimum separation between planets (in mutual Hill radii)
    // Stable systems typically have 10+ mutual Hill radii separation
    minPlanetSeparation(orbit1AU, mass1Earth, orbit2AU, mass2Earth, starMassSolar) {
        const hill1 = this.hillSphere(orbit1AU, mass1Earth, starMassSolar);
        const hill2 = this.hillSphere(orbit2AU, mass2Earth, starMassSolar);
        const mutualHill = (hill1 + hill2) / 2;
        return mutualHill * 10; // 10 mutual Hill radii for stability
    },

    // Frost line: distance where water ice can condense
    // Approximately 2.7 AU * sqrt(L/L_sun) for water ice
    frostLine(luminositySolar) {
        return 2.7 * Math.sqrt(luminositySolar);
    },

    // Inner edge where planets can exist (Roche limit, tidal destruction)
    // Roughly 0.01 AU for rocky planets around Sun-like stars
    innerLimit(starMassSolar, starRadiusSolar) {
        return Math.max(0.02, starRadiusSolar * 0.01);
    },

    // Calculate escape velocity: v_esc = sqrt(2*G*M/r)
    escapeVelocity(massEarth, radiusEarth) {
        // Normalized so Earth = 1
        return Math.sqrt(massEarth / radiusEarth);
    },

    // Surface gravity relative to Earth
    surfaceGravity(massEarth, radiusEarth) {
        return massEarth / (radiusEarth * radiusEarth);
    },

    // Mean-motion resonance gaps (Kirkwood gaps analog)
    resonanceGaps(planetOrbitAU) {
        // Major mean-motion resonances that create gaps
        // Ratio is asteroid_period / planet_period
        const resonances = [
            { ratio: 4/1, width: 0.02 },   // 4:1
            { ratio: 3/1, width: 0.03 },   // 3:1 (strong)
            { ratio: 5/2, width: 0.02 },   // 5:2
            { ratio: 7/3, width: 0.015 },  // 7:3
            { ratio: 2/1, width: 0.04 },   // 2:1 (strong)
        ];

        return resonances.map(r => ({
            // From Kepler's 3rd: a_asteroid/a_planet = (T_asteroid/T_planet)^(2/3)
            distance: planetOrbitAU * Math.pow(r.ratio, 2/3),
            width: planetOrbitAU * r.width
        }));
    }
};
