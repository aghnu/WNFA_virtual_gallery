export class GlobalState {
    constructor() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        GlobalState._instance = this;

        // global states

        this.onPoster = false;
        this.clickDown = false;
    }

    static getInstance() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        return new ProgramCore();
    }

    canRotate() {
        return (!this.onPoster) && (!this.clickDown)
    }
}