// Global Application State

import { CONFIG } from '../config.js';

export const state = {
    solarSystem: null,
    selectedObject: null,
    time: 0,
    simulationStartTime: Date.now(),
    currentSeed: null,
    isPaused: false
};

export const displayOptions = {
    orbits: true,
    labels: true,
    moons: true,
    asteroids: true,
    comets: true,
    habitable: false,
    trails: false,
    minimap: false,
    interstellar: true
};

export const cinematic = {
    active: false,
    sceneStart: 0,
    sceneDuration: 8000,
    currentScene: null
};

export function resetState() {
    state.solarSystem = null;
    state.selectedObject = null;
    state.time = 0;
    state.simulationStartTime = Date.now();
    state.isPaused = false;
}

export function toggleDisplayOption(option) {
    if (option in displayOptions) {
        displayOptions[option] = !displayOptions[option];
        return displayOptions[option];
    }
    return null;
}
