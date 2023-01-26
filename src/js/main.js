import "../style/styles.scss";
import { initSpace } from "./spaceController";
import { initPosters } from "./postersController";
import { icon } from "./svgFactory";
import { GlobalState } from "./globalState";
import { flickeringTextEl } from "./flickerText";
import { AudioControl } from "./backgroundAudioControl";

import Bowser from "bowser";

function initAnimationLoopUnlimited() {
  let oldInterval;

  const render = () => {
    window.requestAnimationFrame((t) => {
      if (t - oldInterval !== 0) {
        const seconds_timelapse = (t - oldInterval) / 1000;
        const FPS = 1 / seconds_timelapse;
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
  // initMovetracking();
  // loadPosters();
  const container = document.querySelector("#site-interactive");
  const room = document.querySelector("#site-interactive .room");
  const gallery = document.querySelector("#site-interactive .room .gallery");

  new GlobalState();
  initSpace(room, gallery, container);
  let postersInit = initPosters(gallery)["init"];

  // init icon
  const music_control_container = document.querySelector(
    "#site-wall-text .container .music-control"
  );
  const music_control_container_icon =
    music_control_container.querySelector(".music-icon");
  const music_control_container_text =
    music_control_container.querySelector(".volume-text");

  music_control_container_icon.innerHTML = icon["music"](
    "rgba(225, 225, 225, 0.25)",
    "7em"
  );

  const music_control_slider = document.querySelector("#site-music-control");
  music_control_slider.querySelector(".icon-minus").innerHTML = icon["minus"](
    "rgb(225, 225, 225)",
    "0.9em"
  );
  music_control_slider.querySelector(".icon-plus").innerHTML = icon["add"](
    "rgb(225, 225, 225)",
    "0.9em"
  );

  // init buttons
  const button_info = document.querySelector("#site-button-info");
  const button_next = document.querySelector("#site-button-next");
  const button_refresh = document.querySelector("#site-button-refresh");
  const button_gen = document.querySelector("#site-button-gen");

  const button_info_icon = document.createElement("div");
  const button_next_icon = document.createElement("div");
  const button_refresh_icon = document.createElement("div");
  const button_gen_icon = document.createElement("div");

  button_info_icon.classList.add("icon");
  button_next_icon.classList.add("icon");
  button_refresh_icon.classList.add("icon");
  button_gen_icon.classList.add("icon");

  button_info_icon.innerHTML = icon["info"]("rgb(58, 58, 58)", "0.9em");
  button_next_icon.innerHTML = icon["next"]("rgb(225, 225, 225)", "0.9em");
  button_refresh_icon.innerHTML = icon["refresh"](
    "rgb(225, 225, 225)",
    "0.9em"
  );
  button_gen_icon.innerHTML = icon["add"]("rgb(225, 225, 225)", "0.9em");

  button_info.appendChild(button_info_icon);
  button_next.appendChild(button_next_icon);
  button_refresh.appendChild(button_refresh_icon);
  button_gen.appendChild(button_gen_icon);

  // initAnimationLoop();
  initAnimationLoopUnlimited();

  return () => {
    postersInit();
  };
}

function browserIsSupported() {
  // broswers that are known to not render the site correctly
  const bowser = Bowser.getParser(window.navigator.userAgent);
  const notSupported = bowser.satisfies({
    chrome: "<92",
    chromium: "<92",
    ie: ">-0",

    Android: {
      WeChat: ">=0",
    },

    Windows: {
      WeChat: ">=0",
    },
  });

  return !notSupported;
}

window.addEventListener("load", () => {
  new AudioControl();

  // prompt
  const site_prompt = document.querySelector("#site-prompt");
  const prompt = document.querySelector("#site-prompt .prompt");

  const prompt_hardware_string_en =
    "If you encounter lag or visual artifact<br>Please make sure your broswer is up-to-date<br>and has hardware acceleration enabled";
  const prompt_hardware_string_cn =
    "如果遇到卡顿或渲染错误<br>请确保浏览器已经更新<br>并且支持硬件加速";

  const loadingPrompts = ["·", "· ·", "· · ·"];

  let i = 0;
  let loadingPromptInterval = setInterval(() => {
    prompt.innerHTML =
      prompt_hardware_string_en +
      "<br>" +
      prompt_hardware_string_cn +
      "<br><br>" +
      loadingPrompts[i];

    i = (i + 1) % loadingPrompts.length;
  }, 750);

  setTimeout(() => {
    clearInterval(loadingPromptInterval);

    if (browserIsSupported()) {
      // enter screen

      const site_interactive = document.querySelector("#site-interactive");
      const enter_screen = document.querySelector("#site-preloading-prompt");
      const enter_screen_title = document.querySelector(
        "#site-preloading-prompt .title"
      );
      const enter_screen_button = document.querySelector(
        "#site-preloading-prompt .button"
      );

      const enter_screen_title_text = enter_screen_title.innerText;
      enter_screen_title.innerHTML = "";
      let clearFlickering = flickeringTextEl(
        enter_screen_title,
        enter_screen_title_text
      );
      let mainInitFunc;

      enter_screen.onclick = () => {
        enter_screen_button.onclick = () => {};

        // start audio
        AudioControl.getInstance().init();

        // mark loaded
        site_interactive.classList.add("loaded");
        clearFlickering();
        setTimeout(() => {
          enter_screen.style.display = "none";
        }, 2000);

        // main InitFunc
        mainInitFunc();

        // set flickering footer
        const footer_first = document.querySelector(
          "#site-interactive .room .frame .control .first"
        );
        const footer_second = document.querySelector(
          "#site-interactive .room .frame .control .second"
        );
        const footer_third = document.querySelector(
          "#site-interactive .room .frame .control .third"
        );

        const footer_first_text = footer_first.innerText;
        const footer_second_text = footer_second.innerText;
        const footer_third_text = footer_third.innerText;

        footer_first.innerHTML = "";
        footer_second.innerHTML = "";
        footer_third.innerHTML = "";

        flickeringTextEl(footer_first, footer_first_text);
        flickeringTextEl(footer_second, footer_second_text);
        flickeringTextEl(footer_third, footer_third_text);
      };
      prompt.innerHTML = "";
      site_prompt.style.visibility = "hidden";
      mainInitFunc = main();
    } else {
      prompt.innerHTML =
        "Your browser cannot render correctly<br>Please use another browser" +
        "<br>" +
        "您的浏览器无法正常渲染内容<br>请使用其他浏览器打开";
    }
  }, 3000);
});
