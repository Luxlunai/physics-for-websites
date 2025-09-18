(() => {
    if (window.hasRun) return;
    window.hasRun = true;

    /**
     * Listen for messages from the background script.
     */
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "enable-physics") {
            enablePhysics();
        } else if (message.command === "reset") {
            resetPage();
        }
    });

    let issetup, elements, clones;
    let windowBorders = [];
    let rects = [];
    let contactPoints = [];


    function enablePhysics() {
        if (physics.loop.isRunning) { // if the loop is running, pause
            physics.loop.stop();
        } else if (issetup) { // if setup has run, unpause
            physics.loop.start();
        } else {
            setup();
            physics.loop.setSpeed(30);
            physics.loop.start();
        }
    }

    function resetPage() {
        physics.loop.reset();
        
        rects.forEach((rect) => {
            rect.html.remove();
        });
        rects = [];
        contactPoints.forEach((e) => {
            e.remove();
        })
        contactPoints = [];
        issetup = false;
    }

    function setup() {

        let numberRects = 20;
        let widthRects = 50;
        let heightRects = 50;
        for (let i = 0; i < numberRects; i++) {
            let randomX = (0.1 + Math.random() * 0.8) * 1890;
            let randomY = (0.1 + Math.random() * 0.8) * (1080 / 2);
            rects.push(physics.BodyRect(physics.Vector(randomX, randomY), widthRects, heightRects, 10, 0.3));

            rects[i].acceleration = physics.Vector(0, 0.2);
        }

        let floor = physics.BodyRect(physics.Vector(window.innerWidth / 2, window.innerHeight), window.innerWidth, 100, 1, 1, true);
        rects.push(floor);

        physics.loop.onUpdate(() => {

            contactPoints.forEach((e) => {
                e.remove();
            })
            contactPoints = [];

            rects.forEach((rect) => {
                rect.update();
                rect.color = "grey";
            });

            rects.forEach((rect, index) => {
                // let windowCollision = physics.Collisions.intersectWindow(rect.transformedVertices);

                // if (windowCollision) {
                //     rect.position = rect.position.sub(windowCollision.normal.mult(windowCollision.depth));
                //     physics.Collisions.resolveWindow(rect, windowCollision.normal);
                // }

                for (let i = index + 1; i < rects.length; i++) {

                    let collision = physics.Collisions.intersectPolygons(rect.transformedVertices, rects[i].transformedVertices);

                    if(collision) {
                        if (!rect.isStatic) rect.color = "green";
                        if (!rects[i].isStatic) rects[i].color = "green";

                        if (rect.isStatic) {
                            rects[i].position = rects[i].position.add(collision.normal.mult(collision.depth));
                        } else if (rects[i].isStatic) {
                            rect.position = rect.position.sub(collision.normal.mult(collision.depth));
                        } else {
                            rect.position = rect.position.sub(collision.normal.mult(collision.depth / 2));
                            rects[i].position = rects[i].position.add(collision.normal.mult(collision.depth / 2));
                        }

                        // physics.Collisions.resolvePolygons(rect, rects[i], collision.normal, collision.depth);
                        let contact = physics.Collisions.findContactPoints(rect.transformedVertices, rects[i].transformedVertices);

                        physics.Collisions.resolvePolygonsWithRotation(
                            rect, 
                            rects[i], 
                            collision.normal, 
                            contact.contactPoint1, 
                            contact.contactPoint2, 
                            contact.contactCount
                        )
                        // if (contact.contactPoint1) {
                        //     let p1 = document.createElement('physics-point');
                        //     document.body.append(p1);
                        //     p1.x = contact.contactPoint1.x;
                        //     p1.y = contact.contactPoint1.y;
                        //     p1.color = "orange";
                        //     contactPoints.push(p1);
                        // }

                        // if (contact.contactPoint2) {
                        //     let p2 = document.createElement('physics-point');
                        //     contactPoints.push(p2);
                        //     p2.x = contact.contactPoint2.x;
                        //     p2.y = contact.contactPoint2.y;
                        //     p2.color = "orange";
                        //     document.body.append(p2);
                        // }
                    }
                };
            });
        })
        
        key = new inputController();
        key.onChange(() => {

            rects[0].acceleration = physics.Vector(
                key.left && key.right ? 0 : key.left ? -1 : key.right ? 1 : 0,
                key.up && key.down ? 0 : key.up ? -1 : key.down ? 1 : 0,
            ).normal.mult(0.5);

            rects[0].rotationalVelocity = (key.rotateLeft && key.rotateRight ? 0 : key.rotateLeft ? -1 : key.rotateRight ? 1 : 0) / 360 * Math.PI * 2;
        });
       
        issetup = true;
    }
})();
