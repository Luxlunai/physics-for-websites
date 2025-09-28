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
    let rects = [];
    let contactPoints = [];
    let updatesPerSecond = 300;


    function enablePhysics() {
        if (physics.loop.isRunning) { // if the loop is running, pause
            physics.loop.stop();
        } else if (issetup) { // if setup has run, unpause
            physics.loop.start();
        } else {
            setup();
            physics.loop.setSpeed(updatesPerSecond);
            physics.loop.start();
        }
    }

    function resetPage() {
        physics.loop.reset();
        
        clones.forEach((clone) => {
            clone.style.opacity = 1;
        })
        rects.forEach((rect) => {
            rect.node.remove();
            if (rect.debugNode) rect.debugNode.remove();
        });
        rects = [];
        issetup = false;
    }

    function setup() {

        let wallThickness = 100;
        rects = [
            physics.BodyRect(physics.Vector(window.innerWidth / 2, window.innerHeight + wallThickness / 2), window.innerWidth, wallThickness, 1, 1, true),
            physics.BodyRect(physics.Vector(window.innerWidth / 2, 0 - wallThickness / 2), window.innerWidth, wallThickness, 1, 1, true),
            physics.BodyRect(physics.Vector(0 - wallThickness / 2, window.innerHeight / 2), 100, window.innerHeight, wallThickness, 1, 1, true),
            physics.BodyRect(physics.Vector(window.innerWidth + wallThickness / 2, window.innerHeight / 2), 100, window.innerHeight, wallThickness, 1, 1, true)
        ]

        elements = document.querySelectorAll("body *");
        clones = [];
        for (let element of elements) {
            let skip = false;

            for (let clone of clones) {
                if (clone.contains(element)) {
                    skip = true;
                }
            }
            if (skip) continue;

            let bBox = element.getBoundingClientRect();
            if (
                element.checkVisibility()
                && bBox.width < window.outerWidth / 5 
                && bBox.height < window.outerHeight / 5
                && bBox.width > 10
                && bBox.height > 10
                && bBox.x > 0
                && bBox.y > 0
                && bBox.x < window.innerWidth
                && bBox.y < window.innerHeight
            ) {
                clones.push(element);
                rects.push(physics.BodyNode(element, 0.2, 0.3));
                element.style.opacity = 0;
            }
            if (clones.length > 20) break;
        };

        physics.loop.onUpdate(() => {

            contactPoints.forEach((e) => {
                e.remove();
            })
            contactPoints = [];

            rects.forEach((rect) => {
                if (rect.position.y > window.innerHeight * 1.5) {
                    rect.position = physics.Vector(window.innerWidth / 2, window.innerHeight / 2);
                    rect.velocity = physics.Vector();
                }
                rect.update(updatesPerSecond, physics.Vector(0, 9.81 * 100));
            });

            rects.forEach((rect, index) => {

                for (let i = index + 1; i < rects.length; i++) {

                    if (!physics.Collisions.intersectAABBs(rect.bBox, rects[i].bBox)) continue;

                    let collision = physics.Collisions.intersectPolygons(rect.transformedVertices, rects[i].transformedVertices);

                    if(collision) {

                        if (rect.isStatic) {
                            rects[i].position = rects[i].position.add(collision.normal.mult(collision.depth));
                        } else if (rects[i].isStatic) {
                            rect.position = rect.position.sub(collision.normal.mult(collision.depth));
                        } else {
                            rect.position = rect.position.sub(collision.normal.mult(collision.depth / 2));
                            rects[i].position = rects[i].position.add(collision.normal.mult(collision.depth / 2));
                        }

                        let contact = physics.Collisions.findContactPoints(rect.transformedVertices, rects[i].transformedVertices);
                        physics.Collisions.resolvePolygonsWithRotation(
                            rect, 
                            rects[i], 
                            collision.normal,
                            collision.depth, 
                            contact.contactPoint1, 
                            contact.contactPoint2, 
                            contact.contactCount
                        )
                    }
                };
            });
        })
        
        key = new inputController();
        key.onChange(() => {

            rects[0].acceleration = physics.Vector(
                key.left && key.right ? 0 : key.left ? -1 : key.right ? 1 : 0,
                key.up && key.down ? 0 : key.up ? -1 : key.down ? 1 : 0,
            ).normal.mult(5000);

            rects[0].rotationalVelocity = (key.rotateLeft && key.rotateRight ? 0 : key.rotateLeft ? -1 : key.rotateRight ? 1 : 0) / 360 * Math.PI * 500;
        });
       
        issetup = true;
    }
})();
