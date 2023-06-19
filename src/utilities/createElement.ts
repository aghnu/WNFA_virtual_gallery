import AudioController from "@modules/backgroundAudioController";

export function createHTMLElement<T extends HTMLElement = HTMLElement>({
  tag,
  attributes = {},
  children = [],
  modifier = undefined,
}: {
  tag: string;
  attributes?: Record<string, string | string>;
  children?: HTMLElement[];
  modifier?: ((el: T) => void) | undefined;
}): T {
  const el = document.createElement(tag) as T;
  for (const att in attributes) {
    el.setAttribute(att, attributes[att]);
  }
  for (let i = 0; i < children.length; i++) {
    el.appendChild(children[i]);
  }
  if (modifier !== undefined) {
    modifier(el);
  }

  return el;
}

export function addButtonBehavior(
  btnEl: HTMLElement,
  downFunc: () => void,
  upFunc: () => void,
  {
    preventDefault = false,
    buttonSound = false,
  }: { preventDefault?: boolean; buttonSound?: boolean } = {}
) {
  let buttonDown = false;

  // touch events
  btnEl.addEventListener("touchstart", (e: Event) => {
    if (preventDefault) e.preventDefault();
    if (buttonSound) AudioController.getInstance().pressButtonDown();
    buttonDown = true;
    downFunc();
  });

  btnEl.addEventListener("touchend", (e: Event) => {
    if (preventDefault) e.preventDefault();
    buttonDown = false;
    if (buttonSound) AudioController.getInstance().pressButtonUp();
    upFunc();
  });

  btnEl.addEventListener("touchcancel", (e: Event) => {
    if (preventDefault) e.preventDefault();
    buttonDown = false;
    if (buttonSound) AudioController.getInstance().pressButtonUp();
    upFunc();
  });

  // click events
  btnEl.addEventListener("mousedown", (e: Event) => {
    if (preventDefault) e.preventDefault();

    buttonDown = true;
    if (buttonSound) AudioController.getInstance().pressButtonDown();
    downFunc();
  });

  btnEl.addEventListener("mouseup", (e: Event) => {
    if (preventDefault) e.preventDefault();

    buttonDown = false;
    if (buttonSound) AudioController.getInstance().pressButtonUp();
    upFunc();
  });

  // global up
  document.addEventListener("mouseup", () => {
    if (buttonDown) {
      buttonDown = false;
      if (buttonSound) AudioController.getInstance().pressButtonUp();
      upFunc();
    }
  });
}

type PosterControllerType = "result" | "posters";
export function getPostersControllerType(): [
  PosterControllerType,
  PosterControllerType
] {
  const url = new URL(String(window.location));
  const gallerySelection =
    url.searchParams.get("gallery") !== null
      ? url.searchParams.get("gallery")
      : "tiepian";

  switch (gallerySelection) {
    case "tiepian":
      return ["result", "posters"];
    case "huixiang":
      return ["posters", "result"];
    default:
      return ["result", "posters"];
  }
}
