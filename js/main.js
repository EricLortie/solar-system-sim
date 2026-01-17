// Solar System Simulator - Main Entry Point

import { CONFIG } from './config.js';
import { rng, setRandomSeed, getRng } from './core/rng.js';
import { camera, resetCamera, updateCamera } from './core/camera.js';
import { state, displayOptions, resetState } from './core/state.js';
import { checkForEvents, clearInterstellarObjects } from './core/events.js';
import { generateSolarSystem } from './generation/system.js';
import { initRenderer, resizeCanvas, render, getCanvas } from './rendering/renderer.js';
import { getPlanetPosition } from './rendering/utils.js';
import { updateInfoPanel, updateSelectedInfo, updateTimeDisplay, updateZoomDisplay } from './ui/panels.js';
import { initControls, updateCinematic, stopCinematic, updateNotifications } from './ui/controls.js';

// Initialize the application
function init() {
    const canvas = document.getElementById('canvas');
    const miniMapCanvas = document.getElementById('mini-map-canvas');

    initRenderer(canvas, miniMapCanvas);

    window.addEventListener('resize', resizeCanvas);

    initControls(generateNewSystem);

    // Generate initial system
    generateNewSystem();

    // Start animation loop
    requestAnimationFrame(gameLoop);
}

function generateNewSystem() {
    // Get seed from input or generate random
    const seedInput = document.getElementById('seed-input').value.trim();
    const seed = seedInput || String(Date.now());
    setRandomSeed(seed);
    state.currentSeed = seed;

    // Reset state
    resetState();
    resetCamera();
    clearInterstellarObjects();

    // Generate the solar system (pass seed for preset detection)
    state.solarSystem = generateSolarSystem(getRng(), seed);

    // Update UI
    updateInfoPanel();
    updateSelectedInfo(null);
}

function gameLoop(timestamp) {
    // Update time
    if (!state.isPaused) {
        state.time += CONFIG.timeScale;
    }

    // Update camera
    updateCamera();

    // Follow selected planet
    if (camera.following && state.solarSystem) {
        const pos = getPlanetPosition(camera.following, state.time);
        camera.targetX = pos.x;
        camera.targetY = pos.y;
    }

    // Check for random interstellar events
    if (state.solarSystem && !state.isPaused) {
        checkForEvents(getRng(), state.solarSystem.star, state.time);
        updateNotifications();
    }

    // Update cinematic mode
    updateCinematic();

    // Render
    render();

    // Update UI displays
    updateTimeDisplay();
    updateZoomDisplay();

    requestAnimationFrame(gameLoop);
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
