// Random Events System
// Manages spawning and lifecycle of interstellar objects

import { CONFIG } from '../config.js';
import { INTERSTELLAR_TYPES, EVENT_CONFIG } from '../constants/interstellar.js';
import { PHYSICS } from '../constants/physics.js';
import {
    generateInterstellarComet,
    generateRoguePlanet,
    generateRogueBlackHole,
    generatePassingSystem,
    getInterstellarPosition
} from '../generation/interstellar.js';

// Event state
export const eventState = {
    interstellarObjects: [],
    passingSystems: [],
    lastCheck: 0,
    eventLog: [],
    notifications: []
};

// Check for new events
export function checkForEvents(rng, star, time) {
    // Only check periodically
    if (time - eventState.lastCheck < EVENT_CONFIG.checkInterval / CONFIG.timeScale) {
        return;
    }
    eventState.lastCheck = time;

    // Probability scales with time speed (faster time = more events)
    const adjustedProbability = EVENT_CONFIG.baseProbability * Math.sqrt(CONFIG.timeScale);

    // Check if we should spawn a new object
    if (rng.next() < adjustedProbability) {
        spawnInterstellarObject(rng, star, time);
    }

    // Update existing objects and remove those that have left
    updateInterstellarObjects(time);
}

// Spawn a new interstellar object
function spawnInterstellarObject(rng, star, time) {
    // Check limits
    const objectCount = eventState.interstellarObjects.length;
    const systemCount = eventState.passingSystems.length;

    if (objectCount >= EVENT_CONFIG.maxActiveObjects && systemCount >= EVENT_CONFIG.maxPassingSystems) {
        return;
    }

    // Select type based on probabilities
    const roll = rng.next();
    let cumProb = 0;
    let selectedType = null;

    for (const [key, type] of Object.entries(INTERSTELLAR_TYPES)) {
        cumProb += type.probability;
        if (roll < cumProb) {
            selectedType = key;
            break;
        }
    }

    if (!selectedType) selectedType = 'interstellarComet';

    // Check type-specific limits
    if (selectedType === 'passingSystem' && systemCount >= EVENT_CONFIG.maxPassingSystems) {
        selectedType = 'interstellarComet';
    }

    // Generate the object
    let obj;
    switch (selectedType) {
        case 'interstellarComet':
            obj = generateInterstellarComet(rng, star);
            break;
        case 'roguePlanet':
            obj = generateRoguePlanet(rng, star);
            break;
        case 'rogueBlackHole':
            obj = generateRogueBlackHole(rng, star);
            break;
        case 'passingSystem':
            obj = generatePassingSystem(rng, star);
            break;
        default:
            obj = generateInterstellarComet(rng, star);
    }

    // Add to appropriate list
    if (selectedType === 'passingSystem') {
        eventState.passingSystems.push(obj);
    } else {
        eventState.interstellarObjects.push(obj);
    }

    // Add notification
    addNotification(obj, 'detected', time);

    // Log the event
    eventState.eventLog.push({
        type: 'spawn',
        object: obj,
        time: time
    });
}

// Update positions and lifecycle of objects
function updateInterstellarObjects(time) {
    // Update interstellar objects
    eventState.interstellarObjects = eventState.interstellarObjects.filter(obj => {
        const pos = getInterstellarPosition(obj, time);

        // Check if object has passed through and is now leaving
        if (pos.distanceAU > EVENT_CONFIG.despawnDistance) {
            if (!obj.despawned) {
                obj.despawned = true;
                addNotification(obj, 'departed', time);
                eventState.eventLog.push({
                    type: 'despawn',
                    object: obj,
                    time: time
                });
            }
            return false; // Remove from list
        }

        // Check for perihelion passage
        if (!obj.reachedPerihelion && pos.trueAnomaly > -0.1 && pos.trueAnomaly < 0.1) {
            obj.reachedPerihelion = true;
            addNotification(obj, 'perihelion', time);
        }

        return true;
    });

    // Update passing systems
    eventState.passingSystems = eventState.passingSystems.filter(sys => {
        const pos = getInterstellarPosition(sys, time);

        if (pos.distanceAU > EVENT_CONFIG.despawnDistance * 1.5) {
            if (!sys.despawned) {
                sys.despawned = true;
                addNotification(sys, 'departed', time);
            }
            return false;
        }

        // Update planet positions within the system
        sys.planets.forEach(planet => {
            planet.angle += planet.orbitSpeed * CONFIG.timeScale;
        });

        return true;
    });
}

// Add a notification
function addNotification(obj, eventType, time) {
    let message;
    let priority;

    switch (eventType) {
        case 'detected':
            priority = obj.type === 'rogueBlackHole' ? 'high' :
                       obj.type === 'passingSystem' ? 'high' : 'normal';
            message = `${obj.typeName} detected: ${obj.name}`;
            break;
        case 'perihelion':
            priority = 'normal';
            message = `${obj.name} at closest approach`;
            break;
        case 'departed':
            priority = 'low';
            message = `${obj.name} has left the system`;
            break;
        default:
            message = `Event: ${obj.name}`;
            priority = 'low';
    }

    eventState.notifications.push({
        id: Date.now(),
        message,
        priority,
        time,
        read: false,
        object: obj
    });

    // Keep only last 20 notifications
    if (eventState.notifications.length > 20) {
        eventState.notifications.shift();
    }
}

// Get unread notifications
export function getUnreadNotifications() {
    return eventState.notifications.filter(n => !n.read);
}

// Mark notification as read
export function markNotificationRead(id) {
    const notif = eventState.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
}

// Mark all notifications as read
export function markAllNotificationsRead() {
    eventState.notifications.forEach(n => n.read = true);
}

// Clear all interstellar objects (for system regeneration)
export function clearInterstellarObjects() {
    eventState.interstellarObjects = [];
    eventState.passingSystems = [];
    eventState.eventLog = [];
    eventState.notifications = [];
    eventState.lastCheck = 0;
}

// Get all active interstellar objects for rendering
export function getActiveInterstellarObjects() {
    return eventState.interstellarObjects;
}

// Get all passing systems for rendering
export function getPassingSystems() {
    return eventState.passingSystems;
}
