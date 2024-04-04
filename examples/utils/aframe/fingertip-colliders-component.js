// requires hand-tracking-controls-extras (https://github.com/gftruj/aframe-hand-tracking-controls-extras)

AFRAME.registerComponent("fingertip-colliders", {
    schema: {
        fingers: { default: ["thumb", "index"] }, // ["thumb", "index", "middle", "ring", "little"]
    },

    init: function () {
        console.log(this);

        if (!this.el.hasAttribute("hand-tracking-extras")) {
            this.el.setAttribute("hand-tracking-extras", "");
        }

        this.isHandVisible = false;

        this.isInVR = false;
        this.el.sceneEl.addEventListener("enter-vr", () => {
            this.isInVR = true;
        });
        this.el.sceneEl.addEventListener("exit-vr", () => {
            this.isInVR = false;
        });

        this.hand = this.el.components["hand-tracking-controls"].data.hand;

        /** @type {Object.<string, HTMLElement>} */
        this.fingertipEntities = {};

        this.boundOnOBBCollision = this.onOBBCollision.bind(this);
        this.obbColliderAttributeValue = "size: 0.015 0.015 0.015;";

        const onHandTrackingExtrasReady = () => {
            console.log("jointsAPI", this.hand, this.jointsAPI);
            const clearHand = () => {
                const material = this.el.components["hand-tracking-controls"]?.skinnedMesh?.material;
                if (material) {
                    console.log(material);
                    material.colorWrite = false;
                    clearInterval(intervalId);
                }
            };
            let intervalId = setInterval(() => {
                clearHand();
            }, 1000);

            this.data.fingers.forEach((finger) => {
                const capitalizedfinger = this.capitalizeFirstLetter(finger);

                const fingertipEntity = document.createElement("a-entity");

                fingertipEntity.dataset.finger = finger;
                fingertipEntity.dataset.hand = this.hand;

                fingertipEntity.getJointAPI = () => this.jointsAPI[`get${capitalizedfinger}Tip`]();
                //fingertipEntity.setAttribute("obb-collider", this.obbColliderAttributeValue);

                fingertipEntity.addEventListener("obbcollisionstarted", this.boundOnOBBCollision);
                fingertipEntity.addEventListener("obbcollisionended", this.boundOnOBBCollision);

                this.fingertipEntities[finger] = fingertipEntity;
                this.el.sceneEl.appendChild(fingertipEntity);
            });
            clearHand();
        };

        this.jointsAPI = this.el?.components?.["hand-tracking-extras"]?.HandData?.jointAPI;
        if (this.jointsAPI) {
            onHandTrackingExtrasReady();
        } else {
            this.el.addEventListener(
                "hand-tracking-extras-ready",
                (event) => {
                    this.jointsAPI = event.detail.data.jointAPI;
                    onHandTrackingExtrasReady();
                },
                { once: true }
            );
        }

        this.updateFingertipEntities = AFRAME.utils.throttle(this.updateFingertipEntities, 20, this);
    },

    onOBBCollision: function (event) {
        //console.log(event);
        const isCollisionStart = event.type == "obbcollisionstarted";
        const fingerTipEntity = event.target;
        const finger = fingerTipEntity.dataset.finger;
        const withEl = event.detail.withEl;
        const withFinger = withEl.dataset.finger;
        const onSameHand = withFinger && withEl.dataset.hand == this.hand;

        //console.log({ finger, withEl, withFinger, onSameHand });

        const eventType = `fingertiptouch${isCollisionStart ? "started" : "ended"}`;
        this.el.emit(eventType, { finger, withEl, withFinger, onSameHand });
        if (!withFinger) {
            const { getJointAPI } = fingerTipEntity;
            withEl.emit(eventType, { finger, hand: this.hand, getJointAPI });
        }
    },

    /** @param {string} string */
    capitalizeFirstLetter: function (string) {
        return string[0].toUpperCase() + string.slice(1);
    },

    tick: function (time, timeDelta) {
        if (!this.isInVR) {
            return;
        }
        this.updateFingertipEntities(time, timeDelta);
    },

    checkIfHandIsVisible: function () {
        const isHandVisible = this.getIsHandVisible();
        if (this.isHandVisible != isHandVisible) {
            this.isHandVisible = isHandVisible;
            Object.entries(this.fingertipEntities).forEach(([finger, fingertipEntity]) => {
                if (this.isHandVisible) {
                    fingertipEntity.setAttribute("obb-collider", this.obbColliderAttributeValue);
                } else {
                    //fingertipEntity.removeAttribute("obb-collider");
                }
            });
        }
    },
    getIsHandVisible: function () {
        return this.el.components["hand-tracking-controls"]?.mesh?.visible;
    },

    updateFingertipEntities: function (time, timeDelta) {
        if (!this.jointsAPI) {
            return;
        }
        this.checkIfHandIsVisible();
        if (!this.isHandVisible) {
            return;
        }

        Object.entries(this.fingertipEntities).forEach(([finger, fingertipEntity]) => {
            const jointAPI = fingertipEntity.getJointAPI();
            const fingertipPosition = jointAPI.getPosition();
            fingertipEntity.object3D.position.copy(fingertipPosition);
        });
    },
});
