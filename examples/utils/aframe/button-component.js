AFRAME.registerComponent("button", {
    schema: {
        leftHand: { type: "selector", default: "[hand-tracking-controls].left" },
        rightHand: { type: "selector", default: "[hand-tracking-controls].right" },
        camera: { type: "selector", default: "[camera]" },
        fingertipThreshold: { type: "number", default: 0.05 },
    },

    init: function () {
        /** @type {Object.<string, HTMLElement>} */
        this.hands = {
            left: this.data.leftHand,
            right: this.data.rightHand,
        };

        Object.entries(this.hands).forEach(([side, hand]) => {
            hand.addEventListener("hand-tracking-extras-ready", (event) => {
                hand.jointsAPI = event.detail.data.jointAPI;
                const clearHand = () => {
                    const material = hand.components["hand-tracking-controls"]?.skinnedMesh?.material;
                    if (material) {
                        console.log(material);
                        material.colorWrite = false;
                        clearInterval(intervalId);
                    }
                };
                let intervalId = setInterval(() => {
                    clearHand();
                }, 1000);
                clearHand();
            });
        });

        this.checkHands = AFRAME.utils.throttle(this.checkHands, 10, this);
    },

    didHandsLoad: function () {
        return Object.values(this.hands).every((hand) => hand.jointsAPI);
    },

    tick: function (time, timeDelta) {
        if (this.didHandsLoad()) {
            this.checkHands(time, timeDelta);
        }
    },

    checkHands: function (time, timeDelta) {},
});
