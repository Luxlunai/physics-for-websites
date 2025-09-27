(() => {
    if (window.hasRun) return;
    
    class PhysicsCollisions {
        constructor() {}

        static intersectWindow(vertices) {
            let normal;
            let depth = Infinity;

            for (let i = 0; i < vertices.length; i++) {
                if(vertices[i].x < 0) {
                    return {
                        "depth": 0 - vertices[i].x,
                        "normal": physics.Vector(-1, 0)
                    };
                } else if (vertices[i].x > window.innerWidth) {
                    return {
                        "depth": vertices[i].x - window.innerWidth,
                        "normal": physics.Vector(1, 0) 
                    };
                } else if (vertices[i].y < 0) {
                    return { 
                        "depth": 0 - vertices[i].y,
                        "normal": physics.Vector(0, -1) 
                    };
                } else if (vertices[i].y > window.innerHeight){
                    return {
                        "depth": vertices[i].y - window.innerHeight,
                        "normal": physics.Vector(0, 1) 
                    };
                }
            }
            return false;
        }

        static resolveWindow(body, normal) {
            let e = body.restitution;
            let j = -(1 + e) * body.velocity.negative.dot(normal);
            j /= (1 / body.mass);

            body.velocity = body.velocity.sub(normal.mult(j / body.mass));
        }

        /**
         * 
         * @param {[PhysicsVector]} vertices1 
         * @param {[PhysicsVector]} vertices2 
         * @returns {{
         *  depth: number,
         *  normal: PhysicsVector
         * }}
         */
        static intersectPolygons(vertices1, vertices2) {

            let normal;
            let depth = Infinity;

            for (let i = 0; i < vertices1.length; i++) {
                let v1 = vertices1[i];
                let v2 = vertices1[(i + 1) % vertices1.length];

                let edge = v2.sub(v1);
                let axis = edge.orthogonal.normal;

                let min1 = Infinity;
                let max1 = -Infinity;
                vertices1.forEach((vertex) =>  {
                    let projection = vertex.dot(axis);
                    min1 = projection < min1 ? projection : min1;
                    max1 = projection > max1 ? projection : max1;
                });  

                let min2 = Infinity;
                let max2 = -Infinity;
                vertices2.forEach((vertex) => {
                    let projection = vertex.dot(axis);
                    min2 = projection < min2 ? projection : min2;
                    max2 = projection > max2 ? projection : max2;
                });

                if(min1 >= max2 || min2 >= max1) {
                    return false;
                }

                let axisDepth = Math.min(max2 - min1, max1 - min2);

                if(axisDepth < depth) {
                    depth = axisDepth;
                    normal = axis;
                }
            }

            for(let i = 0; i < vertices2.length; i++) {
                let v1 = vertices2[i];
                let v2 = vertices2[(i + 1) % vertices2.length];

                let edge = v2.sub(v1);
                let axis = edge.orthogonal.normal;

                let min2 = Infinity;
                let max2 = -Infinity;
                vertices2.forEach((vertex) => {
                    let projection = vertex.dot(axis);
                    min2 = projection < min2 ? projection : min2;
                    max2 = projection > max2 ? projection : max2;
                });   

                let min1 = Infinity;
                let max1 = -Infinity;
                vertices1.forEach((vertex) => {
                    let projection = vertex.dot(axis);
                    min1 = projection < min1 ? projection : min1;
                    max1 = projection > max1 ? projection : max1;
                });

                if(min1 >= max2 || min2 >= max1) {
                    return false;
                }

                let axisDepth = Math.min(max2 - min1, max1 - min2);

                if(axisDepth < depth) {
                    depth = axisDepth;
                    normal = axis;
                }
            }

            let centerVertices1 = PhysicsCollisions.getCenter(vertices1);
            let centerVertices2 = PhysicsCollisions.getCenter(vertices2);
            let direction = centerVertices2.sub(centerVertices1);

            if (direction.dot(normal) < 0) {
               normal = normal.negative; 
            }

            return {"depth": depth, "normal": normal};
        }

        static getCenter(vertices) {
            let sumX = 0;
            let sumY = 0;
            vertices.forEach((vertex) => {
                sumX += vertex.x;
                sumY += vertex.y;
            });
            return physics.Vector(sumX / vertices.length, sumY / vertices.length);
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
            console.log(impulse.mult(body1.invMass))
        }

        static resolvePolygonsWithRotation(body1, body2, normal, contactPoint1, contactPoint2 = null) {

            let contactPoint = contactPoint2
                ? contactPoint1.add(contactPoint2.sub(contactPoint1).div(2))
                : contactPoint1;

            let r1 = contactPoint.sub(body1.position);
            let r2 = contactPoint.sub(body2.position);

            let r1Perp = physics.Vector(-r1.y, r1.x);
            let r2Perp = physics.Vector(-r2.y, r2.x);

            let angularVelocity1 = r1Perp.mult(body1.angularVelocity);
            let angularVelocity2 = r2Perp.mult(body2.angularVelocity);

            let relativeVelocity = (body2.velocity.add(angularVelocity2)).sub(body1.velocity.add(angularVelocity1));

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

            body1.velocity = body1.velocity.sub(impulse.mult(body1.invMass));
            body2.velocity = body2.velocity.add(impulse.mult(body2.invMass));
            body1.angularVelocity += -r1.cross(impulse) * body1.invInertia;
            body2.angularVelocity += r2.cross(impulse) * body2.invInertia;

            PhysicsCollisions.applyFriction(body1, body2, normal, r1, r2, r1Perp, r2Perp, relativeVelocity, j);
            
            // if (contactCount === 2) console.log(i, body1.velocity)
        }


        static applyFriction(body1, body2, normal, r1, r2, r1Perp, r2Perp, relativeVelocity, j) {

            let tangent = relativeVelocity.sub(normal.mult(relativeVelocity.dot(normal)));

            if(tangent.approxeq(physics.Vector(0, 0))) return;
            else tangent = tangent.normal;

            let r1PerpDotT = r1Perp.dot(tangent);
            let r2PerpDotT = r2Perp.dot(tangent);

            let denominator = 
                body1.invMass + body2.invMass + 
                ((r1PerpDotT ** 2) * body1.invInertia) + 
                ((r2PerpDotT ** 2) * body2.invInertia);

            let jt = - relativeVelocity.dot(tangent);
            jt /= denominator;

            let frictionImpulse;
            if (Math.abs(jt) <= j * (body1.staticFriction + body2.staticFriction) / 2) {
                frictionImpulse = tangent.mult(jt);
            } else {
                frictionImpulse = tangent.mult(-j * (body1.dynamicFriction + body2.dynamicFriction) / 2)
            }

            body1.velocity = body1.velocity.sub(frictionImpulse.mult(body1.invMass));
            body2.velocity = body2.velocity.add(frictionImpulse.mult(body2.invMass));
            body1.angularVelocity += -r1.cross(frictionImpulse) * body1.invInertia;
            body2.angularVelocity += r2.cross(frictionImpulse) * body2.invInertia;

            console.log(body1.inertia);
        }

        /**
         * 
         * @param {[PhysicsVector]} vertices1 
         * @param {[PhysicsVector]} vertices2 
         * @return {{
         *  contactPoint1: PhysicsVector,
         *  contactPoint2: PhysicsVector,
         *  contacotCount: number
         * }}
         */
        static findContactPoints(vertices1, vertices2) {
            let contactPoint1 = false;
            let contactPoint2 = false;
            let contactCount = 0;

            let minDistSq = Infinity;

            vertices1.forEach((p) => {
                vertices2.forEach((a, i) => {
                    let b = vertices2[(i+1) % vertices2.length];
                    let result = PhysicsCollisions.pointSegmentDistance(p, a, b)
                    if(physics.approxeq(result.distanceSquared, minDistSq)) {
                        if (!result.contactPoint.approxeq(contactPoint1)) {
                            contactPoint2 = result.contactPoint;
                            contactCount = 2;
                        }
                    }
                    if(result.distanceSquared < minDistSq) {
                        minDistSq = result.distanceSquared;
                        contactCount = 1;
                        contactPoint1 = result.contactPoint;
                    }
                });
            });

            vertices2.forEach((p) => {
                vertices1.forEach((a, i) => {
                    let b = vertices1[(i+1) % vertices1.length];
                    let result = PhysicsCollisions.pointSegmentDistance(p, a, b)
                    if(physics.approxeq(result.distanceSquared, minDistSq)) {
                        if (!result.contactPoint.approxeq(contactPoint1)) {
                            contactPoint2 = result.contactPoint;
                            contactCount = 2;
                        }
                    }
                    if(result.distanceSquared < minDistSq) {
                        minDistSq = result.distanceSquared;
                        contactCount = 1;
                        contactPoint1 = result.contactPoint;
                    }
                });
            });

            return {
                "contactPoint1": contactPoint1,
                "contactPoint2": contactPoint2,
                "contactCount": contactCount,
            }
        }

        /**
         * 
         * @param {PhysicsVector} p 
         * @param {PhysicsVector} a 
         * @param {PhysicsVector} b 
         * @returns {{contactPoint: PhysicsVector, distanceSquared: number}}
         */
        static pointSegmentDistance(p, a, b) {
            let ab = b.sub(a);
            let ap = p.sub(a);
            let projection = ap.dot(ab);
            let d = projection / ab.lengthSq;
            let contactPoint = d <= 0 ? a : d >= 1 ? b : a.add(ab.mult(d));
            return {
                "contactPoint": contactPoint,
                "distanceSquared": p.distSq(contactPoint),
            }
        }
    }

    window.physics.Collisions = PhysicsCollisions;
})();