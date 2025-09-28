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
        invMass = 0; //float
        area = 0; //float
        inertia = 0; //float
        invInertia = 0; //float

        staticFriction = 0.6;
        dynamicFriction = 0.4;

        vertices = []; //physics.Vector[]
        transformedVertices = []; //physics.Vector[]
        bBox = {
            max: physics.Vector(0, 0), 
            min: physics.Vector(0, 0)
        }

        color = "grey";
        borderColor = "white";
        html = null;

        constructor(position, width, height, density = 1, restitution = 1, isStatic = false) {
            this.position = position;
            this.width = width;
            this.height = height;
            this.density = density;
            this.restitution = restitution;

            this.isStatic = isStatic;

            this.area = this.width * this.height;
            this.mass = this.area * this.density;
            this.invMass = !this.isStatic ? 1 / this.mass : 0;

            this.inertia = (1 / 12) * this.mass * (this.height ** 2 + this.width ** 2);
            this.invInertia = !this.isStatic ? 1 / this.inertia : 0;

            this.vertices = [
                physics.Vector(-this.width / 2, -this.height / 2), //top-left
                physics.Vector(this.width / 2, -this.height / 2), //top-right
                physics.Vector(this.width / 2, this.height / 2), //bottom-right
                physics.Vector(-this.width / 2, this.height / 2), //bottom-left
            ]
            this.vertices.forEach((v, i) => {
                this.transformedVertices[i] = v.transform(this.position, this.rotation);
            })
            this.calcBBox();

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

        update(updatesPerSecond = 30, gravity = physics.Vector(0, 9.81)) {
            if (this.isStatic) return;

            this.html.x = this.position.x;
            this.html.y = this.position.y;
            this.html.width = this.width;
            this.html.height = this.height;
            this.html.rotation = this.rotation;
            this.html.color = this.color;
            this.html.borderColor = this.borderColor;

            this.velocity = this.velocity.add(gravity.div(updatesPerSecond).add(this.acceleration.div(updatesPerSecond)));
            this.position = this.position.add(this.velocity.div(updatesPerSecond));

            // if the rotation is close to a multiple of PI/2 and the rotational velocity is almost 0,
            // set the rotation to the closest multiple of PI/2 and the rotationl velocity to 0
            if (
                physics.approxeq(this.rotationalVelocity / updatesPerSecond, 0, 0.001) 
                    && physics.approxeq(this.rotation % (Math.PI / 2), 0)
                ) {
                this.rotation = Math.PI / 2 * Math.round(this.rotation / (Math.PI / 2));
                this.rotationalVelocity = 0;
            } else {
                this.rotation += this.rotationalVelocity / updatesPerSecond;
            }

            this.vertices.forEach((v, i) => {
                this.transformedVertices[i] = v.transform(this.position, this.rotation);
            })
            this.calcBBox();
        }

        calcBBox() {
            this.bBox = {
                max: physics.Vector(-Infinity, -Infinity), 
                min: physics.Vector(Infinity, Infinity)
            }
            this.transformedVertices.forEach((v) => {
                this.bBox.max.x = v.x > this.bBox.max.x ? v.x : this.bBox.max.x;
                this.bBox.max.y = v.y > this.bBox.max.y ? v.y : this.bBox.max.y;
                this.bBox.min.x = v.x < this.bBox.min.x ? v.x : this.bBox.min.x;
                this.bBox.min.y = v.y < this.bBox.min.y ? v.y : this.bBox.min.y;
            })
        }
    }

    window.physics.BodyRect = (position, width, height, density, restitution, isStatic) => { 
        return new PhysicsBodyRect(position, width, height, density, restitution, isStatic ); 
    };
})();