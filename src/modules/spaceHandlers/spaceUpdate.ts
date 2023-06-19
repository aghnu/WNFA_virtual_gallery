import GlobalState from "@modules/globalState";
import AudioController from "@modules/backgroundAudioController";

const FOCUS_UPDATE_ANIMATION_SPEED = 0.25;
let focus = true;

function focusUpdate(fps: number) {
  const stateSpace = GlobalState.getInstance().stateSpace;

  if (fps * FOCUS_UPDATE_ANIMATION_SPEED > 1) {
    if (Math.abs(stateSpace.pointerXY[0] - stateSpace.focusXY[0]) > 1) {
      stateSpace.focusXY[0] =
        stateSpace.focusXY[0] +
        (stateSpace.pointerXY[0] - stateSpace.focusXY[0]) /
          (FOCUS_UPDATE_ANIMATION_SPEED * fps);
    } else {
      stateSpace.focusXY[0] = stateSpace.pointerXY[0];
    }

    if (Math.abs(stateSpace.pointerXY[1] - stateSpace.focusXY[1]) > 1) {
      stateSpace.focusXY[1] =
        stateSpace.focusXY[1] +
        (stateSpace.pointerXY[1] - stateSpace.focusXY[1]) /
          (FOCUS_UPDATE_ANIMATION_SPEED * fps);
    } else {
      stateSpace.focusXY[1] = stateSpace.pointerXY[1];
    }

    if (Math.abs(stateSpace.rotateDeg - stateSpace.rotateDegFocus) > 1) {
      if (stateSpace.rotateDeg - stateSpace.rotateDegFocus > 0) {
        stateSpace.rotateDirection = 1;
      } else {
        stateSpace.rotateDirection = -1;
      }
      stateSpace.rotateDegFocus =
        stateSpace.rotateDegFocus +
        (stateSpace.rotateDeg - stateSpace.rotateDegFocus) /
          (FOCUS_UPDATE_ANIMATION_SPEED * fps);
    } else {
      stateSpace.rotateDegFocus = stateSpace.rotateDeg;
    }
  }

  GlobalState.getInstance().stateSpace = stateSpace;
}

function rotateUpdate(
  el: HTMLElement,
  originalTransformMatrix: null | string = null
) {
  if (originalTransformMatrix !== null) {
    el.style.transform =
      originalTransformMatrix +
      `rotateY(${GlobalState.getInstance().stateSpace.rotateDegFocus}deg)`;
  } else {
    el.style.transform = `rotateY(${
      GlobalState.getInstance().stateSpace.rotateDegFocus
    }deg)`;
  }
}

function spaceUpdate(spaceEl: HTMLElement, boundingEl: HTMLElement) {
  const maxDegree = 50;
  const boxEl = spaceEl.getBoundingClientRect();
  const boxBody = boundingEl.getBoundingClientRect();

  const centerX = boxEl.left + boxEl.width / 2;
  const centerY = boxEl.top + boxEl.height / 2;

  const distanceX = GlobalState.getInstance().stateSpace.focusXY[0] - centerX;
  const distanceY = GlobalState.getInstance().stateSpace.focusXY[1] - centerY;

  const distanceFactorX = distanceX / (boxBody.width / 2);
  const distanceFactorY = distanceY / (boxBody.height / 2);

  const calcRotateY =
    50 - (distanceFactorY * maxDegree) / ((boxBody.height + 600) / 600);
  const calcRotateX =
    50 - (distanceFactorX * maxDegree) / ((boxBody.width + 600) / 600);

  boundingEl.style.perspectiveOrigin = `${calcRotateX}% ${calcRotateY}%`;
}

