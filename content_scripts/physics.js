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
        
        static resolvePolygons(body1, body2, normal, depth) {

            let relativeVelocity = body2.velocity.sub(body1.velocity);

            if (relativeVelocity.dot(normal) > 0) return;

            let e = Math.min(body1.restitution, body2.restitution);
            let j = -(1 + e) * relativeVelocity.dot(normal);
            j /= body1.invMass + body2.invMass;
            
            let impulse = normal.mult(j); 

            body1.velocity = body1.velocity.sub(impulse.mult(body1.invMass));
            body2.velocity = body2.velocity.add(impulse.mult(body2.invMass));
        }

        static resolvePolygonsWithRotation(body1, body2, normal, depth, contactPoint1, contactPoint2 = null) {

            let contactPoint = contactPoint2
                ? contactPoint1.add(contactPoint2.sub(contactPoint1).div(2))
                : contactPoint1;

            let r1 = contactPoint.sub(body1.position);
            let r2 = contactPoint.sub(body2.position);

            let r1Perp = r1.orthogonal.negative;
            let r2Perp = r2.orthogonal.negative;

            let rotationalLinearVelocity1 = r1Perp.mult(body1.rotationalVelocity);
            let rotationalLinearVelocity2 = r2Perp.mult(body2.rotationalVelocity);

            let relativeVelocity1 = body1.velocity.add(rotationalLinearVelocity1);
            let relativeVelocity2 = body2.velocity.add(rotationalLinearVelocity2);
            let relativeVelocity = relativeVelocity2.sub(relativeVelocity1);

            let contactVelocityMag = relativeVelocity.dot(normal);
            if (contactVelocityMag > 0) return;

            let r1PerpDotN = r1Perp.dot(normal);
            let r2PerpDotN = r2Perp.dot(normal);

            let denominator = 
                body1.invMass + body2.invMass + 
                ((r1PerpDotN ** 2) * body1.invInertia) + 
                ((r2PerpDotN ** 2) * body2.invInertia);
            
            let e = Math.min(body1.restitution, body2.restitution);

            let j = -(1 + e) * contactVelocityMag;
            j /= denominator;

            let impulse = normal.mult(j);
            if (impulse.approxeq(physics.Vector(0, 0))) return;

            body1.velocity = body1.velocity.sub(impulse.mult(body1.invMass));
            body2.velocity = body2.velocity.add(impulse.mult(body2.invMass));
            body1.rotationalVelocity += -r1.cross(impulse) * body1.invInertia;
            body2.rotationalVelocity += r2.cross(impulse) * body2.invInertia;

            // friction:
            let tangent = relativeVelocity.sub(normal.mult(relativeVelocity.dot(normal)));

            if(tangent.approxeq(physics.Vector(0, 0))) return;
            else tangent = tangent.normal;

            let r1PerpDotT = r1Perp.dot(tangent);
            let r2PerpDotT = r2Perp.dot(tangent);

            denominator = 
                body1.invMass + body2.invMass + 
                ((r1PerpDotT ** 2) * body1.invInertia) + 
                ((r2PerpDotT ** 2) * body2.invInertia);

            let jt = - relativeVelocity.dot(tangent);
            jt /= denominator;

            let frictionImpulse;
            if (Math.abs(jt) <= j * ((body1.staticFriction + body2.staticFriction) / 2)) {
                frictionImpulse = tangent.mult(jt);
            } else {
                frictionImpulse = tangent.mult(-j * ((body1.dynamicFriction + body2.dynamicFriction) / 2))
            }

            body1.velocity = body1.velocity.sub(frictionImpulse.mult(body1.invMass));
            body2.velocity = body2.velocity.add(frictionImpulse.mult(body2.invMass));
            body1.rotationalVelocity += -r1.cross(frictionImpulse) * body1.invInertia;
            body2.rotationalVelocity += r2.cross(frictionImpulse) * body2.invInertia;
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