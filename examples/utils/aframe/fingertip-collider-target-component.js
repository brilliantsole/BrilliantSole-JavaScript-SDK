AFRAME.registerComponent("fingertip-collider-target", {
    schema: {
        hands: { default: ["left", "right"] },
        fingers: { default: ["index"] },
        maxTouches: { default: 1 },
        disabled: { default: false },
    },

    init: function () {
        this.touches = []; // [...{hand, finger}]

        this.checkTouches = AFRAME.utils.throttle(this.checkTouches, 20, this);
        this.onFingertipTouchStarted = AFRAME.utils.throttle(this.onFingertipTouchStarted, 300, this);

        this.boundOnFingertipTouch = this.onFingertipTouch.bind(this);
        this.el.addEventListener("fingertiptouchstarted", this.boundOnFingertipTouch);
        this.el.addEventListener("fingertiptouchended", this.boundOnFingertipTouch);
    },

    onFingertipTouch: function (event) {
        if (this.data.disabled) {
            return;
        }

        //console.log(event);
        const isTouchStart = event.type == "fingertiptouchstarted";
        const { target } = event;
        const { hand, finger, getJointAPI } = event.detail;

        const touch = { hand, finger, getJointAPI, target };
        //console.log(touch);

        if (!this.data.hands.includes(hand)) {
            return;
        }
        if (!this.data.fingers.includes(finger)) {
            return;
        }

        if (isTouchStart) {
            this.onFingertipTouchStarted(touch);
        } else {
            this.onFingertipTouchEnded(touch);
        }

        event.stopPropagation();
    },

    getExistingTouch: function (touch) {
        return this.touches.find(({ hand, finger }) => touch.hand == hand && touch.finger == finger);
    },

    onFingertipTouchStarted: function (touch) {
        const existingTouch = this.getExistingTouch(touch);
        if (existingTouch) {
            return;
        }
        if (this.touches.length >= this.data.maxTouches) {
            return;
        }
        this.touches.push(Object.assign({}, touch));
        this.el.emit("touchstarted", touch);
    },
    onFingertipTouchEnded: function (touch) {
        const existingTouch = this.getExistingTouch(touch);
        if (!existingTouch) {
            return;
        }
        this.touches.splice(this.touches.indexOf(existingTouch), 1);
        this.el.emit("touchended", existingTouch);
    },

    tick: function (time, timeDelta) {
        this.checkTouches(time, timeDelta);
    },

    checkTouches: function (time, timeDelta) {
        this.touches.forEach((touch) => {
            const { hand, finger, getJointAPI, target } = touch;
            const position = getJointAPI().getPosition();
            // FILL - get normalized position within collider
            //console.log(position);
            this.el.emit("touchmoved", { hand, finger, position, target });
        });
    },

    update: function (oldData) {
        const diff = AFRAME.utils.diff(oldData, this.data);

        const diffKeys = Object.keys(diff);

        diffKeys.forEach((diffKey) => {
            switch (diffKey) {
                case "disabled":
                    if (this.data.disabled) {
                        this.touches.forEach((touch) => this.onFingertipTouchEnded(touch));
                    }
                    break;
            }
        });
    },
});
