import { getRandomColor, darkenColor } from './utils.js';
import ImageCache from './imageCache.js';

const imageCache = new ImageCache();

class Sphere {
    constructor(x, y, radius, mass = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0.5;
        this.color = getRandomColor();
        this.type = "sphere";
        
        this.image = imageCache.getSphereImage(this.radius, this.color);
    }

    update() {
        this.vx += this.ax;
        this.vy += this.ay;
        this.x += this.vx;
        this.y += this.vy;

        const restitution = 0.5;
        const r = this.radius;
        
        // Get canvas dimensions from the canvas element
        const canvas = document.getElementById('canvas');
        
        if (this.x - r < 0) {
            this.x = r;
            this.vx *= -restitution;
        }
        else if (this.x + r > canvas.width) {
            this.x = canvas.width - r;
            this.vx *= -restitution;
        }
        if (this.y - r < 0) {
            this.y = r;
            this.vy *= -restitution;
        }
        else if (this.y + r > canvas.height) {
            this.y = canvas.height - r;
            this.vy *= -restitution;
        }
    }

    draw(ctx) {
        ctx.drawImage(
            this.image, 
            this.x - this.radius - this.radius * 0.1, 
            this.y - this.radius - this.radius * 0.1
        );
    }
}

class ConvexPolygon {
    constructor(x, y, vertices, mass = Infinity) {
        this.x = x;
        this.y = y;
        this.vertices = vertices;
        this.mass = mass;
        this.angle = 0;
        this.color = getRandomColor();
        this.type = "polygon";
        this.worldVertices = this.updateWorldVertices();
    }
    
    updateWorldVertices() {
        const worldVertices = [];
        for (let i = 0; i < this.vertices.length; i++) {
            const c = Math.cos(this.angle);
            const s = Math.sin(this.angle);
            const vx = this.vertices[i].x;
            const vy = this.vertices[i].y;
            worldVertices.push({
                x: vx * c - vy * s + this.x,
                y: vy * c + vx * s + this.y
            });
        }
        return worldVertices;
    }

    update() {
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.worldVertices[0].x, this.worldVertices[0].y + 5);
        for (let i = 1; i < this.worldVertices.length; i++) {
            ctx.lineTo(this.worldVertices[i].x, this.worldVertices[i].y + 5);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.worldVertices[0].x, this.worldVertices[0].y);
        for (let i = 1; i < this.worldVertices.length; i++) {
            ctx.lineTo(this.worldVertices[i].x, this.worldVertices[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.worldVertices[0].x, this.worldVertices[0].y);
        for (let i = 1; i < this.worldVertices.length; i++) {
            ctx.lineTo(this.worldVertices[i].x, this.worldVertices[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = darkenColor(this.color, 20);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export { Sphere, ConvexPolygon }; 