(() => {
    if (window.hasRun) return;
    
    class PhysicsCollisions {
        constructor() {}

        static intersectWindow(vertices) {
            let normal;
            let depth = Infinity;

            for (let i = 0; i < vertices.length; i++) {
                if(vertices[i].x < 0) {
                    return { normal: physics.Vector(-1, 0) };
                } else if (vertices[i].x > window.innerWidth) {
                    return { normal: physics.Vector(1, 0) };
                } else if (vertices[i].y < 0) {
                    return { normal: physics.Vector(0, -1) };
                } else if (vertices[i].y > window.innerHeight){
                    return { normal: physics.Vector(0, 1) };
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
            let e = Math.min(body1.restitution, body2.restitution);
            let j = -(1 + e) * relativeVelocity.dot(normal);
            j /= (1/body1.mass) + (1/body2.mass);

            body1.velocity = body1.velocity.sub(normal.mult(j / body1.mass));
            body2.velocity = body2.velocity.add(normal.mult(j / body2.mass));
        }
    }

    window.physics.Collisions = PhysicsCollisions;
})();