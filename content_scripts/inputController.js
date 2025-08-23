(() => { 
    if (window.hasRun) return;
    
    class inputController {

        up = false;
        down = false;
        left = false;
        right = false;
        rotateLeft = false;
        rotateRight = false;

        callbacks = [];
        
        constructor() {
            window.addEventListener("keydown", (event) => {
                if      (event.key === "w" || event.key === "ArrowUp") {
                    this.up = true;
                    this.callback();
                }
                else if (event.key === "s" || event.key === "ArrowDown") {
                    this.down = true;
                    this.callback();
                }
                else if (event.key === "a" || event.key === "ArrowLeft") {
                    this.left = true;
                    this.callback();
                }
                else if (event.key === "d" || event.key === "ArrowRight") {
                    this.right = true;
                    this.callback();
                }
                else if (event.key === "q") {
                    this.rotateLeft = true;
                    this.callback();
                }
                else if (event.key === "e") {
                    this.rotateRight = true;
                    this.callback();
                }
                
            });
            window.addEventListener("keyup", (event) => {
                if      (event.key === "w" || event.key === "ArrowUp") {
                    this.up = false;
                    this.callback();
                }
                else if (event.key === "s" || event.key === "ArrowDown") {
                    this.down = false;
                    this.callback();
                }
                else if (event.key === "a" || event.key === "ArrowLeft") {
                    this.left = false;
                    this.callback();
                }
                else if (event.key === "d" || event.key === "ArrowRight") {
                    this.right = false;
                    this.callback();
                }
                else if (event.key === "q") {
                    this.rotateLeft = false;
                    this.callback();
                }
                else if (event.key === "e") {
                    this.rotateRight = false;
                    this.callback();
                }
            });
        }

        callback(){
            this.callbacks.forEach((c) => c());
        }

        onChange(callback){
            this.callbacks.push(callback);
        }
    }
    window.inputController = inputController;
})();