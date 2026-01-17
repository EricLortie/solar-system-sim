// Camera State and Transform Functions

export const camera = {
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
    following: null,
    tilt: 0,
    targetTilt: 0,
    rotation: 0,
    targetRotation: 0
};

export function resetCamera() {
    camera.x = 0;
    camera.y = 0;
    camera.zoom = 1;
    camera.targetX = 0;
    camera.targetY = 0;
    camera.targetZoom = 1;
    camera.following = null;
    camera.tilt = 0;
    camera.targetTilt = 0;
    camera.rotation = 0;
    camera.targetRotation = 0;
}

export function updateCamera() {
    // Smooth camera movement
    const lerpFactor = 0.08;
    camera.x += (camera.targetX - camera.x) * lerpFactor;
    camera.y += (camera.targetY - camera.y) * lerpFactor;
    camera.zoom += (camera.targetZoom - camera.zoom) * lerpFactor;
    camera.tilt += (camera.targetTilt - camera.tilt) * lerpFactor;
    camera.rotation += (camera.targetRotation - camera.rotation) * lerpFactor;
}

export function worldToScreen(x, y, canvas) {
    return {
        x: (x - camera.x) * camera.zoom + canvas.width / 2,
        y: (y - camera.y) * camera.zoom + canvas.height / 2
    };
}

export function screenToWorld(x, y, canvas) {
    return {
        x: (x - canvas.width / 2) / camera.zoom + camera.x,
        y: (y - canvas.height / 2) / camera.zoom + camera.y
    };
}

export function applyTransform(x, y) {
    const rotRad = camera.rotation * Math.PI / 180;
    const rotX = x * Math.cos(rotRad) - y * Math.sin(rotRad);
    const rotY = x * Math.sin(rotRad) + y * Math.cos(rotRad);
    const tiltFactor = Math.cos(camera.tilt * Math.PI / 180);
    return { x: rotX, y: rotY * tiltFactor };
}

// Zoom-aware scaling to reduce clutter at low zoom levels
// Uses non-linear scaling: objects shrink faster when zoomed out
export function getZoomScale(baseSize, options = {}) {
    const {
        minSize = 0.5,
        maxSize = 50,
        zoomPower = 0.7,  // < 1 means objects shrink faster when zoomed out
        threshold = 0.3   // Below this zoom, objects shrink more aggressively
    } = options;

    let scale;
    if (camera.zoom < threshold) {
        // Aggressive shrinking at very low zoom
        scale = Math.pow(camera.zoom / threshold, 1.5) * Math.pow(threshold, zoomPower);
    } else {
        // Normal non-linear scaling
        scale = Math.pow(camera.zoom, zoomPower);
    }

    const size = baseSize * scale;
    return Math.max(minSize, Math.min(maxSize, size));
}

// Density-based culling - skip rendering some objects when zoomed out
export function shouldRenderAtZoom(index, totalCount, objectType = 'asteroid') {
    if (camera.zoom >= 0.5) return true; // Render all when reasonably zoomed in

    // Calculate how many to skip based on zoom level and object type
    // Kuiper belt objects are farther out, so we can cull them more aggressively
    const densityThresholds = {
        'asteroid': 0.3,
        'kuiper': 0.4,
        'trojan': 0.35
    };
    const density = densityThresholds[objectType] || 0.3;
    const renderRatio = Math.max(0.05, camera.zoom / density);
    const skipInterval = Math.max(1, Math.floor(1 / renderRatio));

    return index % skipInterval === 0;
}
