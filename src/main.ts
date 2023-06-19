import "@style/styles.scss";
import initPosterSpace from "@modules/spaceHandlers";

import { icon } from "@utilities/svgFactory";
import GlobalState from "@modules/globalState";
import AudioController from "@modules/backgroundAudioController";
import createFlickeringTextEl from "@modules/flickerText";

import CONSTANTS from "@static/data/constants.json";
import PosterController from "@modules/posterHandlers";

function initAnimationLoopUnlimited() {
  let oldInterval: number;

  const render = () => {
    window.requestAnimationFrame((t) => {
      if (t - oldInterval !== 0) {
        const secondsTimelapse = (t - oldInterval) / 1000;
        const FPS = 1 / secondsTimelapse;
        if (FPS > 10) {
          GlobalState.getInstance().broadcastAnimationUpdate(FPS);
        }
        oldInterval = t;
      }
      render();
    });
  };

  window.requestAnimationFrame((t) => {
    oldInterval = t;
    render();
  });
}

function main() {
  const posterController = PosterController.getInstance();
  initPosterSpace();

  // init icon
  const musicControlContainer = document.querySelector(
    "#site-wall-text .container .music-control"
  )!;
  musicControlContainer.querySelector(".music-icon")!.innerHTML = icon.music(
    "rgba(225, 225, 225, 0.25)",
    "7em"
  );

  const musicControlSlider = document.querySelector("#site-music-control")!;
  musicControlSlider.querySelector(".icon-minus")!.innerHTML = icon.minus(
    "rgb(225, 225, 225)",
    "0.9em"
  );
  musicControlSlider.querySelector(".icon-plus")!.innerHTML = icon.add(
    "rgb(225, 225, 225)",
    "0.9em"
  );

  // init buttons
  const buttonInfo = document.querySelector("#site-button-info")!;
  const buttonNext = document.querySelector("#site-button-next")!;
  const buttonRefresh = document.querySelector("#site-button-refresh")!;
  const buttonGen = document.querySelector("#site-button-gen")!;

  const buttonInfoIcon = document.createElement("div");
  const buttonNextIcon = document.createElement("div");
  const buttonRefreshIcon = document.createElement("div");
  const buttonGenIcon = document.createElement("div");

  buttonInfoIcon.classList.add("icon");
  buttonNextIcon.classList.add("icon");
  buttonRefreshIcon.classList.add("icon");
  buttonGenIcon.classList.add("icon");

  buttonInfoIcon.innerHTML = icon.info("rgb(58, 58, 58)", "0.9em");
  buttonNextIcon.innerHTML = icon.next("rgb(225, 225, 225)", "0.9em");
  buttonRefreshIcon.innerHTML = icon.refresh("rgb(225, 225, 225)", "0.9em");
  buttonGenIcon.innerHTML = icon.add("rgb(225, 225, 225)", "0.9em");

  buttonInfo.appendChild(buttonInfoIcon);
  buttonNext.appendChild(buttonNextIcon);
  buttonRefresh.appendChild(buttonRefreshIcon);
  buttonGen.appendChild(buttonGenIcon);

  // initAnimationLoop();
  initAnimationLoopUnlimited();

  return () => {
    void posterController.init();
  };
}

window.addEventListener("load", () => {
  AudioController.getInstance();

  // prompt
  const sitePrompt: HTMLElement = document.querySelector("#site-prompt")!;
  const prompt = document.querySelector("#site-prompt .prompt")!;
  const loadingPrompts = ["·", "· ·", "· · ·"];

  let i = 0;
  const loadingPromptInterval = setInterval(() => {
    prompt.innerHTML =
      String(CONSTANTS.HTML_PROMPT_HARDWARE) + loadingPrompts[i];
    i = (i + 1) % loadingPrompts.length;
  }, 750);

  setTimeout(() => {
    clearInterval(loadingPromptInterval);

    // enter screen
    const siteInteractive = document.querySelector("#site-interactive")!;
    const enterScreen: HTMLDivElement = document.querySelector(
      "#site-preloading-prompt"
    )!;
    const enterScreenTitle: HTMLParagraphElement = document.querySelector(
      "#site-preloading-prompt .title"
    )!;
    const enterScreenButton: HTMLElement = document.querySelector(
      "#site-preloading-prompt .button"
    )!;

    const enterScreenTitleText = enterScreenTitle.innerText;
    enterScreenTitle.innerHTML = "";
    const clearFlickering = createFlickeringTextEl(
      enterScreenTitle,
      enterScreenTitleText
    );

    let mainInitFunc = () => {};
    enterScreen.onclick = () => {
      enterScreenButton.onclick = () => {};

      // start audio
      AudioController.getInstance().init();

      // mark loaded
      siteInteractive.classList.add("loaded");
      clearFlickering();
      setTimeout(() => {
        enterScreen.style.display = "none";
      }, 2000);

      // main InitFunc
      mainInitFunc();

      // set flickering footer
      const footerFirst: HTMLElement = document.querySelector(
        "#site-interactive .room .frame .control .first"
      )!;
      const footerSecond: HTMLElement = document.querySelector(
        "#site-interactive .room .frame .control .second"
      )!;
      const footerThird: HTMLElement = document.querySelector(
        "#site-interactive .room .frame .control .third"
      )!;

      const footerFirstText = footerFirst.innerText;
      const footerSecondText = footerSecond.innerText;
      const footerThirdText = footerThird.innerText;

      footerFirst.innerHTML = "";
      footerSecond.innerHTML = "";
      footerThird.innerHTML = "";

      createFlickeringTextEl(footerFirst, footerFirstText);
      createFlickeringTextEl(footerSecond, footerSecondText);
      createFlickeringTextEl(footerThird, footerThirdText);
    };
    prompt.innerHTML = "";
    sitePrompt.style.visibility = "hidden";
    mainInitFunc = main();
  }, 3000);
});
