// UI Panel Updates

import { state, displayOptions, cinematic } from '../core/state.js';
import { camera } from '../core/camera.js';
import { formatNumber } from '../rendering/utils.js';

export function updateInfoPanel() {
    if (!state.solarSystem) return;

    const star = state.solarSystem.star;
    let starInfoHTML = `
        <div class="info-row">
            <span class="info-label">Star</span>
            <span class="info-value">
                <span class="star-indicator" style="background: ${star.color}"></span>
                ${star.name}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Class</span>
            <span class="info-value">${star.fullName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Temperature</span>
            <span class="info-value">${formatNumber(star.temperature)} K</span>
        </div>
        <div class="info-row">
            <span class="info-label">Mass</span>
            <span class="info-value">${formatNumber(star.mass)} M&#9737;</span>
        </div>
        <div class="info-row">
            <span class="info-label">Luminosity</span>
            <span class="info-value">${formatNumber(star.luminosity)} L&#9737;</span>
        </div>
    `;

    if (state.solarSystem.secondaryStar) {
        starInfoHTML += `
            <div class="info-row" style="margin-top: 8px; border-top: 1px solid rgba(100,150,255,0.2); padding-top: 8px;">
                <span class="info-label">Binary Star</span>
                <span class="info-value">
                    <span class="star-indicator" style="background: ${state.solarSystem.secondaryStar.color}"></span>
                    ${state.solarSystem.secondaryStar.name}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">Class</span>
                <span class="info-value">${state.solarSystem.secondaryStar.fullName}</span>
            </div>
        `;
    }

    document.getElementById('star-info').innerHTML = starInfoHTML;

    const totalMoons = state.solarSystem.planets.reduce((sum, p) => sum + p.moons.length, 0);
    const habitablePlanets = state.solarSystem.planets.filter(p => p.inHabitableZone).length;

    document.getElementById('system-stats').innerHTML = `
        <h3>System Stats</h3>
        <div class="info-row">
            <span class="info-label">System Type</span>
            <span class="info-value" style="font-size: 11px;">${state.solarSystem.archetypeName || 'Unknown'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Planets</span>
            <span class="info-value">${state.solarSystem.planets.length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Moons</span>
            <span class="info-value">${totalMoons}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Comets</span>
            <span class="info-value">${state.solarSystem.comets.length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">In Habitable Zone</span>
            <span class="info-value">${habitablePlanets}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Frost Line</span>
            <span class="info-value">${formatNumber(star.frostLine)} AU</span>
        </div>
        <div class="info-row">
            <span class="info-label">Binary System</span>
            <span class="info-value">${state.solarSystem.secondaryStar ? 'Yes' : 'No'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Seed</span>
            <span class="info-value" style="font-size: 10px;">${state.currentSeed}</span>
        </div>
    `;

    const planetList = document.getElementById('planet-list');
    planetList.innerHTML = state.solarSystem.planets.map(planet => `
        <div class="planet-item ${planet.selected ? 'selected' : ''}" data-planet-id="${planet.id}">
            <div class="planet-color" style="background: ${planet.color}"></div>
            <div>
                <div class="planet-name">${planet.name}</div>
                <div class="planet-type">${planet.typeName}${planet.inHabitableZone ? ' - Habitable Zone' : ''}</div>
            </div>
        </div>
    `).join('');
}

export function updateSelectedInfo(planet) {
    const panel = document.getElementById('selected-info');
    const title = document.getElementById('selected-title');
    const details = document.getElementById('selected-details');

    if (!planet) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    panel.classList.remove('collapsed');
    title.textContent = planet.name;

    let compositionHTML = '<div class="composition-bar">';
    const colors = {
        rock: '#8b7355', metal: '#a0a0a0', water: '#4a90d9', ice: '#b0e0e6',
        hydrogen: '#ffcc66', helium: '#ffe4b5', methane: '#48d1cc',
        ammonia: '#dda0dd', volatiles: '#98fb98', other: '#d3d3d3'
    };

    for (const [key, value] of Object.entries(planet.composition)) {
        if (value > 0) {
            compositionHTML += `<div class="composition-segment" style="width: ${value * 100}%; background: ${colors[key] || '#666'}"></div>`;
        }
    }
    compositionHTML += '</div>';

    details.innerHTML = `
        <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-value">${planet.typeName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Orbit Distance</span>
            <span class="info-value">${formatNumber(planet.orbitRadiusAU)} AU</span>
        </div>
        <div class="info-row">
            <span class="info-label">Radius</span>
            <span class="info-value">${formatNumber(planet.radius)} R&#8853;</span>
        </div>
        <div class="info-row">
            <span class="info-label">Mass</span>
            <span class="info-value">${formatNumber(planet.mass)} M&#8853;</span>
        </div>
        <div class="info-row">
            <span class="info-label">Temperature</span>
            <span class="info-value">${formatNumber(planet.temperature)} K</span>
        </div>
        <div class="info-row">
            <span class="info-label">Orbital Period</span>
            <span class="info-value">${formatNumber(planet.orbitalPeriod)} days</span>
        </div>
        <div class="info-row">
            <span class="info-label">Eccentricity</span>
            <span class="info-value">${planet.eccentricity.toFixed(3)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Hill Sphere</span>
            <span class="info-value">${formatNumber(planet.hillSphere)} AU</span>
        </div>
        <div class="info-row">
            <span class="info-label">Atmosphere</span>
            <span class="info-value">${planet.atmosphere}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Moons</span>
            <span class="info-value">${planet.moons.length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Rings</span>
            <span class="info-value">${planet.hasRings ? 'Yes' : 'No'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Trojans</span>
            <span class="info-value">${planet.trojans ? planet.trojans.length : 0}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Composition</span>
            <span class="info-value"></span>
        </div>
        ${compositionHTML}
        ${planet.moons.length > 0 ? `
            <h3 style="margin-top: 12px">Moons</h3>
            ${planet.moons.map(m => `
                <div class="info-row">
                    <span class="info-label">${m.name}</span>
                    <span class="info-value">${m.typeName}</span>
                </div>
            `).join('')}
        ` : ''}
    `;
}

export function updateTimeDisplay() {
    const elapsed = state.time;
    const years = Math.floor(elapsed / 365000);
    const days = Math.floor((elapsed % 365000) / 1000);
    document.getElementById('time-display').textContent = `Year ${years}, Day ${days}`;
}

export function updateZoomDisplay() {
    document.getElementById('zoom-level').textContent = Math.round(camera.zoom * 100) + '%';

    // Scale bar
    const scaleAU = 1 / camera.zoom;
    let scaleText;
    if (scaleAU >= 10) {
        scaleText = Math.round(scaleAU) + ' AU';
    } else if (scaleAU >= 1) {
        scaleText = scaleAU.toFixed(1) + ' AU';
    } else {
        scaleText = (scaleAU * 150).toFixed(0) + ' million km';
    }
    document.getElementById('scale-value').textContent = scaleText;
}

export function updateCinematicStatus(active) {
    const status = document.getElementById('cinematic-status');
    const btn = document.getElementById('cinematic-btn');

    if (active) {
        status.classList.add('active');
        status.querySelector('span').textContent = 'Cinematic Active';
        btn.textContent = 'Stop Cinematic';
    } else {
        status.classList.remove('active');
        status.querySelector('span').textContent = 'Cinematic Off';
        btn.textContent = 'Start Cinematic';
    }
}
