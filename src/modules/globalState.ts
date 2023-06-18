interface State {
  onPoster: boolean;
  clickDown: boolean;
  focus: boolean;
  rotateSpeed: number;
}

interface StateSpace {
  pointerXY: [number, number];
  focusXY: [number, number];
  rotateDegFocus: number;
  rotateDeg: number;
  rotateDirection: number;
}

class GlobalState {
  protected static instance: GlobalState | undefined;
  public state: State;
  public stateSpace: StateSpace;
  private animationUpdateListeners: Array<(fps: number) => void> = [];

  protected constructor() {
    this.state = {
      onPoster: false,
      clickDown: false,
      focus: true,
      rotateSpeed: 30,
    };
    this.stateSpace = {
      pointerXY: [0, 0],
      focusXY: [0, 0],
      rotateDegFocus: 0,
      rotateDeg: 0,
      rotateDirection: 1,
    };
  }

  public static getInstance() {
    if (this.instance === undefined) this.instance = new GlobalState();
    return this.instance;
  }

  public canRotate() {
    return !this.state.onPoster && !this.state.clickDown;
  }

  public broadcastAnimationUpdate(fps: number) {
    for (let i = 0; i < this.animationUpdateListeners.length; i++) {
      void new Promise(() => {
        this.animationUpdateListeners[i](fps);
      });
    }
  }

  public subscribeAnimationUpdate(func: (fps: number) => void) {
    this.animationUpdateListeners.push(func);
  }

  public unsubscribeAll() {
    this.animationUpdateListeners = [];
  }
}

export default GlobalState;
