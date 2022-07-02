export class GlobalState {
    constructor() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        GlobalState._instance = this;

        // global states

        this.onPoster = false;
        this.clickDown = false;
        this.rotateSpeed = 30;

        this.animationUpdateListeners = [];

        this.space_info = {
            pointerX: 0,
            pointerY: 0,
            focusX: 0,
            focusY:0,
            rotateDegFocus: 0,
            rotateDeg: 0,
            rotateDirection: 1,
        }

        this.focus = true;

    }

    static getInstance() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        return new GlobalState();
    }

    canRotate() {
        return (!this.onPoster) && (!this.clickDown)
    }

    broadcastAnimationUpdate(FPS) {
        for (let i = 0; i < this.animationUpdateListeners.length; i++) {
            this.animationUpdateListeners[i](FPS);
        }
    }

    subscribeAnimationUpdate(func) {
        this.animationUpdateListeners.push(func);
    }

    unsubscribeAll() {
        this.animationUpdateListeners = [];
    }
}