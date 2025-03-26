import ObjectFactory from './objectFactory.js';

class DragManager {
    constructor(canvas, objects) {
        this.canvas = canvas;
        this.objects = objects;
        this.isDragging = false;
        this.draggedObject = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.previousX = 0;
        this.previousY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    isPointInPolygon(x, y, vertices) {
        let inside = false;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x;
            const yi = vertices[i].y;
            const xj = vertices[j].x;
            const yj = vertices[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) && 
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.previousX = x;
        this.previousY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            
            if (obj.type === "sphere") {
                const dx = obj.x - x;
                const dy = obj.y - y;
                const distanceSquared = dx * dx + dy * dy;
                
                if (distanceSquared <= obj.radius * obj.radius) {
                    this.isDragging = true;
                    this.draggedObject = obj;
                    this.dragOffsetX = dx;
                    this.dragOffsetY = dy;
                    
                    this.draggedObject.vx = 0;
                    this.draggedObject.vy = 0;
                    return;
                }
            } else if (obj.type === "polygon") {
                if (this.isPointInPolygon(x, y, obj.worldVertices)) {
                    this.isDragging = true;
                    this.draggedObject = obj;
                    this.dragOffsetX = obj.x - x;
                    this.dragOffsetY = obj.y - y;
                    return;
                }
            }
        }
        
        this.createNewObject(x, y);
    }
    
    update() {
        if (this.isDragging && this.draggedObject) {
            if (this.draggedObject.type === "sphere") {
                this.draggedObject.x = this.previousX + this.dragOffsetX;
                this.draggedObject.y = this.previousY + this.dragOffsetY;
                this.draggedObject.vx = this.velocityX;
                this.draggedObject.vy = this.velocityY;
            }
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging && this.draggedObject) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.draggedObject.type === "sphere") {
                this.velocityX = x - this.previousX;
                this.velocityY = y - this.previousY;
            }
            
            this.previousX = x;
            this.previousY = y;
            
            this.draggedObject.x = x + this.dragOffsetX;
            this.draggedObject.y = y + this.dragOffsetY;
            
            if (this.draggedObject.type === "sphere") {
                this.keepSphereInBounds(this.draggedObject);
            }
            
            if (this.draggedObject.type === "polygon") {
                this.draggedObject.worldVertices = this.draggedObject.updateWorldVertices();
            }
        }
    }
    
    handleMouseUp() {
        if (this.isDragging && this.draggedObject && this.draggedObject.type === "sphere") {
            const velocityMultiplier = 0.8;
            this.draggedObject.vx = this.velocityX * velocityMultiplier;
            this.draggedObject.vy = this.velocityY * velocityMultiplier;
        }
        
        this.isDragging = false;
        this.draggedObject = null;
    }
    
    handleMouseLeave() {
        if (this.isDragging && this.draggedObject && this.draggedObject.type === "sphere") {
            const velocityMultiplier = 0.8;
            this.draggedObject.vx = this.velocityX * velocityMultiplier;
            this.draggedObject.vy = this.velocityY * velocityMultiplier;
        }
        
        this.isDragging = false;
        this.draggedObject = null;
    }
    
    keepSphereInBounds(sphere) {
        if (sphere.x - sphere.radius < 0) {
            sphere.x = sphere.radius;
        }
        if (sphere.x + sphere.radius > this.canvas.width) {
            sphere.x = this.canvas.width - sphere.radius;
        }
        if (sphere.y - sphere.radius < 0) {
            sphere.y = sphere.radius;
        }
        if (sphere.y + sphere.radius > this.canvas.height) {
            sphere.y = this.canvas.height - sphere.radius;
        }
    }
    
    createNewObject(x, y) {
        if (Math.random() < 0.7) {
            const radius = 20 + Math.random() * 30;
            const newSphere = ObjectFactory.createSphereAt(x, y, radius, radius / 20);
            newSphere.vx = (Math.random() - 0.5) * 3;
            newSphere.vy = (Math.random() - 0.5) * 2;
            this.objects.push(newSphere);
        } else {
            const sides = 3 + Math.floor(Math.random() * 5);
            const radius = 30 + Math.random() * 30;
            const newPolygon = ObjectFactory.createPolygonAt(x, y, sides, radius);
            this.objects.push(newPolygon);
        }
    }
}

export default DragManager; 