(() => {
    if (window.hasRun) return;
    
    class PhysicsLoop {
        timeStep = 0.0;
        previousTime = 0.0;
        delta = 0.0;
        isRunning = false;

        callbacks = [];

        /**
         * Loop class
         * @param {CallableFunction} callback callable function to loop
         * @param {number} speed number of times the function is called per second, default: 30
         */
        constructor(callback, speed = 30) {
            this.callbacks[0] = callback;
            this.timeStep = 1000.0 / speed;
        }

        loop(time) {
            if(!this.isRunning) return; 
            
            // Accumulate delta time
            this.delta += time - this.previousTime;

            // Update the previous time
            this.previousTime = time;

            // Call callback and reset delta
            if (this.delta > this.timeStep) {
                this.callbacks.forEach((c) => c());
                this.delta -= this.timeStep;
            }

            // Repeat
            window.requestAnimationFrame(this.loop.bind(this));
        }

        start() {
            this.isRunning = true;
            window.requestAnimationFrame(time => {
                this.previousTime = time;
                window.requestAnimationFrame(this.loop.bind(this));
            });
        }

        stop() {
            this.isRunning = false;
            this.previousTime = 0.0;
            this.delta = 0.0;
        }

        reset() {
            this.stop();
            this.callbacks = [];
        }

        /**
         * set loop speed
         * @param {number} speed number of times the function is called per second
         */
        setSpeed(speed) {
            this.timeStep = 1000.0 / speed;
        }

        onUpdate(callback) {
            this.callbacks.push(callback);
        }
    }

    window.physics.Loop = (time) => { return new PhysicsLoop(time); };
})();