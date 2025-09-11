(() => {
    if (window.hasRun) return;

    // source: https://css-tricks.com/creating-a-custom-element-from-scratch/
    class HTMLCustomElement extends HTMLElement {

        constructor(extClass) {
            super();

            let defaults = extClass.defaultValues;
            for ( let prop in defaults) {
                this[`_${prop}`] = defaults[prop];
            }

            let attrs = extClass.observedAttributes;
            if (attrs && attrs.length) {
                attrs.forEach(attribute => {
                    Object.defineProperty(this, attribute, {
                        get() {
                            return this[`_${attribute}`];
                        },
                        set(value) {
                            if (value) {
                                this[`_${attribute}`] = value;
                                this.setAttribute(attribute, value);
                            } else {
                                this.removeAttribute(attribute);
                                this[`_${attribute}`] = defaults[attribute];
                            }
                        }
                    });
                });
            }
        }

        attributeChangedCallback(attribute, oldValue, newValue) {
            if (this[attribute] !== newValue) {
                this[attribute] = newValue;
            }
        }
    }

    window.HTMLCustomElement = HTMLCustomElement;
})();