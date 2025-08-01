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
    let vertex1, vertex2, vertex3, vertex4;
    let edge1, edge2, edge3, edge4, edge5, edge6;
    let v1Elem, v2Elem, v3Elem, v4Elem;

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
        
        physics.remove(vertex1);
        physics.remove(vertex2);
        physics.remove(vertex3);
        physics.remove(vertex4);
        physics.remove(edge1);
        physics.remove(edge2);
        physics.remove(edge3);
        physics.remove(edge4);
        physics.remove(edge5);
        physics.remove(edge6);
        v1Elem.remove();
        v2Elem.remove();
        v3Elem.remove();
        v4Elem.remove();

        elements.forEach(element => { element.style.visibility = ""; });
        clones.forEach(clone => { clone.remove(); });
        issetup = false;
    }

    function setup() {
        vertex1 = physics.Particle(1200, 100);
        vertex2 = physics.Particle(1450, 100);
        vertex3 = physics.Particle(1450, 350);
        vertex4 = physics.Particle(1200, 350);
        edge1 = physics.Spring(vertex1, vertex2, 250, 1);
        edge2 = physics.Spring(vertex2, vertex3, 250, 1);
        edge3 = physics.Spring(vertex3, vertex4, 250, 1);
        edge3 = physics.Spring(vertex3, vertex4, 250, 1);
        edge4 = physics.Spring(vertex3, vertex4, 250, 1);
        edge5 = physics.Spring(vertex1, vertex3, Math.sqrt(250 ** 2 + 250 ** 2), 1);
        edge6 = physics.Spring(vertex2, vertex4, Math.sqrt(250 ** 2 + 250 ** 2), 1);
        console.log(edge6);
        vertex1.acceleration = physics.Vector(0, 2);
        vertex2.acceleration = physics.Vector(0, 2);
        vertex3.acceleration = physics.Vector(0, 2);
        vertex4.acceleration = physics.Vector(0, 2);
        physics.add(vertex1);
        physics.add(vertex2);
        physics.add(vertex3);
        physics.add(vertex4);
        physics.add(edge1);
        physics.add(edge2);
        physics.add(edge3);
        physics.add(edge4);
        physics.add(edge5);
        physics.add(edge6);
        physics.collide(vertex1, physics.window);
        physics.collide(vertex2, physics.window);
        physics.collide(vertex3, physics.window);
        physics.collide(vertex4, physics.window);

        v1Elem = document.createElement('div');
        v1Elem.classList.add('particle');
        v1Elem.style.left = `${vertex1.position.x}px`;
        v1Elem.style.top = `${vertex1.position.y}px`;

        v2Elem = v1Elem.cloneNode();
        v2Elem.style.left = `${vertex2.position.x}px`; 
        v2Elem.style.top = `${vertex2.position.y}px`;

        v3Elem = v1Elem.cloneNode();
        v3Elem.style.left = `${vertex3.position.x}px`; 
        v3Elem.style.top = `${vertex3.position.y}px`;
        
        v4Elem = v1Elem.cloneNode();
        v4Elem.style.left = `${vertex4.position.x}px`; 
        v4Elem.style.top = `${vertex4.position.y}px`;

        document.body.append(v1Elem);
        document.body.append(v2Elem);
        document.body.append(v3Elem);
        document.body.append(v4Elem);

        physics.loop.onUpdate(() => {
            v1Elem.style.left = `${vertex1.position.x}px`;
            v1Elem.style.top = `${vertex1.position.y}px`;
            v2Elem.style.left = `${vertex2.position.x}px`;
            v2Elem.style.top = `${vertex2.position.y}px`;
            v3Elem.style.left = `${vertex3.position.x}px`;
            v3Elem.style.top = `${vertex3.position.y}px`;
            v4Elem.style.left = `${vertex4.position.x}px`;
            v4Elem.style.top = `${vertex4.position.y}px`;
        })
        elements = findElements();
        clones = cloneElements(elements);
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
