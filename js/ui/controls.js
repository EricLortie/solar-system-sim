// UI Controls and Input Handling

import { CONFIG } from '../config.js';
import { camera, resetCamera, screenToWorld } from '../core/camera.js';
import { state, displayOptions, cinematic } from '../core/state.js';
import { updateInfoPanel, updateSelectedInfo, updateCinematicStatus } from './panels.js';
import { getPlanetPosition } from '../rendering/utils.js';
import { getCanvas, captureScreenshot } from '../rendering/renderer.js';

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let lastTouchDistance = 0;
let isTouching = false;

export function initControls(onGenerate) {
    const canvas = getCanvas();

    // Collapsible sections
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
        });
    });

    // Mobile panel toggles
    const toggleControls = document.getElementById('toggle-controls');
    const toggleInfo = document.getElementById('toggle-info');
    const controlsPanel = document.getElementById('controls');
    const infoPanel = document.getElementById('info-panel');

    if (toggleControls) {
        toggleControls.addEventListener('click', () => {
            controlsPanel.classList.toggle('mobile-visible');
            infoPanel.classList.remove('mobile-visible');
        });
    }

    if (toggleInfo) {
        toggleInfo.addEventListener('click', () => {
            infoPanel.classList.toggle('mobile-visible');
            controlsPanel.classList.remove('mobile-visible');
        });
    }

    // Close panels when clicking on canvas (mobile)
    canvas.addEventListener('click', (e) => {
        if (window.innerWidth <= 600) {
            controlsPanel.classList.remove('mobile-visible');
            infoPanel.classList.remove('mobile-visible');
        }
    }, true);

    // Mouse controls
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            camera.targetX -= dx / camera.zoom;
            camera.targetY -= dy / camera.zoom;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            camera.following = null;
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        camera.targetZoom = Math.max(0.1, Math.min(10, camera.targetZoom * zoomFactor));
    });

    // Touch controls for mobile
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isTouching = true;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            lastTouchDistance = getTouchDistance(e.touches);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isTouching) {
            const dx = e.touches[0].clientX - lastMouseX;
            const dy = e.touches[0].clientY - lastMouseY;
            camera.targetX -= dx / camera.zoom;
            camera.targetY -= dy / camera.zoom;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            camera.following = null;
        } else if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches);
            if (lastTouchDistance > 0) {
                const scale = distance / lastTouchDistance;
                camera.targetZoom = Math.max(0.1, Math.min(10, camera.targetZoom * scale));
            }
            lastTouchDistance = distance;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            isTouching = false;
            lastTouchDistance = 0;
        } else if (e.touches.length === 1) {
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            lastTouchDistance = 0;
        }
    }, { passive: true });

    canvas.addEventListener('click', (e) => {
        if (!state.solarSystem) return;

        const worldPos = screenToWorld(e.clientX, e.clientY, canvas);
        const planet = findPlanetAtPosition(worldPos.x, worldPos.y);

        if (planet) {
            selectPlanet(planet);
        } else {
            state.solarSystem.planets.forEach(p => p.selected = false);
            state.selectedObject = null;
            updateSelectedInfo(null);
        }

        updateInfoPanel();
    });

    canvas.addEventListener('dblclick', (e) => {
        if (!state.solarSystem) return;

        const worldPos = screenToWorld(e.clientX, e.clientY, canvas);
        const planet = findPlanetAtPosition(worldPos.x, worldPos.y);

        if (planet) {
            focusOnPlanet(planet);
        }
    });

    // Speed slider
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        const value = e.target.value;
        const speed = Math.pow(10, (value - 50) / 25);
        CONFIG.timeScale = speed;
        document.getElementById('speed-value').textContent = speed.toFixed(1) + 'x';
    });

    // Toggle switches
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const option = toggle.dataset.toggle;
            toggle.classList.toggle('active');
            displayOptions[option] = toggle.classList.contains('active');

            if (option === 'minimap') {
                document.getElementById('mini-map').style.display = displayOptions.minimap ? 'block' : 'none';
            }
        });
    });

    // View controls
    document.getElementById('tilt-slider').addEventListener('input', (e) => {
        camera.targetTilt = parseInt(e.target.value);
        document.getElementById('tilt-value').textContent = camera.targetTilt + '°';
    });

    document.getElementById('rotation-slider').addEventListener('input', (e) => {
        camera.targetRotation = parseInt(e.target.value);
        document.getElementById('rotation-value').textContent = camera.targetRotation + '°';
    });

    // Preset views
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            stopCinematic();
            applyPreset(btn.dataset.preset);
        });
    });

    // Cinematic mode
    document.getElementById('cinematic-btn').addEventListener('click', () => {
        if (cinematic.active) {
            stopCinematic();
        } else {
            startCinematic();
        }
    });

    document.getElementById('scene-duration-slider').addEventListener('input', (e) => {
        cinematic.sceneDuration = parseInt(e.target.value) * 1000;
        document.getElementById('scene-duration-value').textContent = e.target.value + 's';
    });

    // Config inputs
    document.getElementById('min-planets').addEventListener('change', (e) => {
        CONFIG.minPlanets = parseInt(e.target.value);
    });

    document.getElementById('max-planets').addEventListener('change', (e) => {
        CONFIG.maxPlanets = parseInt(e.target.value);
    });

    document.getElementById('max-moons').addEventListener('change', (e) => {
        CONFIG.maxMoons = parseInt(e.target.value);
    });

    document.getElementById('binary-chance').addEventListener('change', (e) => {
        CONFIG.binaryStarChance = parseInt(e.target.value) / 100;
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', () => {
        stopCinematic();
        onGenerate();
    });

    // System preset buttons
    document.querySelectorAll('.system-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const systemSeed = btn.dataset.system;
            document.getElementById('seed-input').value = systemSeed;
            stopCinematic();
            onGenerate();
        });
    });

    // Reset view button
    document.getElementById('reset-view-btn').addEventListener('click', () => {
        stopCinematic();
        camera.targetX = 0;
        camera.targetY = 0;
        camera.targetZoom = 1;
        camera.targetTilt = 0;
        camera.targetRotation = 0;
        camera.following = null;

        document.getElementById('tilt-slider').value = 0;
        document.getElementById('tilt-value').textContent = '0°';
        document.getElementById('rotation-slider').value = 0;
        document.getElementById('rotation-value').textContent = '0°';
    });

    // Screenshot
    document.getElementById('screenshot-btn').addEventListener('click', () => {
        const dataUrl = captureScreenshot();
        const link = document.createElement('a');
        link.download = `solar-system-${state.currentSeed}.png`;
        link.href = dataUrl;
        link.click();
    });

    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen-active');
        } else {
            document.documentElement.requestFullscreen();
            document.body.classList.add('fullscreen-active');
        }
    });

    // Planet list clicks
    document.getElementById('planet-list').addEventListener('click', (e) => {
        const planetItem = e.target.closest('.planet-item');
        if (planetItem && state.solarSystem) {
            const planetId = parseInt(planetItem.dataset.planetId);
            const planet = state.solarSystem.planets.find(p => p.id === planetId);
            if (planet) {
                focusOnPlanet(planet);
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'r':
                camera.targetX = 0;
                camera.targetY = 0;
                camera.targetZoom = 1;
                camera.following = null;
                break;
            case 'g':
                stopCinematic();
                onGenerate();
                break;
            case 'o':
                displayOptions.orbits = !displayOptions.orbits;
                document.querySelector('[data-toggle="orbits"]').classList.toggle('active', displayOptions.orbits);
                break;
            case 'l':
                displayOptions.labels = !displayOptions.labels;
                document.querySelector('[data-toggle="labels"]').classList.toggle('active', displayOptions.labels);
                break;
            case 'h':
                displayOptions.habitable = !displayOptions.habitable;
                document.querySelector('[data-toggle="habitable"]').classList.toggle('active', displayOptions.habitable);
                break;
            case 'f':
                document.getElementById('fullscreen-btn').click();
                break;
            case ' ':
            case 'c':
                e.preventDefault();
                if (cinematic.active) {
                    stopCinematic();
                } else {
                    startCinematic();
                }
                break;
            case 'escape':
                stopCinematic();
                if (state.selectedObject) {
                    state.solarSystem.planets.forEach(p => p.selected = false);
                    state.selectedObject = null;
                    updateSelectedInfo(null);
                    updateInfoPanel();
                }
                break;
        }
    });
}

