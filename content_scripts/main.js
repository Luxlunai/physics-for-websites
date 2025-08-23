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


    function enablePhysics() {
        if (physics.loop.isRunning) { // if the loop is running, pause
            physics.loop.stop();
        } else if (issetup) { // if setup has run, unpause
            physics.loop.start();
        } else {
            setup();
            physics.loop.setSpeed(60);
            physics.loop.start();
        }
    }

    function resetPage() {
        physics.loop.reset();
        
        rects.forEach((rect) => {
            rect.html.remove();
        });
        rects = [];

        // elements.forEach(element => { element.style.visibility = ""; });
        // clones.forEach(clone => { clone.remove(); });
        issetup = false;
    }

    function setup() {
        numberRects = 8;
        for (let i = 0; i < numberRects; i++) {
            rects.push({
                physics: physics.BodyRect(physics.Vector(Math.random() * 1890, Math.random() * 1080), 100, 100),
                html: document.createElement('div')
            });

            rects[i].html.classList.add('physics-body-rect');
            rects[i].html.style.width = 100 + 'px';
            rects[i].html.style.height = 100 + 'px';
            document.body.append(rects[i].html);
        }

        physics.loop.onUpdate(() => {
            rects.forEach((rect) => {
                rect.physics.update();
            });

            rects.forEach((rect, index) => {
                // let windowCollision = physics.Collisions.intersectWindow(rect.physics);
                // if (windowCollision) {
                //     console.log("window collision");
                // }
                for (let i = index + 1; i < rects.length; i++) {
                    let collision = physics.Collisions.intersectPolygons(rect.physics.transformedVertices, rects[i].physics.transformedVertices);
                    if(collision) {
                        rect.html.style.borderColor = "green";
                        rects[i].html.style.borderColor = "green";

                        rect.physics.position = rect.physics.position.sub(collision.normal.mult(collision.depth / 2));
                        rects[i].physics.position = rects[i].physics.position.add(collision.normal.mult(collision.depth / 2));
                        physics.Collisions.resolveCollisions(rect.physics, rects[i].physics, collision.normal, collision.depth);
                    } else {
                        rect.html.style.borderColor = "";
                        rects[i].html.style.borderColor = "";
                    }
                };

                rect.html.style.left = rect.physics.position.x - rect.physics.width / 2 + 'px';
                rect.html.style.top = rect.physics.position.y - rect.physics.height / 2 + 'px';
                rect.html.style.transform = `rotate(${rect.physics.rotation}rad)`
            });
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

    function findElements() {
        return [document.querySelector("h1")];
    }

    function cloneElements(elements) {
        let clones = [];
        elements.forEach(element => {
            let clone = element.cloneNode(true);
            document.body.append(clone);

            element.style.visibility = "hidden";
            clone.style.position = "absolute";
            clone.style.zIndex = "2";

            let elementBounds = element.getBoundingClientRect();
            clone.style.left = `${elementBounds.x}px`;
            clone.style.top = `${elementBounds.y}px`;
            clone.style.width = `${elementBounds.width}px`;
            clone.style.height = `${elementBounds.height}px`;

            let elementParticle = physics.Particle(elementBounds.x, elementBounds.y);
            elementParticle.velocity = physics.Vector();
            elementParticle.acceleration = physics.Vector(0, 4);

            physics.add(elementParticle);
            physics.collide(elementParticle, physics.window);
            physics.loop.onUpdate(() => {
                clone.style.left = `${elementParticle.position.x}px`;
                clone.style.top = `${elementParticle.position.y}px`;
            })

            clones.push(clone);
        });
        return clones;
    }
})();
