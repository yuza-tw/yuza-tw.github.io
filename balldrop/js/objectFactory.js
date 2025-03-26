import { Sphere, ConvexPolygon } from './objects.js';

class ObjectFactory {
    static createRandomSphere(canvasWidth, canvasHeight) {
        const minRadius = 15;
        const maxRadius = 40;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const x = radius + Math.random() * (canvasWidth - 2 * radius);
        const y = radius + Math.random() * (canvasHeight - 2 * radius);
        const mass = radius / 15;
        
        const sphere = new Sphere(x, y, radius, mass);
        sphere.vx = (Math.random() - 0.5) * 4;
        sphere.vy = (Math.random() - 0.5) * 4;
        
        return sphere;
    }
    
    static createRandomPolygon(canvasWidth, canvasHeight) {
        const x = 100 + Math.random() * (canvasWidth - 200);
        const y = 100 + Math.random() * (canvasHeight - 200);
        
        const sides = 3 + Math.floor(Math.random() * 5);
        const radius = 30 + Math.random() * 30;
        const vertices = [];
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const vertexRadius = radius * (0.8 + Math.random() * 0.4);
            
            vertices.push({
                x: Math.cos(angle) * vertexRadius,
                y: Math.sin(angle) * vertexRadius
            });
        }
        
        return new ConvexPolygon(x, y, vertices);
    }
    
    static createSphereAt(x, y, radius, mass) {
        return new Sphere(x, y, radius, mass);
    }
    
    static createPolygonAt(x, y, sides, radius) {
        const vertices = [];
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const vertexRadius = radius * (0.8 + Math.random() * 0.4);
            
            vertices.push({
                x: Math.cos(angle) * vertexRadius,
                y: Math.sin(angle) * vertexRadius
            });
        }
        
        return new ConvexPolygon(x, y, vertices);
    }
}

export default ObjectFactory; 