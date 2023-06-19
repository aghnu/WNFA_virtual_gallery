import { type ImageMetaPayload } from "@type/ApiTypes";
import GlobalState from "@modules/globalState";
import AudioController from "@modules/backgroundAudioController";
import { createPosterElement } from "./helperPosterCreation";
import { getImageResult, getImagePoster } from "@api/images";
import type {
  PosterElement,
  PosterElementDiv,
  PosterElementImg,
} from "@type/PosterTypes";

class PosterController {
  private pause: boolean = false;
  private pauseForFocus: boolean = false;
  private readonly rotateSpeedUpAnimationSpeed = 1.25;
  private readonly rotateSpeedTarget = 30;
  private readonly posters: PosterElement[] = [];
  private readonly imageMeta: ImageMetaPayload | undefined;

  private preLoadingInterval: undefined | number;
  private postLoadingInterval: undefined | number;
  private animationTimeout: undefined | number;
  private speedUpAnimationInterval: undefined | number;

  private readonly galleryEl: HTMLDivElement;
  private readonly wallTextEl: HTMLDivElement;
  private readonly sitePosterDetailLayer: HTMLDivElement;
  private readonly siteInteractive: HTMLDivElement;
  private readonly siteRoom: HTMLDivElement;
  private readonly lightingEl: HTMLDivElement;

  constructor(
    type: "result" | "posters" | "mockup",
    imageMeta: ImageMetaPayload | undefined = undefined
  ) {
    this.imageMeta = imageMeta;

    this.galleryEl = document.querySelector(
      "#site-interactive .room .gallery"
    )!;
    this.siteRoom = document.querySelector("#site-interactive-room")!;
    this.siteInteractive = document.querySelector("#site-interactive")!;
    this.wallTextEl = document.querySelector("#site-wall-text")!;
    this.sitePosterDetailLayer = document.querySelector(
      "#site-poster-detail-layer"
    )!;
    this.lightingEl = document.querySelector("#site-interactive .lighting")!;

    this.siteRoom.classList.remove("tiepian");
    this.siteRoom.classList.remove("huixiang");

    switch (type) {
      case "result":
        this.rotateSpeedUp(() => {});
        this.pause = false;
        void this.loadResults();

        this.siteRoom.classList.add("tiepian");
        this.siteInteractive.classList.add("lightup");
        this.wallTextEl.classList.add("show");
        AudioController.getInstance().play();
        break;
      case "posters":
        this.rotateSpeedUp(() => {});
        this.pause = false;
        void this.loadPosters();

        this.siteRoom.classList.add("huixiang");
        this.siteInteractive.classList.add("lightup");
        this.wallTextEl.classList.add("show");
        AudioController.getInstance().play();
        break;
      case "mockup":
        this.pause = false;
        void this.loadMockups();
        break;
    }
  }

  public animationUpdateFunction() {
    for (let i = 0; i < this.posters.length; i++) {
      const el = this.posters[i];
      el.updateAnimation();
    }
  }

  private initPosterPointerListeners(el: PosterElementImg) {
    el.onmouseenter = () => {
      this.wallTextEl.classList.remove("show");
      GlobalState.getInstance().state.onPoster = true;
      this.focusPoster(el);
    };

    el.onmouseleave = () => {
      this.wallTextEl.classList.add("show");
      GlobalState.getInstance().state.onPoster = false;
      this.defocusPoster(el);
    };

    el.onclick = () => {
      this.wallTextEl.classList.add("show");
      GlobalState.getInstance().state.onPoster = false;
      this.defocusPoster(el);

      const showEl = document.createElement("img");
      showEl.classList.add("show");
      showEl.src = el.src;

      this.hideAllPosters(() => {
        this.sitePosterDetailLayer.classList.add("show");
        this.sitePosterDetailLayer.appendChild(showEl);
        this.sitePosterDetailLayer.onclick = () => {
          this.sitePosterDetailLayer.onclick = () => {};
          this.sitePosterDetailLayer.classList.remove("show");
          setTimeout(() => {
            this.sitePosterDetailLayer.removeChild(showEl);
            this.showAllPosters(() => {});
          }, 500);
        };
      });
    };
  }

  private hideAllPosters(callback = () => {}) {
    this.pause = true;
    for (let i = 0; i < this.posters.length; i++) {
      const el = this.posters[i];
      el.classList.add("hide");
    }
    callback();
  }

  private showAllPosters(callback = () => {}) {
    for (let i = 0; i < this.posters.length; i++) {
      const el = this.posters[i];
      el.classList.remove("hide");
    }
    this.pause = false;
    callback();
  }

  public createPoster(url?: string | undefined) {
    const type = url === undefined ? "div" : "img";
    const el =
      type === "div"
        ? createPosterElement<PosterElementDiv>(type, (el) => {
            el.classList.add("mockup");
          })
        : createPosterElement<PosterElementImg>(type, (el) => {
            if (url !== undefined) el.src = url;
            this.initPosterPointerListeners(el);
          });

    return el;
  }

  public focusPoster = (focusEl: PosterElement) => {
    this.pauseForFocus = true;
    this.posters.forEach((p) => {
      if (p === focusEl) p.classList.add("focus");
      else p.classList.add("fade");
    });
  };

  public defocusPoster = (focusEl: PosterElement) => {
    this.pauseForFocus = false;
    this.posters.forEach((p) => {
      if (p === focusEl) p.classList.remove("focus");
      else p.classList.remove("fade");
    });
  };

