(() => {
    if (window.hasRun) return;
    
    class PhysicsVector {
        x = 0.0;
        y = 0.0;

        constructor(x = 0.0, y = 0.0) {
            this.x = x;
            this.y = y;
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

        transform(translationVector, rotationAngle) {
            return new PhysicsVector(
                Math.cos(rotationAngle) * this.x - Math.sin(rotationAngle) * this.y + translationVector.x,
                Math.sin(rotationAngle) * this.x + Math.cos(rotationAngle) * this.y + translationVector.y
            );
        }

        add(vector) {
            if (physics.isVector(vector)) {
                return new PhysicsVector(
                    this.x + vector.x,
                    this.y + vector.y
                );
            } else if (typeof vector === "number") {
                return new PhysicsVector(
                    this.x + vector,
                    this.y + vector
                );
            } else {
                throw new Error("incorrect parameters in physics.Vector.add");
            }
        }

        sub(vector) {
            return this.add(physics.isVector(vector) ? vector.negative : -vector);
        }

        mult(vector) {
            if (physics.isVector(vector)) {
                return new PhysicsVector(
                    this.x * vector.x,
                    this.y * vector.y
                );
            } else if (typeof x === "number") {
                return new PhysicsVector(
                    this.x * vector,
                    this.y * vector
                );
            } else {
                throw new Error("incorrect parameters in physics.Vector.mult");
            }
        }

        div(vector) {
            return this.add(physics.isVector(vector) ? vector.percentile : 1 / vector);
        }

        dot(vector) {
            return this.x * vector.x + this.y * vector.y; 
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
            return new PhysicsVector(this.x / length, this.y / length);
        }

        get orthogonal() {
            return new PhysicsVector(this.y, -this.x);
        }
    }

    window.physics.Vector = (x, y) => { return new PhysicsVector(x, y); };
})();