function findPlanetAtPosition(worldX, worldY) {
    if (!state.solarSystem) return null;

    for (const planet of state.solarSystem.planets) {
        const pos = getPlanetPosition(planet, state.time);
        const dx = worldX - pos.x;
        const dy = worldY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < planet.visualRadius + 10) {
            return planet;
        }
    }
    return null;
}

export function selectPlanet(planet) {
    if (!state.solarSystem) return;

    state.solarSystem.planets.forEach(p => p.selected = false);
    planet.selected = true;
    state.selectedObject = planet;
    updateSelectedInfo(planet);
}

export function focusOnPlanet(planet) {
    selectPlanet(planet);
    camera.following = planet;
    camera.targetZoom = 2;
}

function applyPreset(preset) {
    switch(preset) {
        case 'system':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.5;
            camera.targetTilt = 30;
            camera.targetRotation = 0;
            camera.following = null;
            break;
        case 'top':
            camera.targetTilt = 0;
            camera.targetRotation = 0;
            break;
        case 'angled':
            camera.targetTilt = 45;
            camera.targetRotation = 30;
            break;
        case 'edge':
            camera.targetTilt = -60;
            camera.targetRotation = 0;
            break;
        case 'inner':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 2;
            camera.following = null;
            break;
        case 'outer':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.3;
            camera.following = null;
            break;
        case 'star':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 3;
            camera.following = null;
            break;
        case 'random':
            if (state.solarSystem && state.solarSystem.planets.length > 0) {
                const randomPlanet = state.solarSystem.planets[Math.floor(Math.random() * state.solarSystem.planets.length)];
                focusOnPlanet(randomPlanet);
                updateInfoPanel();
            }
            break;
    }

    // Update slider displays
    document.getElementById('tilt-slider').value = camera.targetTilt;
    document.getElementById('tilt-value').textContent = camera.targetTilt + '°';
    document.getElementById('rotation-slider').value = camera.targetRotation;
    document.getElementById('rotation-value').textContent = camera.targetRotation + '°';
}

