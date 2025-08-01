(() => {
    if (window.hasRun) return;
    
    class PhysicsBodyRect {

        verteces = [];

        htmlElement;

        constructor(x, y, width, height) {

            this.verteces[0] = physics.Particle(x, y);
            this.verteces[1] = physics.Particle(x + width, y);
            this.verteces[2] = physics.Particle(x + width, y + height);
            this.verteces[3] = physics.Particle(x, y + height);

            this.springs[0] = physics.Spring(this.vertex[0], this.vertex[1], width, 1);
            this.springs[1] = physics.Spring(this.vertex[1], this.vertex[2], height, 1);
            this.springs[2] = physics.Spring(this.vertex[2], this.vertex[3], width, 1);
            this.springs[3] = physics.Spring(this.vertex[3], this.vertex[0], height, 1);

            this.verteces.forEach((particle) => { particle.acceleration = physics.Vector(0, 5); });
        }

        update() {
            this.verteces.forEach((particle) => {
                particle.update();
            });
            this.springs.forEach((spring) => {
                spring.update();
            });
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

    window.physics.BodyRect = (x, y) => { return new PhysicsBodyRect(x, y, width, height); };
})();