import PhysicsSimulation from './simulation.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const simulation = new PhysicsSimulation(canvas);
    simulation.start();
}); 