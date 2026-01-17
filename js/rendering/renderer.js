// Main Renderer - Handles all drawing operations

import { CONFIG } from '../config.js';
import { camera, worldToScreen, applyTransform, getZoomScale, shouldRenderAtZoom } from '../core/camera.js';
import { state, displayOptions } from '../core/state.js';
import {
    lightenColor, darkenColor, getPlanetPosition, getMoonPosition,
    getSecondaryStarPosition, getCometPosition
} from './utils.js';

let canvas, ctx, miniMapCanvas, miniMapCtx;

export function initRenderer(canvasElement, miniMapCanvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    miniMapCanvas = miniMapCanvasElement;
    miniMapCtx = miniMapCanvas.getContext('2d');
    resizeCanvas();
}

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function getCanvas() {
    return canvas;
}

export function getContext() {
    return ctx;
}

// Main render function
export function render() {
    if (!state.solarSystem) return;

    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();

    if (state.solarSystem.secondaryStar) {
        drawSecondStar();
    }

    drawStar(state.solarSystem.star);

    if (displayOptions.habitable) {
        drawHabitableZone();
    }

    if (state.solarSystem.asteroidBelt) {
        drawAsteroidBelt(state.solarSystem.asteroidBelt);
    }

    if (state.solarSystem.kuiperBelt) {
        drawKuiperBelt(state.solarSystem.kuiperBelt);
    }

    state.solarSystem.planets.forEach(planet => {
        drawPlanet(planet);
    });

    if (displayOptions.comets) {
        state.solarSystem.comets.forEach(comet => {
            drawComet(comet);
        });
    }

    if (displayOptions.minimap) {
        drawMiniMap();
    }
}

// Background stars
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 200; i++) {
        const x = (i * 7919) % canvas.width;
        const y = (i * 104729) % canvas.height;
        const size = ((i * 31) % 3) * 0.5 + 0.5;
        const alpha = 0.3 + ((i * 17) % 7) * 0.1;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
}

// Star rendering
function drawStar(star) {
    const pos = worldToScreen(0, 0, canvas);
    const visualRadius = star.visualRadius * camera.zoom;

    // Outer glow
    const glowRadius = visualRadius * 3;
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowRadius);
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(0.2, star.color + 'cc');
    gradient.addColorStop(0.5, star.color + '44');
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Star body
    const bodyGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, visualRadius);
    bodyGradient.addColorStop(0, '#ffffff');
    bodyGradient.addColorStop(0.3, star.color);
    bodyGradient.addColorStop(1, darkenColor(star.color, 30));

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGradient;
    ctx.fill();

    // Star flares
    updateAndDrawFlares(star, pos, visualRadius);

    // Label
    if (displayOptions.labels && camera.zoom > 0.3) {
        ctx.fillStyle = '#ffffff88';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(star.name, pos.x, pos.y + visualRadius + 20);
    }
}

