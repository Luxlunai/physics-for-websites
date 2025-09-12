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
            let randomY = (0.1 + Math.random() * 0.8) * 1080;
            rects.push({
                width: widthRects,
                height: heightRects,
                physics: physics.BodyRect(physics.Vector(randomX, randomY), widthRects, heightRects),
                html: document.createElement('physics-rect'),
                collision: false
            });

            // rects[i].physics.rotation = Math.random() * Math.PI * 2;
            rects[i].physics.restitution = 0.7;
            rects[i].physics.acceleration = physics.Vector(0, 0.1);
            document.body.append(rects[i].html);
            rects[i].html.width = 50;
            rects[i].html.height = 50;
        }

        physics.loop.onUpdate(() => {

            contactPoints.forEach((e) => {
                e.remove();
            })
            contactPoints = [];

            rects.forEach((rect) => {
                rect.physics.update();
                rect.collision = false;
            });

            rects.forEach((rect, index) => {
                let windowCollision = physics.Collisions.intersectWindow(rect.physics.transformedVertices);

                if (windowCollision) {
                    rect.physics.position = rect.physics.position.sub(windowCollision.normal.mult(windowCollision.depth));
                    physics.Collisions.resolveWindow(rect.physics, windowCollision.normal);
                }

                for (let i = index + 1; i < rects.length; i++) {

                    let collision = physics.Collisions.intersectPolygons(rect.physics.transformedVertices, rects[i].physics.transformedVertices);

                    if(collision) {
                        rect.collision = true;
                        rects[i].collision = true;

                        rect.physics.position = rect.physics.position.sub(collision.normal.mult(collision.depth * 0.25));
                        rects[i].physics.position = rects[i].physics.position.add(collision.normal.mult(collision.depth * 0.25));
                        physics.Collisions.resolvePolygons(rect.physics, rects[i].physics, collision.normal, collision.depth);
                        let contact = physics.Collisions.findContactPoints(rect.physics.transformedVertices, rects[i].physics.transformedVertices);

                        if (contact.contactPoint1) {
                            let p1 = document.createElement('physics-point');
                            document.body.append(p1);
                            p1.x = contact.contactPoint1.x;
                            p1.y = contact.contactPoint1.y;
                            contactPoints.push(p1);
                        }

                        if (contact.contactPoint2) {
                            let p2 = document.createElement('physics-point');
                            contactPoints.push(p2);
                            p2.x = contact.contactPoint2.x;
                            p2.y = contact.contactPoint2.y;
                            document.body.append(p2);
                        }
                    }
                };
            });

            rects.forEach((rect) => {
                rect.html.color = rect.collision ? "green" : "red";
                rect.html.x = rect.physics.position.x;
                rect.html.y = rect.physics.position.y;
                rect.html.rotation = rect.physics.rotation;
            })
        })
        
        key = new inputController();
        key.onChange(() => {

            rects[0].physics.acceleration = physics.Vector(
                key.left && key.right ? 0 : key.left ? -1 : key.right ? 1 : 0,
                key.up && key.down ? 0 : key.up ? -1 : key.down ? 1 : 0,
            ).normal.mult(0.5);

            rects[0].physics.rotationalVelocity = (key.rotateLeft && key.rotateRight ? 0 : key.rotateLeft ? -1 : key.rotateRight ? 1 : 0) / 360 * Math.PI * 2;
        });
       
        issetup = true;
    }
})();
