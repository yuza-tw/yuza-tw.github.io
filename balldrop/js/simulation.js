import PhysicsEngine from './physicsEngine.js';
import DragManager from './dragManager.js';
import ObjectFactory from './objectFactory.js';

class PhysicsSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.objects = [];
        this.physicsEngine = new PhysicsEngine();
        this.dragManager = new DragManager(canvas, this.objects);
    }
    
    initialize() {
        this.addInitialObjects();
        this.animate = this.animate.bind(this);
    }
    
    addInitialObjects() {
        const sphereCount = 6;
        for (let i = 0; i < sphereCount; i++) {
            let newSphere = ObjectFactory.createRandomSphere(this.canvas.width, this.canvas.height);
            let attempts = 0;
            let overlapping = false;
            
            do {
                overlapping = false;
                
                for (let j = 0; j < this.objects.length; j++) {
                    if (this.physicsEngine.checkCollision(newSphere, this.objects[j])) {
                        overlapping = true;
                        newSphere = ObjectFactory.createRandomSphere(this.canvas.width, this.canvas.height);
                        break;
                    }
                }
                
                attempts++;
            } while (overlapping && attempts < 20);
            
            if (attempts < 20) {
                this.objects.push(newSphere);
            }
        }
        
        const polygonCount = 2;
        for (let i = 0; i < polygonCount; i++) {
            let newPolygon = ObjectFactory.createRandomPolygon(this.canvas.width, this.canvas.height);
            let attempts = 0;
            let overlapping = false;
            
            do {
                overlapping = false;
                
                for (let j = 0; j < this.objects.length; j++) {
                    if (this.physicsEngine.checkCollision(newPolygon, this.objects[j])) {
                        overlapping = true;
                        newPolygon = ObjectFactory.createRandomPolygon(this.canvas.width, this.canvas.height);
                        break;
                    }
                }
                
                attempts++;
            } while (overlapping && attempts < 20);
            
            if (attempts < 20) {
                this.objects.push(newPolygon);
            }
        }
    }
    
    update() {
        this.dragManager.update();
        
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update();
        }
        
        this.physicsEngine.handleCollisions(this.objects);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.ctx);
        }
    }
    
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(this.animate);
    }
    
    start() {
        this.initialize();
        this.animate();
    }
}

export default PhysicsSimulation; 