export async function initSpace(
  spaceEl: HTMLElement,
  rotateEl: HTMLElement,
  boundingEl: HTMLElement
) {
  // setup listeners
  const initSpace = () => {
    const box = spaceEl.getBoundingClientRect();
    GlobalState.getInstance().stateSpace.pointerXY[0] =
      box.left + box.width / 2;
    GlobalState.getInstance().stateSpace.pointerXY[1] =
      box.top + box.height / 2;
  };
  const checkRatio = () => {
    const box = boundingEl.getBoundingClientRect();
    const boxRatio = box.width / box.height;
    const sitePrompt: HTMLElement = document.querySelector("#site-prompt")!;
    const prompt: HTMLElement = document.querySelector("#site-prompt .prompt")!;

    // support up to 21:9 9:21 ratio
    if (boxRatio < 0.4 || boxRatio > 2.5) {
      prompt.innerHTML = "Window ratio not supported";
      sitePrompt.style.visibility = "visible";
    } else {
      sitePrompt.style.visibility = "hidden";
      prompt.innerHTML = "";

      const siteInteractive = document.querySelector("#site-interactive")!;
      if (boxRatio < 1) {
        siteInteractive.classList.add("vertical");
      } else {
        siteInteractive.classList.remove("vertical");
      }
    }
  };

  initSpace();
  GlobalState.getInstance().stateSpace.focusXY[0] =
    GlobalState.getInstance().stateSpace.pointerXY[0];
  GlobalState.getInstance().stateSpace.focusXY[1] =
    GlobalState.getInstance().stateSpace.pointerXY[1];
  checkRatio();

  boundingEl.onmousemove = (e) => {
    if (focus) {
      if (
        GlobalState.getInstance().state.clickDown &&
        !GlobalState.getInstance().state.onPoster
      ) {
        if (GlobalState.getInstance().stateSpace.rotateOrigin === null) {
          GlobalState.getInstance().stateSpace.rotateOrigin = e.clientX;
        } else {
          const distance =
            e.clientX - GlobalState.getInstance().stateSpace.rotateOrigin!;
          const degPerPixel = 120 / window.innerWidth;
          GlobalState.getInstance().stateSpace.rotateDeg =
            GlobalState.getInstance().stateSpace.rotateDeg +
            4 * distance * degPerPixel;
          GlobalState.getInstance().stateSpace.rotateOrigin = e.clientX;
        }
      }

      GlobalState.getInstance().stateSpace.pointerXY[0] = e.clientX;
      GlobalState.getInstance().stateSpace.pointerXY[1] = e.clientY;
    }
  };

  boundingEl.ontouchmove = (e) => {
    if (focus) {
      if (
        GlobalState.getInstance().state.clickDown &&
        !GlobalState.getInstance().state.onPoster
      ) {
        if (GlobalState.getInstance().stateSpace.rotateOrigin === null) {
          GlobalState.getInstance().stateSpace.rotateOrigin =
            e.touches[0].clientX;
        } else {
          const distance =
            e.touches[0].clientX -
            GlobalState.getInstance().stateSpace.rotateOrigin!;
          const degPerPixel = 120 / window.innerWidth;
          GlobalState.getInstance().stateSpace.rotateDeg =
            GlobalState.getInstance().stateSpace.rotateDeg +
            4 * distance * degPerPixel;
          GlobalState.getInstance().stateSpace.rotateOrigin =
            e.touches[0].clientX;
        }
      }
      GlobalState.getInstance().stateSpace.pointerXY[0] = e.touches[0].clientX;
      GlobalState.getInstance().stateSpace.pointerXY[1] = e.touches[0].clientY;
    }
  };

  // drag rotate
  const pointerDown = () => {
    GlobalState.getInstance().stateSpace.rotateOrigin = null;
    GlobalState.getInstance().state.clickDown = true;
  };

  const pointerUp = () => {
    GlobalState.getInstance().state.clickDown = false;
  };

  boundingEl.addEventListener("mousedown", pointerDown);
  boundingEl.addEventListener("touchstart", pointerDown);
  boundingEl.addEventListener("touchend", pointerUp);
  boundingEl.addEventListener("touchcancel", pointerUp);
  document.addEventListener("mouseup", pointerUp);
  document.addEventListener("mouseleave", pointerUp);

  window.onblur = () => {
    pointerUp();
    focus = false;
    AudioController.getInstance().drop();
    GlobalState.getInstance().state.focus = false;

    const lock = document.querySelector("#screenlock")!;
    lock.classList.add("lock");

    initSpace();
  };

  window.onfocus = () => {
    focus = true;
    AudioController.getInstance().init();
    GlobalState.getInstance().state.focus = true;

    const lock = document.querySelector("#screenlock")!;
    lock.classList.remove("lock");

    initSpace();
  };

  // animation loop
  const rotateElOriginalTransformMatrix =
    window.getComputedStyle(rotateEl).transform;

  GlobalState.getInstance().subscribeAnimationUpdate((fps) => {
    const state = GlobalState.getInstance();
    if (state.canRotate()) {
      if (state.state.focus) {
        state.stateSpace.rotateDeg =
          state.stateSpace.rotateDeg +
          state.stateSpace.rotateDirection *
            (360 / (state.state.rotateSpeed / (1 / fps)));
      } else {
        state.stateSpace.rotateDeg =
          state.stateSpace.rotateDeg +
          0.25 *
            state.stateSpace.rotateDirection *
            (360 / (state.state.rotateSpeed / (1 / fps)));
      }
    }
    focusUpdate(fps);
    spaceUpdate(spaceEl, boundingEl);
    rotateUpdate(rotateEl, rotateElOriginalTransformMatrix);
  });

  window.addEventListener("resize", () => {
    checkRatio();
    initSpace();
  });
}
