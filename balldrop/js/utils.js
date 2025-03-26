function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function getRandomColor() {
    const colors = [
        '#3498db',
        '#e74c3c',
        '#2ecc71',
        '#f39c12',
        '#9b59b6',
        '#1abc9c',
        '#d35400',
        '#c0392b',
        '#16a085',
        '#8e44ad'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function closestPointOnLineSegment(p, a, b) {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    
    const abLengthSquared = ab.x * ab.x + ab.y * ab.y;
    if (abLengthSquared === 0) return a;
    
    let t = (ap.x * ab.x + ap.y * ab.y) / abLengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    return { 
        x: a.x + ab.x * t, 
        y: a.y + ab.y * t 
    };
}

function distanceSquared(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
}

export { 
    lightenColor, 
    darkenColor, 
    getRandomColor, 
    closestPointOnLineSegment, 
    distanceSquared 
}; 