function updateAndDrawFlares(star, pos, visualRadius) {
    // Update flare timing
    star.nextFlare -= CONFIG.timeScale;
    if (star.nextFlare <= 0) {
        star.flares.push({
            angle: Math.random() * Math.PI * 2,
            size: 0.3 + Math.random() * 0.4,
            life: 1
        });
        star.nextFlare = 2000 + Math.random() * 6000;
    }

    // Draw and update flares
    star.flares = star.flares.filter(flare => {
        flare.life -= 0.01 * CONFIG.timeScale;
        if (flare.life <= 0) return false;

        const flareLength = visualRadius * flare.size * flare.life;
        const flareX = pos.x + Math.cos(flare.angle) * visualRadius;
        const flareY = pos.y + Math.sin(flare.angle) * visualRadius;
        const endX = pos.x + Math.cos(flare.angle) * (visualRadius + flareLength);
        const endY = pos.y + Math.sin(flare.angle) * (visualRadius + flareLength);

        const flareGradient = ctx.createLinearGradient(flareX, flareY, endX, endY);
        flareGradient.addColorStop(0, star.color);
        flareGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(flareX, flareY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 3 * flare.life;
        ctx.stroke();

        return true;
    });
}

function drawSecondStar() {
    const star = state.solarSystem.secondaryStar;
    const starPos = getSecondaryStarPosition(star, state.time);
    const pos = worldToScreen(starPos.x, starPos.y, canvas);
    const visualRadius = star.visualRadius * camera.zoom;

    // Orbit path
    if (displayOptions.orbits) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, star.orbitRadius * camera.zoom, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Glow
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, visualRadius * 2);
    gradient.addColorStop(0, star.color);
    gradient.addColorStop(0.5, star.color + '44');
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Body
    const bodyGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, visualRadius);
    bodyGradient.addColorStop(0, '#ffffff');
    bodyGradient.addColorStop(0.5, star.color);
    bodyGradient.addColorStop(1, darkenColor(star.color, 20));

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2);
    ctx.fillStyle = bodyGradient;
    ctx.fill();

    if (displayOptions.labels && camera.zoom > 0.3) {
        ctx.fillStyle = '#ffffff88';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(star.name, pos.x, pos.y + visualRadius + 15);
    }
}