// Cinematic mode - structured sequences for engaging camera work
const CINEMATIC_SEQUENCES = {
    // Grand tour: overview then visit planets inner to outer
    grandTour: (planets) => {
        const scenes = [{ type: 'dramatic-open', duration: 1.2 }];
        planets.forEach((planet, i) => {
            scenes.push({ type: 'visit-planet', planet, duration: 0.8, index: i });
        });
        scenes.push({ type: 'pull-back-finale', duration: 1.5 });
        return scenes;
    },

    // Focus on the most interesting objects
    highlights: (planets) => {
        const scenes = [{ type: 'overview-angled', duration: 1 }];

        // Find interesting planets: largest, ringed, most moons, habitable
        const withRings = planets.filter(p => p.hasRings || p.prominentRings);
        const largest = [...planets].sort((a, b) => b.radius - a.radius).slice(0, 2);
        const habitable = planets.filter(p => p.inHabitableZone);
        const withMoons = [...planets].sort((a, b) => b.moons.length - a.moons.length).slice(0, 2);

        const featured = new Set();
        [...largest, ...withRings, ...habitable, ...withMoons].forEach(p => {
            if (p && !featured.has(p.id)) {
                featured.add(p.id);
                scenes.push({ type: 'feature-planet', planet: p, duration: 1.2 });
            }
        });

        scenes.push({ type: 'sweep-around', duration: 1.3 });
        return scenes;
    },

    // Dramatic reveal: start close, pull back majestically
    reveal: (planets) => [
        { type: 'star-closeup', duration: 1 },
        { type: 'slow-pullback', duration: 2 },
        { type: 'tilt-reveal', duration: 1.2 },
        { type: 'outer-system', duration: 1.5 }
    ],

    // Orbit follow: pick a planet and follow it
    orbitFollow: (planets) => {
        const planet = planets[Math.floor(Math.random() * planets.length)];
        return [
            { type: 'overview-quick', duration: 0.6 },
            { type: 'approach-planet', planet, duration: 0.8 },
            { type: 'follow-orbit', planet, duration: 2.5 },
            { type: 'departure-zoom', duration: 1 }
        ];
    }
};