  public appendPoster(el: PosterElement) {
    this.galleryEl.appendChild(el);
    this.posters.push(el);
    setTimeout(() => {
      const setShow = setInterval(() => {
        if (
          !this.pause &&
          GlobalState.getInstance().canRotate() &&
          !this.pauseForFocus
        ) {
          clearInterval(setShow);
          el.classList.add("show");
        }
      }, 100);
    }, 100);
  }

  public removeLastPoster() {
    if (this.posters.length !== 0) {
      const el = this.posters.shift();
      if (el === undefined) return;
      el.classList.remove("show");
      setTimeout(() => {
        if (el.parentElement === null) return;
        el.parentElement.removeChild(el);
      }, 500);
    }
    return null;
  }

  public removeAllPosters(callback = () => {}) {
    while (this.posters.length !== 0) {
      this.removeLastPoster();
    }
    callback();
  }

  public canLoad() {
    return (
      !this.pause &&
      GlobalState.getInstance().state.focus &&
      GlobalState.getInstance().canRotate() &&
      !this.pauseForFocus
    );
  }

  private async loadResults() {
    if (this.imageMeta === undefined) return;
    const postersNum = this.imageMeta.results.total;
    let i = 1;
    let next = true;
    const NUM_RESULTS = 22;

    this.preLoadingInterval = window.setInterval(() => {
      if (this.canLoad() && next) {
        // fetch one image
        next = false;
        getImageResult(Math.floor(Math.random() * postersNum + 1))
          .then((url) => {
            if (this.canLoad()) {
              this.appendPoster(this.createPoster(url));
              i += 1;
            }
            next = true;
          })
          .catch(() => {
            next = true;
          });

        if (i >= NUM_RESULTS) {
          clearInterval(this.preLoadingInterval);
          this.postLoadingInterval = window.setInterval(() => {
            if (this.canLoad() && next) {
              // fetch one image
              next = false;
              getImageResult(Math.floor(Math.random() * postersNum + 1))
                .then((url) => {
                  if (this.canLoad()) {
                    this.removeLastPoster();
                    this.appendPoster(this.createPoster(url));
                    i += 1;
                  }
                  next = true;
                })
                .catch(() => {
                  next = true;
                });
            }
          }, 5000);
        }
      }
    }, 100);
  }

  private async loadPosters() {
    if (this.imageMeta === undefined) return;
    const postersNum = this.imageMeta.posters.total;
    let i = 1;
    let next = true;
    this.preLoadingInterval = window.setInterval(() => {
      if (this.canLoad() && next) {
        // fetch one image
        next = false;
        getImagePoster(i)
          .then((url) => {
            if (this.canLoad()) {
              this.appendPoster(this.createPoster(url));
              i++;
            }
            next = true;
          })
          .catch(() => {
            next = true;
          });

        if (i >= postersNum) {
          clearInterval(this.preLoadingInterval);
        }
      }
    }, 100);
  }

  private async loadMockups() {
    const mockupNum = 20;
    for (let i = 0; i < mockupNum; i++) {
      this.appendPoster(this.createPoster());
    }
  }

  private rotateSpeedUp(callback = () => {}) {
    clearInterval(this.speedUpAnimationInterval);
    GlobalState.getInstance().state.rotateSpeed = 0.5;
    this.speedUpAnimationInterval = window.setInterval(() => {
      if (
        !this.pause &&
        GlobalState.getInstance().canRotate() &&
        !this.pauseForFocus
      ) {
        const target =
          GlobalState.getInstance().state.rotateSpeed *
          this.rotateSpeedUpAnimationSpeed;
        if (target > this.rotateSpeedTarget) {
          GlobalState.getInstance().state.rotateSpeed = this.rotateSpeedTarget;
          clearInterval(this.speedUpAnimationInterval);
          callback();
        } else {
          GlobalState.getInstance().state.rotateSpeed = target;
        }
      }
    }, 250);
  }

  public clean() {
    this.pause = true;
    AudioController.getInstance().pause();
    clearInterval(this.preLoadingInterval);
    clearInterval(this.postLoadingInterval);
    clearTimeout(this.animationTimeout);
    this.removeAllPosters(() => {
      this.siteInteractive.classList.remove("lightup");
      this.wallTextEl.classList.remove("show");
    });
  }

  public refresh() {
    this.pause = true;
    AudioController.getInstance().pause();
    clearInterval(this.preLoadingInterval);
    clearInterval(this.postLoadingInterval);
    clearTimeout(this.animationTimeout);
    this.removeAllPosters(() => {
      this.siteInteractive.classList.remove("lightup");
      this.wallTextEl.classList.remove("show");
    });
  }

  public hide(callback: () => void, audioPause = true) {
    this.lightingEl.classList.add("hide");
    if (audioPause) AudioController.getInstance().pause();
    GlobalState.getInstance().state.onPoster = true;
    this.hideAllPosters(() => {
      this.animationTimeout = window.setTimeout(() => {
        callback();
      }, 1000);
    });
  }

  public show(callback: () => void) {
    this.lightingEl.classList.remove("hide");
    AudioController.getInstance().play();
    GlobalState.getInstance().state.onPoster = false;

    this.showAllPosters(() => {
      this.animationTimeout = window.setTimeout(() => {
        callback();
      }, 1000);
    });
  }
}

export default PosterController;
