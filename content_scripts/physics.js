(() => {
    if (window.hasRun) return;
    
    window.physics = class Physics {
        static Loop;
        static Vector;
        static Particle;
        static BodyRect;
        static Collisions;
        static window;

        static _instance;

        loop = null;
        objects = [];
        collisions = [];

        constructor() {
            this.loop = Physics.Loop();
        }

        // update() {
        //     this.objects.forEach((object) => {
        //         object.update();
        //     });
        //     this.collisions.forEach((c) => {
        //         c.collidableObject.colliders.forEach((collides) => {
        //             let vector = collides(c.physicsObject.x, c.physicsObject.y);
        //             if (vector) {
        //                 c.physicsObject.velocity.mult(vector);
        //             }
        //         }) 
        //     });
        // }

        static add(physicsObject) {
            Physics.instance.objects.push(physicsObject);
        }

        static remove(physicsObject) {
            Physics.instance.objects = Physics.instance.objects.filter((object) => object !== physicsObject);
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

        static approxeq(v1, v2, epsilon = 0.001) { Math.abs(v1 - v2) <= epsilon };

        static get instance() {
            Physics._instance = Physics._instance || new Physics();
            return Physics._instance
        }

        static get loop() {
            return Physics.instance.loop
        }
    }
})();