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
        angularVelocity = 0; //float

        mass = 0; //float
        invMass = 0; //float
        area = 0; //float
        inertia = 0; //float
        invInertia = 0; //float

        vertices = []; //physics.Vector[]
        _transformedVertices = []; //physics.Vector[]

        transformUpdateRequired = false; //bool

        color = "grey";
        borderColor = "white";
        html = null;

        constructor(position, width, height, density = 1, restitution = 1, isStatic = false) {
            this.position = position;
            this.width = width;
            this.height = height
            this.density = density;
            this.restitution = restitution;

            this.isStatic = isStatic;

            this.area = this.width * this.height;
            this.mass = this.area * this.density;
            this.invMass = !this.isStatic ? 1 / this.mass : 0;

            this.inertia = this.calculateRotationalInertia();
            this.invInertia = !this.isStatic ? 1 / this.inertia : 0;

            this.vertices = [
                physics.Vector(-this.width / 2, -this.height / 2), //top-left
                physics.Vector(this.width / 2, -this.height / 2), //top-right
                physics.Vector(this.width / 2, this.height / 2), //bottom-right
                physics.Vector(-this.width / 2, this.height / 2), //bottom-left
            ]
            this.transformUpdateRequired = true;

            this.html = document.createElement('physics-rect');
            document.body.append(this.html);
            this.html.x = this.position.x;
            this.html.y = this.position.y;
            this.html.width = this.width;
            this.html.height = this.height;
            this.html.rotation = this.rotation;
            this.html.color = this.color;
            this.html.borderColor = this.borderColor;
        }

        update() {
            this.velocity = this.velocity.add(this.acceleration);
            this.position = this.position.add(this.velocity);
            this.rotation += this.angularVelocity;
            this.transformUpdateRequired = true;

            this.html.x = this.position.x;
            this.html.y = this.position.y;
            this.html.width = this.width;
            this.html.height = this.height;
            this.html.rotation = this.rotation;
            this.html.color = this.color;
            this.html.borderColor = this.borderColor;
        }

        calculateRotationalInertia() {
            return (1 / 12) * this.mass * (this.width ** 2 + this.height ** 2);
        }

        get transformedVertices() {
            if(this.transformUpdateRequired) {
                this.vertices.forEach((v, i) => {
                    this._transformedVertices[i] = v.transform(this.position, this.rotation);
                })
                this.transformUpdateRequired = false;
            }
            return this._transformedVertices;
        }
    }

    window.physics.BodyRect = (position, width, height, density, restitution, isStatic) => { 
        return new PhysicsBodyRect(position, width, height, density, restitution, isStatic ); 
    };
})();