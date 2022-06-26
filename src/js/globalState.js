export class GlobalState {
    constructor() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        GlobalState._instance = this;

        // global states
        this.control_rotate = true;
    }

    static getInstance() {
        if (GlobalState._instance) {
            return GlobalState._instance;
        }

        return new ProgramCore();
    }
}