// requires hand-tracking-controls-extras (https://github.com/gftruj/aframe-hand-tracking-controls-extras)

AFRAME.registerComponent("fingertip-colliders", {
    schema: {},

    init: function () {
        console.log(this);

        this.isInVR = false;
        this.el.sceneEl.addEventListener("enter-vr", () => {
            this.isInVR = true;
        });
        this.el.sceneEl.addEventListener("exit-vr", () => {
            this.isInVR = false;
        });

        this.handSide = this.el.components["hand-tracking-controls"].data.hand;

        this.fingerNames = ["thumb", "index", "middle", "ring", "little"];
        /** @type {Object.<string, HTMLElement>} */
        this.fingertipEntities = {};

        this.boundOnOBBCollision = this.onOBBCollision.bind(this);

        const onHandTrackingExtrasReady = () => {
            console.log(this.jointsAPI);
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

            this.fingerNames.forEach((fingerName) => {
                const fingertipEntity = document.createElement("a-entity");
                fingertipEntity.dataset.fingerName = fingerName;
                fingertipEntity.dataset.handSide = this.handSide;
                this.el.sceneEl.appendChild(fingertipEntity);
                this.fingertipEntities[fingerName] = fingertipEntity;
                fingertipEntity.setAttribute("obb-collider", "size: 0.015 0.015 0.015; centerModel: true;");
                fingertipEntity.addEventListener("obbcollisionstarted", this.boundOnOBBCollision);
                fingertipEntity.addEventListener("obbcollisionended", this.boundOnOBBCollision);
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
        const fingerName = fingerTipEntity.dataset.fingerName;
        const withEl = event.detail.withEl;
        const withFinger = withEl.dataset.fingerName;
        const onSameHand = withFinger && withEl.dataset.handSide == this.handSide;

        //console.log({ fingerName, withEl, withFinger, onSameHand });

        const eventType = `fingertiptouch${isCollisionStart ? "started" : "ended"}`;
        this.el.emit(eventType, { fingerName, withEl, withFinger, onSameHand });
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

    updateFingertipEntities: function (time, timeDelta) {
        if (!this.jointsAPI) {
            return;
        }

        Object.entries(this.fingertipEntities).forEach(([fingerName, fingertipEntity]) => {
            const capitalizedFingerName = this.capitalizeFirstLetter(fingerName);
            const fingertipPosition = this.jointsAPI[`get${capitalizedFingerName}Tip`]().getPosition();
            fingertipEntity.object3D.position.copy(fingertipPosition);
        });
    },
});