let cinematicQueue = [];
let currentSceneIndex = 0;

function startCinematic() {
    cinematic.active = true;
    cinematic.sceneStart = Date.now();

    // Pick a random sequence type
    const sequenceTypes = Object.keys(CINEMATIC_SEQUENCES);
    const sequenceType = sequenceTypes[Math.floor(Math.random() * sequenceTypes.length)];
    cinematicQueue = CINEMATIC_SEQUENCES[sequenceType](state.solarSystem.planets);
    currentSceneIndex = 0;

    updateCinematicStatus(true);
    executeCurrentScene();
}

export function stopCinematic() {
    cinematic.active = false;
    cinematic.currentScene = null;
    cinematicQueue = [];
    currentSceneIndex = 0;
    updateCinematicStatus(false);
}

function executeCurrentScene() {
    if (!cinematic.active || !state.solarSystem || currentSceneIndex >= cinematicQueue.length) {
        // Sequence complete, start a new one
        if (cinematic.active) {
            startCinematic();
        }
        return;
    }

    const scene = cinematicQueue[currentSceneIndex];
    cinematic.currentScene = scene.type;
    cinematic.sceneStart = Date.now();

    // Calculate actual duration based on user setting
    const baseDuration = scene.duration || 1;
    const actualDuration = baseDuration * cinematic.sceneDuration;

    switch(scene.type) {
        case 'dramatic-open':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.5;
            camera.targetTilt = 35;
            camera.targetRotation = -20;
            camera.following = null;
            break;

        case 'overview-angled':
        case 'overview-quick':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.45;
            camera.targetTilt = 25;
            camera.targetRotation = 15;
            camera.following = null;
            break;

        case 'visit-planet':
        case 'feature-planet':
        case 'approach-planet':
            if (scene.planet) {
                selectPlanet(scene.planet);
                camera.following = scene.planet;
                camera.targetZoom = scene.type === 'feature-planet' ? 2.0 : 1.6;
                camera.targetTilt = scene.planet.hasRings ? 40 : 15;
                camera.targetRotation = (scene.index || 0) * 15 % 60 - 30;
            }
            break;

        case 'follow-orbit':
            if (scene.planet) {
                camera.following = scene.planet;
                camera.targetZoom = 1.8;
                camera.targetTilt = 20;
                // Rotation will naturally change as we follow
            }
            break;

        case 'pull-back-finale':
        case 'departure-zoom':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.35;
            camera.targetTilt = 45;
            camera.targetRotation = 30;
            camera.following = null;
            break;

        case 'star-closeup':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 2.5;
            camera.targetTilt = 0;
            camera.targetRotation = 0;
            camera.following = null;
            break;

        case 'slow-pullback':
            camera.targetZoom = 0.6;
            camera.targetTilt = 20;
            camera.targetRotation = 0;
            camera.following = null;
            break;

        case 'tilt-reveal':
            camera.targetTilt = 50;
            camera.targetRotation = -25;
            break;

        case 'outer-system':
            camera.targetZoom = 0.25;
            camera.targetTilt = 30;
            camera.following = null;
            break;

        case 'sweep-around':
            camera.targetX = 0;
            camera.targetY = 0;
            camera.targetZoom = 0.5;
            camera.targetTilt = 25;
            camera.targetRotation = 120;
            camera.following = null;
            break;
    }
}

export function updateCinematic() {
    if (!cinematic.active || cinematicQueue.length === 0) return;

    const scene = cinematicQueue[currentSceneIndex];
    const baseDuration = scene?.duration || 1;
    const actualDuration = baseDuration * cinematic.sceneDuration;

    const elapsed = Date.now() - cinematic.sceneStart;
    if (elapsed > actualDuration) {
        currentSceneIndex++;
        executeCurrentScene();
    }
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
