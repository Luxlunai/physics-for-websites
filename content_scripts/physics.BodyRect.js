(() => {
    if (window.hasRun) return;
    
    class PhysicsBodyRect {
        static class = PhysicsBodyRect;

        position = physics.Vector(); //physics.Vector
        width = 0; //float
        height = 0; //float
        density = 0; //float
        restitution = 0; //float
        isStatic = false; //bool

        velocity = physics.Vector(); //physics.Vector
        acceleration = physics.Vector(); //physics.Vector
        rotation = 0; //float
        rotationalVelocity = 0; //float

        mass = 0; //float
        area = 0; //float

        vertices = []; //physics.Vector[]
        transformedVertices = []; //physics.Vector[]

        transformUpdateRequired = false; //bool

        constructor(position, width, height, density = 1, restitution = 1, isStatic = false) {
            this.position = position;
            this.width = width;
            this.height = height
            this.density = density;
            this.restitution = restitution;

            this.isStatic = isStatic;

            this.area = this.width * this.height;
            this.mass = this.area * this.density;

            this.vertices = [
                physics.Vector(-this.width / 2, -this.height / 2), //top-left
                physics.Vector(this.width / 2, -this.height / 2), //top-right
                physics.Vector(this.width / 2, this.height / 2), //bottom-right
                physics.Vector(-this.width / 2, this.height / 2), //bottom-left
            ]
            this.transformUpdateRequired = true;
        }

        getTransformedVertices() {
            if(this.transformUpdateRequired) {
                this.vertices.forEach((v, i) => {
                    this.transformedVertices[i] = v.transform(this.position, this.rotation)
                })
            }
            return this.transformedVertices;
        }

        update(steps = 1) {
            this.velocity = this.velocity.add(this.acceleration.mult(steps));
            this.position = this.position.add(this.velocity.mult(steps));
            this.rotation += this.rotationalVelocity * steps;
        }
    }

    window.physics.BodyRect = (position, width, height, density, restitution, isStatic) => { 
        return new PhysicsBodyRect(position, width, height, density, restitution, isStatic ); 
    };
})();