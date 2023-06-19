import GlobalState from "@modules/globalState";
import AudioController from "@modules/backgroundAudioController";
import { getImagesMeta } from "@/api";
import PosterController from "./PosterController";
import { type ImageMetaPayload } from "@type/ApiTypes";
import {
  addButtonBehavior,
  getPostersControllerType,
} from "@utilities/createElement";

class PosterRenderer {
  protected static instance: PosterRenderer | undefined;
  private meta: ImageMetaPayload | undefined = undefined;
  private posterController: PosterController = new PosterController("mockup");
  private textWallAnimationTimeout: number | undefined = undefined;
  private nextButtonAnimationTimeout: number | undefined = undefined;
  private genButtonAnimationTimeout: number | undefined = undefined;
  private refreshButtonAnimationTimeout: number | undefined = undefined;

  private readonly postersControllerType = getPostersControllerType();
  private readonly refreshButton: HTMLDivElement;
  private readonly nextButton: HTMLDivElement;
  private readonly infoButton: HTMLDivElement;
  private readonly genButton: HTMLDivElement;
  private readonly musicSlider: HTMLDivElement;
  private readonly siteWallText: HTMLDivElement;

  protected constructor() {
    this.refreshButton = document.querySelector("#site-button-refresh")!;
    this.nextButton = document.querySelector("#site-button-next")!;
    this.infoButton = document.querySelector("#site-button-info")!;
    this.genButton = document.querySelector("#site-button-gen")!;
    this.musicSlider = document.querySelector("#site-music-control")!;
    this.siteWallText = document.querySelector("#site-wall-text")!;

    GlobalState.getInstance().subscribeAnimationUpdate(() => {
      this.posterController.animationUpdateFunction();
    });
  }

  public static getInstance() {
    if (this.instance === undefined) this.instance = new PosterRenderer();
    return this.instance;
  }

  private switchGallery(type: "shift" | "pop" = "shift") {
    this.posterController.clean();
    if (this.meta === undefined) return;
    const selected =
      type === "shift"
        ? this.postersControllerType.shift()
        : this.postersControllerType.pop();
    if (selected === undefined) return;
    this.postersControllerType.push(selected);
    this.posterController = new PosterController(selected, this.meta);
  }

  public async init() {
    this.meta = await getImagesMeta();

    this.initButtonInfo();
    this.initButtonSlider();
    this.initButtonNext();
    this.initButtonGen();
    this.initButtonRefresh();

    this.switchGallery();
  }

  private initButtonInfo() {
    addButtonBehavior(
      this.infoButton,
      () => {
        this.siteWallText.classList.remove("text");
        this.siteWallText.classList.remove("music");
        clearTimeout(this.textWallAnimationTimeout);
        this.infoButton.classList.add("pressed");
        this.siteWallText.classList.add("text");
        this.siteWallText.classList.add("focus");
        this.posterController.hide(() => {});
      },
      () => {
        this.siteWallText.classList.remove("focus");
        this.infoButton.classList.remove("pressed");
        this.textWallAnimationTimeout = window.setTimeout(() => {
          this.siteWallText.classList.remove("text");
        }, 750);

        this.posterController.show(() => {});
      },
      { buttonSound: true, preventDefault: true }
    );
  }

  private initButtonSlider() {
    addButtonBehavior(
      this.musicSlider,
      () => {
        this.siteWallText.classList.remove("text");
        this.siteWallText.classList.remove("music");
        clearTimeout(this.textWallAnimationTimeout);
        this.musicSlider.classList.add("pressed");
        this.siteWallText.classList.add("music");
        this.siteWallText.classList.add("focus");
        this.posterController.hide(() => {}, false);
      },
      () => {
        this.musicSlider.classList.remove("pressed");
        this.siteWallText.classList.remove("focus");
        this.textWallAnimationTimeout = window.setTimeout(() => {
          this.siteWallText.classList.remove("music");
        }, 750);
        this.posterController.show(() => {});
      }
    );
    const musicSliderInput = this.musicSlider.querySelector("input")!;
    const musicTextWallVolume: HTMLElement = this.siteWallText.querySelector(
      ".container .music-control .volume-text"
    )!;
    const changeVolume = (options: { fade: boolean }) => {
      const volume = Math.round(Number(musicSliderInput.value));
      musicTextWallVolume.style.filter = `saturate(${volume / 100})`;
      musicTextWallVolume.innerText = String(volume);
      AudioController.getInstance().setVolume(volume / 100, options);
    };
    changeVolume({ fade: true });
    musicSliderInput.addEventListener("input", () => {
      changeVolume({ fade: false });
    });
  }

  private initButtonNext() {
    addButtonBehavior(
      this.nextButton,
      () => {
        clearTimeout(this.nextButtonAnimationTimeout);
        this.posterController.clean();
        this.nextButton.classList.add("pressed");
      },
      () => {
        this.nextButtonAnimationTimeout = window.setTimeout(() => {
          this.switchGallery();
        }, 750);
        this.nextButton.classList.remove("pressed");
      },
      { buttonSound: true, preventDefault: true }
    );
  }

  private initButtonGen() {
    addButtonBehavior(
      this.genButton,
      () => {
        clearTimeout(this.genButtonAnimationTimeout);
        this.genButton.classList.add("pressed");
      },
      () => {
        this.genButtonAnimationTimeout = window.setTimeout(() => {
          window.open("https://www.aghnu.me/WNFA");
        }, 500);

        this.genButton.classList.remove("pressed");
      },
      { buttonSound: true, preventDefault: true }
    );
  }

  private initButtonRefresh() {
    addButtonBehavior(
      this.refreshButton,
      () => {
        clearTimeout(this.refreshButtonAnimationTimeout);
        this.posterController.clean();
        this.refreshButton.classList.add("pressed");
      },
      () => {
        this.refreshButtonAnimationTimeout = window.setTimeout(() => {
          this.switchGallery("pop");
        }, 750);
        this.refreshButton.classList.remove("pressed");
      },
      { buttonSound: true, preventDefault: true }
    );
  }
}

export default PosterRenderer;
