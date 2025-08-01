(() => {
    if (window.hasRun) return;
    
    class PhysicsSpring {

        particle1;
        particle2;
        length;
        strength;

        constructor(particle1, particle2, length, strength) {
            this.particle1 = particle1;
            this.particle2 = particle2;
            this.length = length;
            this.strength = strength;
        }

        update() {
            let pos1 = this.particle1.position.copy;
            let pos2 = this.particle2.position.copy;
            let lengthDiff = pos1.dist(pos2) - this.length;

            if (lengthDiff !== 0) {
                let p1p2normal = pos2.sub(pos1).normal;

                this.particle1.position.add(p1p2normal.copy.mult(lengthDiff / 2));
                this.particle2.position.add(p1p2normal.copy.mult(lengthDiff / 2).negative);
            }
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

    window.physics.Spring = (particle1, particle2, length, strength) => {
         return new PhysicsSpring(particle1, particle2, length, strength); 
    };
})();