AFRAME.registerComponent("fingertip-button", {
    schema: {
        hands: { default: ["left", "right"] },
        fingers: { default: ["index"] },

        color: { type: "color", default: "white" },

        text: { type: "string", default: "hello world!" },
        textColor: { type: "color", default: "black" },
        subtitle: { type: "string", default: "" },

        disabled: { default: false },
        disabledColor: { type: "color", default: "grey" },

        scale: { default: 0.15 },
        rotation: { type: "vec3" },

        height: { type: "number", default: 0.2 },
        width: { type: "number", default: 1.4 },
        depth: { type: "number", default: 0.3 },
    },

    init: function () {
        this.box3 = new THREE.Box3();
        this.matrix4 = new THREE.Matrix4();

        this.container = document.createElement("a-entity");
        this.el.appendChild(this.container);

        this.box = document.createElement("a-box");
        this.box.classList.add("clickable");
        this.container.appendChild(this.box);

        // causes an error if the box with text nodes is used for obb-collider
        this.colliderBox = document.createElement("a-box");
        //this.colliderBox.setAttribute("obb-collider", "");
        this.colliderBox.hideCollider = () => this.colliderBox?.components?.["obb-collider"]?.hideCollider?.();
        this.colliderBox.setAttribute("material", "opacity: 0;");
        this.container.appendChild(this.colliderBox);

        this.text = document.createElement("a-text");
        this.text.setAttribute("rotation", "-90 0 0");
        this.text.setAttribute("align", "center");
        this.text.setAttribute("width", "5");
        this.box.appendChild(this.text);

        this.subtitle = document.createElement("a-text");
        this.subtitle.setAttribute("align", "center");
        this.subtitle.setAttribute("scale", "0.7 0.7 0.7");
        this.subtitle.setAttribute("baseline", "bottom");
        this.box.appendChild(this.subtitle);

        this.el.setAttribute("fingertip-collider-target", {
            hands: this.data.hands,
            fingers: this.data.fingers,
            maxTouches: 1,
            disabled: this.data.disabled,
        });

        this.el.addEventListener("touchstarted", () => {
            this.el.dispatchEvent(new Event("click"));
        });
    },

    calculateTextSize: function (textEntity) {
        const mesh = textEntity.components?.text?.mesh;
        if (!mesh) {
            return;
        }
        const box3 = this.box3;
        box3.setFromObject(mesh);
        this.matrix4.makeRotationFromQuaternion(this.box.object3D.quaternion);
        this.matrix4.invert();
        box3.applyMatrix4(this.matrix4);

        let width = box3.max.x - box3.min.x;
        width *= 8;

        let height = box3.max.z - box3.min.z;
        height *= 8;

        return {
            width,
            height,
        };
    },

    update: function (oldData) {
        const diff = AFRAME.utils.diff(oldData, this.data);

        const diffKeys = Object.keys(diff);

        //console.log({ diffKeys });

        diffKeys.forEach((diffKey) => {
            switch (diffKey) {
                case "text":
                    this.text.setAttribute("value", this.data.text);
                    let text = this.data.text;
                    let timeoutId = setInterval(() => {
                        if (this.data.text != text) {
                            clearInterval(timeoutId);
                            return;
                        }

                        const textSize = this.calculateTextSize(this.text);
                        if (textSize) {
                            const { width, height } = textSize;
                            clearInterval(timeoutId);
                            this.el.setAttribute("fingertip-button", "width", width);
                            this.el.setAttribute("fingertip-button", "depth", height);
                            this.updateCollider();
                        }
                    }, 10);
                    break;
                case "subtitle":
                    this.subtitle.setAttribute("value", this.data.subtitle);
                    break;
                case "textColor":
                    this.text.setAttribute("color", this.data.textColor);
                    this.subtitle.setAttribute("color", this.data.textColor);
                    break;
                case "color":
                    if (this.data.disabled) {
                        break;
                    }
                    this.box.setAttribute("color", this.data.color);
                    break;
                case "disabledColor":
                    if (!this.data.disabled) {
                        break;
                    }
                    this.box.setAttribute("color", this.data.disabledColor);
                    break;
                case "disabled":
                    if (this.data.disabled) {
                        this.colliderBox.removeAttribute("obb-collider");
                    } else {
                        this.colliderBox.setAttribute("obb-collider", "");
                    }

                    this.el.setAttribute("fingertip-collider-target", { disabled: this.data.disabled });
                    this.box.setAttribute("color", this.data.disabled ? this.data.disabledColor : this.data.color);
                    break;
                case "width":
                    this.box.setAttribute("width", this.data.width);
                    this.colliderBox.setAttribute("width", this.data.width);
                    this.updateCollider();
                    break;
                case "depth":
                    this.box.setAttribute("depth", this.data.depth);
                    this.colliderBox.setAttribute("depth", this.data.depth);
                    this.updateCollider();
                    break;
                case "height":
                    this.box.setAttribute("height", this.data.height);
                    this.colliderBox.setAttribute("height", this.data.height);

                    this.box.setAttribute("position", `0 ${(this.data.height * this.data.scale) / 2} 0`);
                    this.colliderBox.setAttribute("position", `0 ${(this.data.height * this.data.scale) / 2} 0`);

                    this.text.setAttribute("position", `0 ${this.data.height / 2} 0`);
                    this.subtitle.setAttribute("position", `0 ${-this.data.height / 2} ${this.data.depth / 2}`);

                    this.updateCollider();
                    break;
                case "scale":
                    {
                        const scaleString = new Array(3).fill(this.data.scale).join(" ");
                        this.box.setAttribute("scale", scaleString);
                        this.colliderBox.setAttribute("scale", scaleString);
                        this.updateCollider();
                    }
                    break;
                case "rotation":
                    {
                        const rotationString = AFRAME.utils.coordinates.stringify(this.data.rotation);
                        this.box.setAttribute("rotation", rotationString);
                        this.colliderBox.setAttribute("rotation", rotationString);
                        this.updateCollider();
                    }
                    break;
            }
        });
    },

    updateCollider: function () {
        setTimeout(() => {
            this.colliderBox.components["obb-collider"]?.updateCollider();
        }, 0);
    },

    remove: function () {
        this.el.removeAttribute("fingertip-collider-target");
        this.box.remove();
    },
});