function drawHabitableZone() {
    const star = state.solarSystem.star;
    const centerPos = worldToScreen(0, 0, canvas);

    const innerRadius = star.habitableZoneInner * 100 * camera.zoom;
    const outerRadius = star.habitableZoneOuter * 100 * camera.zoom;

    ctx.beginPath();
    ctx.arc(centerPos.x, centerPos.y, outerRadius, 0, Math.PI * 2);
    ctx.arc(centerPos.x, centerPos.y, innerRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(100, 200, 100, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 200, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Planet rendering
function drawOrbit(planet) {
    if (!displayOptions.orbits) return;

    const centerPos = worldToScreen(0, 0, canvas);
    const orbitRadius = planet.orbitRadius * camera.zoom;

    ctx.beginPath();

    if (planet.eccentricity > 0.01) {
        // Draw elliptical orbit
        const a = orbitRadius;
        const b = orbitRadius * Math.sqrt(1 - planet.eccentricity * planet.eccentricity);
        const c = a * planet.eccentricity;

        ctx.ellipse(
            centerPos.x - c * Math.cos(camera.rotation * Math.PI / 180),
            centerPos.y - c * Math.sin(camera.rotation * Math.PI / 180) * Math.cos(camera.tilt * Math.PI / 180),
            a, b * Math.cos(camera.tilt * Math.PI / 180),
            camera.rotation * Math.PI / 180,
            0, Math.PI * 2
        );
    } else {
        const tiltFactor = Math.cos(camera.tilt * Math.PI / 180);
        ctx.ellipse(centerPos.x, centerPos.y, orbitRadius, orbitRadius * tiltFactor, camera.rotation * Math.PI / 180, 0, Math.PI * 2);
    }

    ctx.strokeStyle = planet.selected ? 'rgba(100, 150, 255, 0.5)' : 'rgba(100, 150, 255, 0.15)';
    ctx.lineWidth = planet.selected ? 2 : 1;
    ctx.stroke();
}

function drawPlanet(planet) {
    const planetPos = getPlanetPosition(planet, state.time);

    if (displayOptions.trails) {
        planet.trail.push({ x: planetPos.x, y: planetPos.y });
        if (planet.trail.length > CONFIG.trailLength) {
            planet.trail.shift();
        }
    }

    drawOrbit(planet);

    // Draw trail
    if (displayOptions.trails && planet.trail.length >= 2) {
        ctx.beginPath();
        for (let i = 0; i < planet.trail.length; i++) {
            const point = planet.trail[i];
            const screenPos = worldToScreen(point.x, point.y, canvas);
            if (i === 0) ctx.moveTo(screenPos.x, screenPos.y);
            else ctx.lineTo(screenPos.x, screenPos.y);
        }
        ctx.strokeStyle = planet.color + '44';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    const pos = worldToScreen(planetPos.x, planetPos.y, canvas);
    // Use zoom-aware scaling - planets have higher min size to stay visible
    const visualRadius = getZoomScale(planet.visualRadius, {
        minSize: 2,
        maxSize: 40,
        zoomPower: 0.75,
        threshold: 0.25
    });

    // Draw trojan asteroids
    if (displayOptions.asteroids && planet.trojans) {
        planet.trojans.forEach((trojan, index) => {
            // Cull trojans at low zoom
            if (!shouldRenderAtZoom(index, planet.trojans.length, 'asteroid')) return;
            const lagrangeAngle = planetPos.angle + (trojan.lagrangePoint === 4 ? Math.PI / 3 : -Math.PI / 3);
            const tAngle = lagrangeAngle + trojan.offsetAngle;
            const tRadius = planet.orbitRadius + trojan.offsetRadius;
            const tx = Math.cos(tAngle) * tRadius;
            const ty = Math.sin(tAngle) * tRadius;
            const transformed = applyTransform(tx, ty);
            const tPos = worldToScreen(transformed.x, transformed.y, canvas);
            const trojanSize = getZoomScale(trojan.size, { minSize: 0.3, maxSize: 3, zoomPower: 0.6 });

            if (trojanSize < 0.3) return;
            ctx.beginPath();
            ctx.arc(tPos.x, tPos.y, trojanSize, 0, Math.PI * 2);
            ctx.fillStyle = trojan.color;
            ctx.fill();
        });
    }

    // Rings behind planet
    if (planet.hasRings) {
        drawPlanetRings(planet, pos, visualRadius, false);
    }

    // Planet body
    const gradient = ctx.createRadialGradient(
        pos.x - visualRadius * 0.3, pos.y - visualRadius * 0.3, 0,
        pos.x, pos.y, visualRadius
    );
    gradient.addColorStop(0, lightenColor(planet.color, 30));
    gradient.addColorStop(0.5, planet.color);
    gradient.addColorStop(1, darkenColor(planet.color, 30));

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Surface details
    if (visualRadius > 5) {
        drawPlanetSurface(planet, pos, visualRadius);
    }

    // Rings in front
    if (planet.hasRings) {
        drawPlanetRings(planet, pos, visualRadius, true);
    }

    // Selection indicator
    if (planet.selected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, visualRadius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#4a90d9';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Moons
    if (displayOptions.moons && planet.selected && camera.zoom >= 1.2) {
        planet.moons.forEach(moon => {
            drawMoon(moon, pos, planet);
        });
    }

    // Label
    if (displayOptions.labels && visualRadius > 3) {
        ctx.fillStyle = planet.selected ? '#ffffff' : '#ffffff88';
        ctx.font = planet.selected ? 'bold 12px sans-serif' : '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, pos.x, pos.y + visualRadius + 15);
    }
}

function drawPlanetRings(planet, pos, visualRadius, front) {
    const tiltFactor = Math.cos(camera.tilt * Math.PI / 180);

    // Saturn-like prominent rings have multiple bands
    if (planet.prominentRings) {
        const ringBands = [
            { inner: 1.2, outer: 1.5, opacity: 0.7, color: '#d4c4a8' },  // C ring
            { inner: 1.5, outer: 1.95, opacity: 0.85, color: '#e8dcc4' }, // B ring
            { inner: 2.0, outer: 2.3, opacity: 0.75, color: '#ddd0b8' },  // A ring
        ];

        ringBands.forEach(band => {
            const ringInner = visualRadius * band.inner;
            const ringOuter = visualRadius * band.outer;

            ctx.beginPath();
            if (front) {
                ctx.ellipse(pos.x, pos.y, ringOuter, ringOuter * tiltFactor * 0.3, 0, 0, Math.PI);
            } else {
                ctx.ellipse(pos.x, pos.y, ringOuter, ringOuter * tiltFactor * 0.3, 0, Math.PI, Math.PI * 2);
            }
            ctx.ellipse(pos.x, pos.y, ringInner, ringInner * tiltFactor * 0.3, 0, front ? Math.PI : Math.PI * 2, front ? 0 : Math.PI, true);

            ctx.fillStyle = band.color + Math.round(band.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
        });
    } else {
        // Standard rings for other planets
        const ringInner = visualRadius * 1.4;
        const ringOuter = visualRadius * 2.2;

        ctx.beginPath();
        if (front) {
            ctx.ellipse(pos.x, pos.y, ringOuter, ringOuter * tiltFactor * 0.3, 0, 0, Math.PI);
        } else {
            ctx.ellipse(pos.x, pos.y, ringOuter, ringOuter * tiltFactor * 0.3, 0, Math.PI, Math.PI * 2);
        }
        ctx.ellipse(pos.x, pos.y, ringInner, ringInner * tiltFactor * 0.3, 0, front ? Math.PI : Math.PI * 2, front ? 0 : Math.PI, true);

        ctx.fillStyle = planet.ringColor;
        ctx.fill();
    }
}

function drawPlanetSurface(planet, pos, visualRadius) {
    const details = planet.surfaceDetails;
    if (!details) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2);
    ctx.clip();

    // Bands for gas giants
    if (details.bandCount > 0) {
        for (let i = 0; i < details.bandCount; i++) {
            const y = pos.y - visualRadius + (i / details.bandCount) * visualRadius * 2;
            const height = visualRadius * 2 / details.bandCount;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(pos.x - visualRadius, y, visualRadius * 2, height);
        }
    }

    // Great storm spot
    if (details.hasStorm && visualRadius > 8) {
        const stormX = pos.x + Math.cos(details.stormAngle) * visualRadius * 0.4;
        const stormY = pos.y + Math.sin(details.stormAngle) * visualRadius * 0.2;
        const stormGradient = ctx.createRadialGradient(stormX, stormY, 0, stormX, stormY, visualRadius * details.stormSize);
        stormGradient.addColorStop(0, 'rgba(255, 100, 100, 0.6)');
        stormGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.ellipse(stormX, stormY, visualRadius * details.stormSize, visualRadius * details.stormSize * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = stormGradient;
        ctx.fill();
    }

    // Ice caps
    if (details.hasIceCaps && visualRadius > 6) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y - visualRadius + visualRadius * details.iceCapsSize, visualRadius * 0.7, visualRadius * details.iceCapsSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + visualRadius - visualRadius * details.iceCapsSize, visualRadius * 0.7, visualRadius * details.iceCapsSize, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Craters
    if (details.craterCount > 0 && visualRadius > 6) {
        details.craters.forEach(crater => {
            const cx = pos.x + Math.cos(crater.angle) * visualRadius * crater.distance;
            const cy = pos.y + Math.sin(crater.angle) * visualRadius * crater.distance;
            const craterRadius = visualRadius * crater.size;

            ctx.beginPath();
            ctx.arc(cx, cy, craterRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx - craterRadius * 0.2, cy - craterRadius * 0.2, craterRadius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        });
    }

    // Day/night terminator
    const starScreenPos = worldToScreen(0, 0, canvas);
    const angleToStar = Math.atan2(starScreenPos.y - pos.y, starScreenPos.x - pos.x);
    const shadowGradient = ctx.createLinearGradient(
        pos.x + Math.cos(angleToStar) * visualRadius,
        pos.y + Math.sin(angleToStar) * visualRadius,
        pos.x - Math.cos(angleToStar) * visualRadius,
        pos.y - Math.sin(angleToStar) * visualRadius
    );
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(pos.x - visualRadius, pos.y - visualRadius, visualRadius * 2, visualRadius * 2);

    ctx.restore();
}

function drawMoon(moon, planetScreenPos, planet) {
    const moonPos = getMoonPosition(moon, { x: 0, y: 0 }, state.time);
    const pos = {
        x: planetScreenPos.x + moonPos.x * camera.zoom,
        y: planetScreenPos.y + moonPos.y * camera.zoom
    };
    const visualRadius = moon.visualRadius * camera.zoom;

    // Moon orbit
    if (displayOptions.orbits) {
        ctx.beginPath();
        ctx.arc(planetScreenPos.x, planetScreenPos.y, moon.orbitRadius * camera.zoom, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(150, 150, 200, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Moon body
    const gradient = ctx.createRadialGradient(
        pos.x - visualRadius * 0.3, pos.y - visualRadius * 0.3, 0,
        pos.x, pos.y, visualRadius
    );
    gradient.addColorStop(0, lightenColor(moon.color, 20));
    gradient.addColorStop(1, moon.color);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Label
    if (displayOptions.labels && visualRadius > 2) {
        ctx.fillStyle = '#ffffff66';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(moon.name, pos.x, pos.y + visualRadius + 10);
    }
}

// Belt rendering
function drawAsteroidBelt(belt) {
    if (!displayOptions.asteroids || !belt) return;

    belt.asteroids.forEach((asteroid, index) => {
        // Density culling at low zoom
        if (!shouldRenderAtZoom(index, belt.asteroids.length, 'asteroid')) return;

        // Use Kepler-based orbital motion (same formula as planets)
        const angularSpeed = (0.005 * CONFIG.timeScale) / asteroid.orbitalPeriod * Math.PI * 2;
        asteroid.angle += angularSpeed;

        const r = asteroid.radius * (1 - asteroid.eccentricity * Math.cos(asteroid.angle));
        const x = Math.cos(asteroid.angle) * r;
        const y = Math.sin(asteroid.angle) * r;
        const transformed = applyTransform(x, y);
        const pos = worldToScreen(transformed.x, transformed.y, canvas);
        const size = getZoomScale(asteroid.size, { minSize: 0.3, maxSize: 3, zoomPower: 0.5 });

        if (size < 0.3) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = asteroid.color;
        ctx.fill();
    });
}

function drawKuiperBelt(belt) {
    if (!displayOptions.asteroids || !belt) return;

    belt.objects.forEach((obj, index) => {
        // Density culling at low zoom (Kuiper belt is far out, cull more aggressively)
        if (!shouldRenderAtZoom(index, belt.objects.length, 'kuiper')) return;

        // Use Kepler-based orbital motion (same formula as planets)
        const angularSpeed = (0.005 * CONFIG.timeScale) / obj.orbitalPeriod * Math.PI * 2;
        obj.angle += angularSpeed;

        const r = obj.radius * (1 - obj.eccentricity * Math.cos(obj.angle));
        const x = Math.cos(obj.angle) * r;
        const y = Math.sin(obj.angle) * r;
        const transformed = applyTransform(x, y);
        const pos = worldToScreen(transformed.x, transformed.y, canvas);
        const size = getZoomScale(obj.size, { minSize: 0.2, maxSize: 2.5, zoomPower: 0.5 });

        if (size < 0.2) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = obj.color;
        ctx.fill();
    });
}

// Comet rendering
function drawComet(comet) {
    const cometPos = getCometPosition(comet, state.time);
    const pos = worldToScreen(cometPos.x, cometPos.y, canvas);
    const distanceFromStar = cometPos.distanceFromStar;

    // Check if comet is within tail activation radius
    const withinTailRadius = distanceFromStar < comet.tailActivationRadius;

    // Tail intensity based on distance (closer = more intense)
    const tailIntensity = withinTailRadius ?
        Math.pow(1 - distanceFromStar / comet.tailActivationRadius, 0.5) * comet.tailBrightness : 0;

    // Draw tail if active
    if (withinTailRadius && tailIntensity > 0.1) {
        // Ion tail (straight, away from star)
        const tailAngle = cometPos.angle + Math.PI;
        const tailLength = 50 * tailIntensity * camera.zoom;

        const tailGradient = ctx.createLinearGradient(pos.x, pos.y,
            pos.x + Math.cos(tailAngle) * tailLength,
            pos.y + Math.sin(tailAngle) * tailLength);
        tailGradient.addColorStop(0, `rgba(${comet.tailColor.r}, ${comet.tailColor.g}, ${comet.tailColor.b}, ${tailIntensity * 0.8})`);
        tailGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + Math.cos(tailAngle - 0.05) * tailLength, pos.y + Math.sin(tailAngle - 0.05) * tailLength);
        ctx.lineTo(pos.x + Math.cos(tailAngle + 0.05) * tailLength, pos.y + Math.sin(tailAngle + 0.05) * tailLength);
        ctx.closePath();
        ctx.fillStyle = tailGradient;
        ctx.fill();

        // Dust tail (curved, wider)
        const dustTailLength = 35 * tailIntensity * camera.zoom;
        const dustGradient = ctx.createLinearGradient(pos.x, pos.y,
            pos.x + Math.cos(tailAngle + 0.2) * dustTailLength,
            pos.y + Math.sin(tailAngle + 0.2) * dustTailLength);
        dustGradient.addColorStop(0, `rgba(${comet.dustColor.r}, ${comet.dustColor.g}, ${comet.dustColor.b}, ${tailIntensity * 0.5})`);
        dustGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + Math.cos(tailAngle + 0.12) * dustTailLength, pos.y + Math.sin(tailAngle + 0.12) * dustTailLength);
        ctx.lineTo(pos.x + Math.cos(tailAngle + 0.28) * dustTailLength, pos.y + Math.sin(tailAngle + 0.28) * dustTailLength);
        ctx.closePath();
        ctx.fillStyle = dustGradient;
        ctx.fill();
    }

    // Comet nucleus (always visible) with coma that grows when active
    const comaSize = withinTailRadius ?
        comet.size * camera.zoom * (2 + tailIntensity * 3) :
        comet.size * camera.zoom * 1.5;

    const nucleusGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, comaSize);
    nucleusGradient.addColorStop(0, '#ffffff');
    nucleusGradient.addColorStop(0.3, comet.color);
    nucleusGradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, comaSize, 0, Math.PI * 2);
    ctx.fillStyle = nucleusGradient;
    ctx.fill();
}

// Mini map
function drawMiniMap() {
    if (!miniMapCtx || !state.solarSystem) return;

    miniMapCtx.fillStyle = '#0a0f1e';
    miniMapCtx.fillRect(0, 0, 150, 150);

    const scale = 0.15;
    const centerX = 75;
    const centerY = 75;

    // Star
    miniMapCtx.beginPath();
    miniMapCtx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    miniMapCtx.fillStyle = state.solarSystem.star.color;
    miniMapCtx.fill();

    // Planets
    state.solarSystem.planets.forEach(planet => {
        const planetPos = getPlanetPosition(planet, state.time);
        const x = centerX + planetPos.x * scale;
        const y = centerY + planetPos.y * scale;

        miniMapCtx.beginPath();
        miniMapCtx.arc(x, y, 2, 0, Math.PI * 2);
        miniMapCtx.fillStyle = planet.color;
        miniMapCtx.fill();
    });

    // Camera viewport
    const viewWidth = (canvas.width / camera.zoom) * scale;
    const viewHeight = (canvas.height / camera.zoom) * scale;
    const viewX = centerX + camera.x * scale - viewWidth / 2;
    const viewY = centerY + camera.y * scale - viewHeight / 2;

    miniMapCtx.strokeStyle = '#4a90d9';
    miniMapCtx.lineWidth = 1;
    miniMapCtx.strokeRect(viewX, viewY, viewWidth, viewHeight);
}

// Export for screenshot functionality
export function captureScreenshot() {
    return canvas.toDataURL('image/png');
}
