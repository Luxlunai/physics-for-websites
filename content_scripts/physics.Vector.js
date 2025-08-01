(() => {
    if (window.hasRun) return;
    
    class PhysicsVector {
        x = 0.0;
        y = 0.0;

        constructor(x = 0.0, y = 0.0) {
            this.x = x;
            this.y = y;
        }

        add(x, y = null) {
            if (physics.isVector(x)) {
                this.x += x.x;
                this.y += x.y;
            } else if (typeof x === "number" && typeof y === "number") {
                this.x += x;
                this.y += y;
            } else if (typeof x === "number" && !y) {
                this.x += x;
                this.y += x;
            } else {
                throw new Error("incorrect parameters in physics.Vector.add");
            }
            return this;
        }

        sub(vector) {
            return this.add(vector.negative);
        }

        mult(x, y = null) {
            if (physics.isVector(x)) {
                this.x *= x.x;
                this.y *= x.y;
            } else if (typeof x === "number" && typeof y === "number") {
                this.x *= x;
                this.y *= y;
            } else if (typeof x === "number" && !y) {
                this.x *= x;
                this.y *= x;
            } else {
                throw new Error("incorrect parameters in physics.Vector.mult");
            }
            return this;
        }

        dist(vector) {
            if (physics.isVector(vector)) {
                return this.copy.sub(vector).length;
            } else {
                throw new Error("incorrect parameter in physics.Vector.sub");
            }
        }

        normalize() {
            let length = this.length;
            this.x /= length;
            this.y /= length;
            return this;
        }

        get copy() {
            return new PhysicsVector(this.x, this.y);
        }

        get string() {
            return `Vector(x: ${this.x}, y: ${this.y})`;
        }
        
        get negative() {
            return new PhysicsVector(-this.x, -this.y);
        }

        get percentile() {
            return new PhysicsVector(1 / this.x, 1 / this.y);
        }

        get length() {
            return Math.sqrt(this.x ** 2 + this.y ** 2);
        }

        get normal() {
            let length = this.length;
            return new PhysicsVector(this.x /= length, this.y /= length);
        }

        get orthogonal() {
            return new PhysicsVector(this.y, -this.x);
        }
    }

    window.physics.Vector = (x, y) => { return new PhysicsVector(x, y); };
})();