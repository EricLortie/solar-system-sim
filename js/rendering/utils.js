// Rendering Utility Functions

import { CONFIG } from '../config.js';
import { camera, applyTransform } from '../core/camera.js';

// Color manipulation utilities
export function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Number formatting
export function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    if (num < 0.01) return num.toExponential(2);
    return num.toFixed(2);
}

// Position calculations
export function getPlanetPosition(planet, time) {
    const angle = planet.angle + (time * 0.005 * CONFIG.timeScale) / planet.orbitalPeriod * Math.PI * 2;
    const r = planet.orbitRadius * (1 - planet.eccentricity * Math.cos(angle));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const transformed = applyTransform(x, y);

    return {
        x: transformed.x,
        y: transformed.y,
        angle: angle,
        worldX: x,
        worldY: y
    };
}

export function getMoonPosition(moon, planetPos, time) {
    const angle = moon.angle + (time * 0.003 * CONFIG.timeScale) / moon.orbitalPeriod * Math.PI * 2;
    const r = moon.orbitRadius * (1 - moon.eccentricity * Math.cos(angle));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    return {
        x: planetPos.x + x,
        y: planetPos.y + y,
        angle: angle
    };
}

export function getSecondaryStarPosition(secondaryStar, time) {
    const angle = secondaryStar.angle + (time * 0.002 * CONFIG.timeScale) / secondaryStar.orbitalPeriod * Math.PI * 2;
    const x = Math.cos(angle) * secondaryStar.orbitRadius;
    const y = Math.sin(angle) * secondaryStar.orbitRadius;
    const transformed = applyTransform(x, y);

    return {
        x: transformed.x,
        y: transformed.y,
        angle: angle
    };
}

export function getCometPosition(comet, time) {
    // Comet on elliptical orbit
    const angle = comet.angle + (time * 0.001 * CONFIG.timeScale) / comet.orbitalPeriod * Math.PI * 2;
    const r = comet.semiMajorAxis * (1 - comet.eccentricity * comet.eccentricity) /
              (1 + comet.eccentricity * Math.cos(angle));
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r * Math.cos(comet.inclination);
    const transformed = applyTransform(x, y);

    return {
        x: transformed.x,
        y: transformed.y,
        angle: angle,
        distanceFromStar: Math.sqrt(x * x + y * y)
    };
}
