import { initSpace } from "./spaceUpdate";

function initPosterSpace() {
  const container: HTMLElement = document.querySelector("#site-interactive")!;
  const room: HTMLElement = document.querySelector("#site-interactive .room")!;
  const gallery: HTMLElement = document.querySelector(
    "#site-interactive .room .gallery"
  )!;

  void initSpace(room, gallery, container);
}

export default initPosterSpace;
