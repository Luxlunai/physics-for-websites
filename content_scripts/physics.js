(() => {
    if (window.hasRun) return;
    
    window.physics = class Physics {
        static Loop;
        static Vector;
        static BodyRect;
        static BodyNode;
        static Collisions;

        static _instance;

        loop = null;

        constructor() {
            this.loop = Physics.Loop();
        }
        
        static isVector(test) {
            return typeof test === "object" && "x" in test && "y" in test;
        }

        static approxeq(v1, v2, epsilon = 0.001) { return Math.abs(v1 - v2) <= epsilon };

        static get instance() {
            Physics._instance = Physics._instance || new Physics();
            return Physics._instance
        }

        static get loop() {
            return Physics.instance.loop
        }
    }
})();