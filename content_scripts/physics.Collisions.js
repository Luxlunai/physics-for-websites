(() => {
    if (window.hasRun) return;
    
    class PhysicsCollisions {
        constructor() {}

        static intersectPolygons(vertices1, vertices2) {
            for (let i = 0; i < vertices1.length; i++) {
                let v1 = vertices1[i];
                let v2 = vertices1[(i + 1) % vertices1.length];

                let edge = v2.sub(v1);
                let axis = edge.orthogonal;
                console.log(edge, axis);

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
            };

            for(let i = 0; i < vertices2.length; i++) {
                let v1 = vertices2[i];
                let v2 = vertices2[(i + 1) % vertices2.length];

                let edge = v2.sub(v1);
                let axis = edge.orthogonal;

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
            };

            return true;
        }
    }

    window.physics.Collisions = PhysicsCollisions;
})();