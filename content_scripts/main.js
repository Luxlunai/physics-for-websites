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
            rect.htmlElem.remove();
        });
        rects = [];

        // elements.forEach(element => { element.style.visibility = ""; });
        // clones.forEach(clone => { clone.remove(); });
        issetup = false;
    }

    function setup() {
        numberRects = 8;
        for (let i = 0; i < numberRects; i++) {
            let rect = {
                physicsElem: physics.BodyRect(physics.Vector(Math.random() * 1890, Math.random() * 1080), 100, 100),
                htmlElem: document.createElement('div')
            };
            rect.htmlElem.classList.add('physics-body-rect');
            rect.htmlElem.style.width = 100 + 'px';
            rect.htmlElem.style.height = 100 + 'px';
            document.body.append(rect.htmlElem);
            rects.push(rect);
        }

        physics.loop.onUpdate(() => {
            rects.forEach((rect) => {
                rect.physicsElem.update();
                rect.transformedVertices = rect.physicsElem.getTransformedVertices();
            });

            rects.forEach((rect, index) => {
                for (let i = index + 1; i < rects.length; i++) {
                    collision = physics.Collisions.intersectPolygons(rect.transformedVertices, rects[i].transformedVertices);
                    if(collision) {
                        rect.htmlElem.style.borderColor = "green";
                        rects[i].htmlElem.style.borderColor = "green";

                        rect.physicsElem.position = rect.physicsElem.position.sub(collision.normal.mult(collision.depth / 2));
                        rects[i].physicsElem.position = rects[i].physicsElem.position.add(collision.normal.mult(collision.depth / 2));
                        physics.Collisions.resolveCollisions(rect.physicsElem, rects[i].physicsElem, collision.normal, collision.depth);
                    } else {
                        rect.htmlElem.style.borderColor = "";
                        rects[i].htmlElem.style.borderColor = "";
                    }
                };

                rect.htmlElem.style.left = rect.physicsElem.position.x - rect.physicsElem.width / 2 + 'px';
                rect.htmlElem.style.top = rect.physicsElem.position.y - rect.physicsElem.height / 2 + 'px';
                rect.htmlElem.style.transform = `rotate(${rect.physicsElem.rotation}rad)`
            });
        })
        
        key = new inputController();
        key.onChange(() => {
            rects[0].physicsElem.velocity = physics.Vector(
                key.left && key.right ? 0 : key.left ? -1 : key.right ? 1 : 0,
                key.up && key.down ? 0 : key.up ? -1 : key.down ? 1 : 0,
            ).normal.mult(5);
            rects[0].physicsElem.rotationalVelocity = (key.rotateLeft && key.rotateRight ? 0 : key.rotateLeft ? -1 : key.rotateRight ? 1 : 0) / 360 * Math.PI * 2;
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
