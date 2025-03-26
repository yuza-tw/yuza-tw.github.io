import { closestPointOnLineSegment, distanceSquared } from './utils.js';

class PhysicsEngine {
    constructor() {}
    
    checkCollision(obj1, obj2) {
        if (obj1.type === "sphere" && obj2.type === "sphere") {
            const dx = obj2.x - obj1.x;
            const dy = obj2.y - obj1.y;
            const distanceSquared = dx * dx + dy * dy;
            const minDistance = obj1.radius + obj2.radius;
            return distanceSquared < minDistance * minDistance;
        }
        
        if ((obj1.type === "sphere" && obj2.type === "polygon") || 
            (obj1.type === "polygon" && obj2.type === "sphere")) {
            let sphere, polygon;
            
            if (obj1.type === "sphere") {
                sphere = obj1;
                polygon = obj2;
            } else {
                sphere = obj2;
                polygon = obj1;
            }
            
            let closestDistance = Infinity;
            const n = polygon.worldVertices.length;
            for (let i = 0, j = n - 1; i < n; j = i++) {
                const spherePos = { x: sphere.x, y: sphere.y };
                const point = closestPointOnLineSegment(
                    spherePos,
                    polygon.worldVertices[i],
                    polygon.worldVertices[j]
                );
                
                const distance = distanceSquared(spherePos, point);
                if (distance < closestDistance) closestDistance = distance;
            }
            
            return closestDistance < sphere.radius * sphere.radius;
        }
        
        return false;
    }
    
    resolveCollision(obj1, obj2) {
        if (obj1.type === "sphere" && obj2.type === "sphere") {
            this.resolveSphereToSphereCollision(obj1, obj2);
        }
        else if ((obj1.type === "sphere" && obj2.type === "polygon")) {
            this.resolveSphereToPolygonCollision(obj1, obj2);
        }
        else if ((obj1.type === "polygon" && obj2.type === "sphere")) {
            this.resolveSphereToPolygonCollision(obj2, obj1);
        }   
    }
    
    resolveSphereToSphereCollision(sphere1, sphere2) {
        const dx = sphere2.x - sphere1.x;
        const dy = sphere2.y - sphere1.y;
        const distanceSquared = dx * dx + dy * dy;
        
        const minDistance = sphere1.radius + sphere2.radius;
        if (distanceSquared >= minDistance * minDistance) return;
        
        const distance = Math.sqrt(distanceSquared);
        
        if (distance === 0) {
            const angle = Math.random() * Math.PI * 2;
            const separationDistance = minDistance * 0.1;
            sphere1.x -= Math.cos(angle) * separationDistance;
            sphere1.y -= Math.sin(angle) * separationDistance;
            sphere2.x += Math.cos(angle) * separationDistance;
            sphere2.y += Math.sin(angle) * separationDistance;
            return;
        }
    
        const nx = dx / distance;
        const ny = dy / distance;
    
        const relativeVelocityX = sphere1.vx - sphere2.vx;
        const relativeVelocityY = sphere1.vy - sphere2.vy;
        
        const speedAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;
        
        if (speedAlongNormal < 0) return;
    
        const overlap = minDistance - distance;
        
        const totalMass = sphere1.mass + sphere2.mass;
        const correction1 = (overlap * (sphere2.mass / totalMass));
        const correction2 = (overlap * (sphere1.mass / totalMass));
        
        sphere1.x -= nx * correction1;
        sphere1.y -= ny * correction1;
        sphere2.x += nx * correction2;
        sphere2.y += ny * correction2;
    
        const restitution = 0.6;
        const impulseScalar = -(1 + restitution) * speedAlongNormal / 
                            (1 / sphere1.mass + 1 / sphere2.mass);
        
        sphere1.vx += (impulseScalar * nx) / sphere1.mass;
        sphere1.vy += (impulseScalar * ny) / sphere1.mass;
        sphere2.vx -= (impulseScalar * nx) / sphere2.mass;
        sphere2.vy -= (impulseScalar * ny) / sphere2.mass;
        
        sphere1.vx *= 0.99;
        sphere1.vy *= 0.99;
        sphere2.vx *= 0.99;
        sphere2.vy *= 0.99;
    }
    
    resolveSphereToPolygonCollision(sphere, polygon) {
        let closestDistance = Infinity;
        let closestPoint = null;
        let edgeIndex = -1;
        
        for (let i = 0; i < polygon.worldVertices.length; i++) {
            const nextIndex = (i + 1) % polygon.worldVertices.length;
            const point = closestPointOnLineSegment(
                { x: sphere.x, y: sphere.y },
                polygon.worldVertices[i],
                polygon.worldVertices[nextIndex]
            );
            
            const distance = distanceSquared({ x: sphere.x, y: sphere.y }, point);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
                edgeIndex = i;
            }
        }
        
        if (closestDistance >= sphere.radius * sphere.radius) return;
        
        const distance = Math.sqrt(closestDistance);
        
        const nx = (sphere.x - closestPoint.x) / distance;
        const ny = (sphere.y - closestPoint.y) / distance;
        
        const penetration = sphere.radius - distance;
        
        sphere.x += nx * penetration;
        sphere.y += ny * penetration;
        
        const relativeVelocityX = sphere.vx;
        const relativeVelocityY = sphere.vy;
        
        const speedAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;
        
        if (speedAlongNormal >= 0) return;
        
        const restitution = 0.3;
        const j = -(1 + restitution) * speedAlongNormal * sphere.mass;
        
        sphere.vx += j * nx / sphere.mass;
        sphere.vy += j * ny / sphere.mass;
        
        sphere.vx *= 0.99;
        sphere.vy *= 0.99;
    }
    
    handleCollisions(objects) {
        const passes = 3;
        for (let pass = 0; pass < passes; pass++) {
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    if (this.checkCollision(objects[i], objects[j])) {
                        this.resolveCollision(objects[i], objects[j]);
                    }
                }
            }
        }
    }
}

export default PhysicsEngine; 