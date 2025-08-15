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
    let rect1, rect1Elem, rect1VertexElems;
    let rect2, rect2Elem, rect2VertexElems;

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
        physics.loop.stop();
        // rectElem1.remove();
        rect1VertexElems.forEach((e) => {
            e.remove();
        })
        rect2VertexElems.forEach((e) => {
            e.remove();
        })

        // elements.forEach(element => { element.style.visibility = ""; });
        // clones.forEach(clone => { clone.remove(); });
        issetup = false;
    }

    function setup() {
        rect1 = physics.BodyRect(physics.Vector(200, 500), 200, 200);
        rect2 = physics.BodyRect(physics.Vector(2000, 500), 200, 200);

        // rectElem1 = document.createElement('div');
        // rectElem1.classList.add('physics-body-rect');
        // document.body.append(rectElem1);

        rect1VertexElems = [];
        rect1.vertices.forEach((v, i) => {
            rect1VertexElems.push(document.createElement('div'));
            rect1VertexElems[rect1VertexElems.length - 1].classList.add('particle');
            document.body.append(rect1VertexElems[i]);
        })

        rect2VertexElems = [];
        rect2.vertices.forEach((v, i) => {
            rect2VertexElems.push(document.createElement('div'));
            rect2VertexElems[rect2VertexElems.length - 1].classList.add('particle');
            document.body.append(rect2VertexElems[i]);
        })

        physics.loop.onUpdate(() => {
            let vertices1 = rect1.getTransformedVertices();
            vertices1.forEach((v, i) => {
                rect1VertexElems[i].style.left = v.x + 'px';
                rect1VertexElems[i].style.top = v.y + 'px';
            })

            let vertices2 = rect2.getTransformedVertices();
            vertices2.forEach((v, i) => {
                rect2VertexElems[i].style.left = v.x + 'px';
                rect2VertexElems[i].style.top = v.y + 'px';
            })

            if(physics.Collisions.intersectPolygons(vertices1, vertices2)) {
                rect1VertexElems.forEach((e) => {
                    e.style.backgroundColor = "green";
                })
                rect2VertexElems.forEach((e) => {
                    e.style.backgroundColor = "green";
                })
            } else {
                rect1VertexElems.forEach((e) => {
                    e.style.backgroundColor = "red";
                })
                rect2VertexElems.forEach((e) => {
                    e.style.backgroundColor = "red";
                })
            }

            rect1.rotation += 0.01;
            rect1.position.x += 5;

            rect2.rotation += 0.01;
            rect2.position.x -= 5;

        })
        // elements = findElements();
        // clones = cloneElements(elements);
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
