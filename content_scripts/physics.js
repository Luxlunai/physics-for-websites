(() => {
    if (window.hasRun) return;
    
    window.physics = class Physics {
        static Loop;
        static Vector;
        static Particle;
        static window;

        static _instance;

        loop = null;
        objects = [];
        collisions = [];

        constructor() {
            this.loop = Physics.Loop(this.update.bind(this));
        }

        update() {
            this.objects.forEach((e) => {
                e.update();
            });
            this.collisions.forEach((c) => {
                c.collidableObject.colliders.forEach((collides) => {
                    let vector = collides(c.physicsObject.x, c.physicsObject.y);
                    if (vector) {
                        c.physicsObject.velocity.mult(vector);
                    }
                }) 
            });
        }

        static add(physicsObject) {
            Physics.instance.objects.push(physicsObject);
        }

        static collide(physicsObject, collidableObject) {
            Physics.instance.collisions.push({
                physicsObject: physicsObject,
                collidableObject: collidableObject
            });
        }
        
        static isVector(test) {
            return typeof test === "object" && "x" in test && "y" in test;
        }

        static get instance() {
            Physics._instance = Physics._instance || new Physics();
            return Physics._instance
        }

        static get loop() {
            return Physics.instance.loop
        }
    }
})();