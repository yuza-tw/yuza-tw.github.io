import { lightenColor, darkenColor } from './utils.js';

class ImageCache {
    constructor() {
        this.cache = new Map();
    }
    
    getKey(radius, color) {
        return `${radius}_${color}`;
    }
    
    getSphereImage(radius, color) {
        const key = this.getKey(radius, color);
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const sphereCanvas = document.createElement('canvas');
        sphereCanvas.width = radius * 2.2;
        sphereCanvas.height = radius * 2.2;
        const sphereCtx = sphereCanvas.getContext('2d');
        
        sphereCtx.beginPath();
        sphereCtx.arc(radius * 1.1, radius * 1.1 + radius * 0.1, radius * 0.8, 0, Math.PI * 2);
        sphereCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        sphereCtx.fill();
        
        sphereCtx.beginPath();
        sphereCtx.arc(radius * 1.1, radius * 1.1, radius, 0, Math.PI * 2);
        
        const gradient = sphereCtx.createRadialGradient(
            radius * 1.1 - radius * 0.3, radius * 1.1 - radius * 0.3, 0,
            radius * 1.1, radius * 1.1, radius
        );
        gradient.addColorStop(0, lightenColor(color, 30));
        gradient.addColorStop(1, darkenColor(color, 20));
        
        sphereCtx.fillStyle = gradient;
        sphereCtx.fill();
        
        sphereCtx.beginPath();
        sphereCtx.arc(radius * 1.1 - radius * 0.3, radius * 1.1 - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        sphereCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        sphereCtx.fill();
        
        this.cache.set(key, sphereCanvas);
        return sphereCanvas;
    }
    
    clear() {
        this.cache.clear();
    }
}

export default ImageCache; 