(() => {
    if (window.hasRun) return;

    class HTMLRectElement extends HTMLCustomElement {

        static get observedAttributes() {
            return ["x", "y", "width", "height", "rotation", "color", "borderColor"];
        }

        static get defaultValues() {
            return {"x": 0, "y": 0, "width": 100, "height": 100, "rotation": 0, "color": "red", "borderColor": "white"}
        }

        constructor() {
            super(HTMLRectElement);

            const shadow = this.attachShadow({ mode: "open" });
            const rect = document.createElement("div");
            const style = document.createElement("style");
            shadow.append(rect);
            shadow.append(style);

            this.updateStyle = () => {
                style.textContent = `
                    div {
                        position: absolute;
                        z-index: 1000;
                        box-sizing: border-box;
                        left: ${this._x - this._width / 2}px;
                        top: ${this._y - this._height / 2}px;
                        width: ${this._width}px;
                        height: ${this._height}px;
                        background-color: ${this._color};
                        border: 1px solid ${this._borderColor};
                        transform: rotate(${this._rotation}rad)
                    }
                `;
            }
        }

        attributeChangedCallback() {
            this.updateStyle();
        }
    };

    customElements.define("physics-rect", HTMLRectElement);
})();