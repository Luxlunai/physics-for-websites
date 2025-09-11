(() => {
    if (window.hasRun) return;
    
    class HTMLPointElement extends HTMLCustomElement {
        
        static get observedAttributes() {
            return ['x', 'y', 'radius', 'color'];
        }

        static get defaultValues() {
            return {'x': 0, 'y': 0, 'radius': 8, 'color': 'green'}
        }

        constructor() {
            super(HTMLPointElement);

            const shadow = this.attachShadow({ mode: 'open' });
            const point = document.createElement('div');
            const style = document.createElement('style');
            shadow.append(point);
            shadow.append(style);
            
            this.updateStyle = () => {
                style.textContent = `
                    div {
                        position: absolute;
                        z-index: 1000;
                        border-radius: 50%;
                        left: ${this._x - this._radius / 2}px;
                        top: ${this._y - this._radius / 2}px;
                        width: ${this._radius}px;
                        height: ${this._radius}px;
                        background-color: ${this._color};
                    }
                `;
            }
        }

        attributeChangedCallback() {
            this.updateStyle();
        }
    }

    customElements.define('physics-point', HTMLPointElement);
})();