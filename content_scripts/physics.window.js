(() => {
    if (window.hasRun) return;
    
    window.physics.window = class PhysicsWindow {
        static colliders = [
            (x ,y ) => { return x > window.innerWidth || x < 0 ? physics.Vector(-1, 1) : false },
            (x, y ) => { return y > window.innerHeight || y < 0 ? physics.Vector(1, -1) : false },
        ];
        constructor() {}
    }
})();