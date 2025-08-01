(() => {
    if (window.hasRun) return;
    
    class PhysicsParticle {
        mass = 1.0;
        position;
        velocity;
        acceleration;

        constructor(x, y) {
            this.position = physics.isVector(x)
                ? x 
                : (typeof x === "number" && typeof y === "number") 
                ? physics.Vector(x, y) 
                : false;
            if (!this.position) throw new Error("incorrect parameters in physics.Particle.constructor");
            
            this.velocity = physics.Vector();
            this.acceleration = physics.Vector();
        }

        update() {
            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
        }

        get x() {
            return this.position.x;
        }

        set x(value) {
            this.position.x = value;
        }

        get y() {
            return this.position.y;
        }

        set y(value) {
            this.position.y = value;
        }
    }

    window.physics.Particle = (x, y) => { return new PhysicsParticle(x, y); };
})();