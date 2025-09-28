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

        color = "transparent";
        borderColor = "grey";
        node = null;

        debug = false;
        debugNode = null;

        constructor(position, width, height, density = 1, restitution = 1, isStatic = false, node = null) {

            this.node = node ? node.cloneNode(true) : document.createElement("div");
            this.node.classList.add("physics-body");
            this.node.style.position = "absolute";
            this.node.style.boxSizing = "border-box";
            this.node.style.zIndex = 1000;
            this.node.style.margin = 0;
            document.body.append(this.node);

            if (this.debug) {
                this.debugNode = document.createElement("physics-rect");
                this.debugNode.classList.add("physics-body");
                document.body.append(this.debugNode);
            }

            let bBox = node ? node.getBoundingClientRect() : false;

            this.position = bBox ? physics.Vector(bBox.x + bBox.width / 2, bBox.y + bBox.height / 2) : position;
            this.width = bBox ? bBox.width : width;
            this.height = bBox ? bBox.height : height;
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
            this.bBox = this.calcBBox();

            this.updateNode();
        }

        update(updatesPerSecond = 30, gravity = physics.Vector(0, 9.81)) {
            if (this.isStatic) return;
            
            this.updateNode();

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
            this.bBox = this.calcBBox();
        }

        updateNode() {
            this.node.style.left = this.position.x - this.width / 2 + "px";
            this.node.style.top = this.position.y - this.height / 2 + "px";
            this.node.style.width = this.width + "px";
            this.node.style.height = this.height + "px";
            this.node.style.transform = `rotate(${this.rotation}rad)`;
            this.node.style.backgroundColor = this.color;
            this.node.style.border = `1px solid ${this.borderColor}`;

            if (this.debug) {
                this.debugNode.x = this.position.x;
                this.debugNode.y = this.position.y;
                this.debugNode.width = this.width;
                this.debugNode.height = this.height;
                this.debugNode.rotation = this.rotation;
                this.debugNode.color = "transparent";
                this.debugNode.borderColor = "red";
            }
        }

        calcBBox() {
            let bBox = {
                max: physics.Vector(-Infinity, -Infinity), 
                min: physics.Vector(Infinity, Infinity)
            }
            this.transformedVertices.forEach((v) => {
                bBox.max.x = v.x > bBox.max.x ? v.x : bBox.max.x;
                bBox.max.y = v.y > bBox.max.y ? v.y : bBox.max.y;
                bBox.min.x = v.x < bBox.min.x ? v.x : bBox.min.x;
                bBox.min.y = v.y < bBox.min.y ? v.y : bBox.min.y;
            })
            return bBox;
        }
    }

    window.physics.BodyRect = (position, width, height, density, restitution, isStatic) => { 
        return new PhysicsBodyRect(position, width, height, density, restitution, isStatic ); 
    };
    window.physics.BodyNode = (node, density, restitution, isStatic) => {
        return new PhysicsBodyRect(physics.Vector(), 0, 0, density, restitution, isStatic, node); 
    };
})();