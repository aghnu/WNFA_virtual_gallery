import { createHTMLElement } from "@utilities/createElement";

import buttonDown from "@static/audio/button_down.mp3";
import buttonUp from "@static/audio/button_up.mp3";
import bga from "@static/audio/Bach Cello Suite No.1 - Prelude (Yo-Yo Ma).mp3";

interface AudioConfig {
  fadingTime: number;
  fadingStep: number;
}

interface AudioState {
  volumnCurrent: number;
  canPlay: boolean;
  shouldPlay: boolean;
  buttonUpPlayed: boolean;
  buttonDownPlayed: boolean;
}

class AudioController {
  protected static instance: AudioController | undefined;
  protected fadingInterval: number | undefined;
  protected audioConfig: AudioConfig;
  protected audioState: AudioState;
  protected audio: HTMLAudioElement;
  protected audioBtnUp: HTMLAudioElement;
  protected audioBtnDown: HTMLAudioElement;

  protected constructor() {
    // configs
    this.audioConfig = {
      fadingTime: 1.5,
      fadingStep: 0.05,
    };
    this.audioState = {
      volumnCurrent: 0,
      canPlay: false,
      shouldPlay: false,
      buttonDownPlayed: false,
      buttonUpPlayed: false,
    };

    // main audio
    this.audio = createHTMLElement<HTMLAudioElement>({
      tag: "audio",
      modifier: (el) => {
        el.src = bga;
        el.loop = true;
        el.volume = this.audioState.volumnCurrent;
      },
    });

    this.audioBtnUp = createHTMLElement<HTMLAudioElement>({
      tag: "audio",
      modifier: (el) => {
        el.src = buttonUp;
        el.volume = 0.85;
      },
    });

    this.audioBtnDown = createHTMLElement<HTMLAudioElement>({
      tag: "audio",
      modifier: (el) => {
        el.src = buttonDown;
        el.volume = 0.85;
      },
    });
  }

  public static getInstance() {
    if (this.instance === undefined) this.instance = new AudioController();
    return this.instance;
  }

  public isReady() {
    return (
      this.audio.readyState >= 3 &&
      this.audioBtnUp.readyState >= 3 &&
      this.audioBtnDown.readyState >= 3
    );
  }

  public pressButtonDown() {
    if (this.audioBtnDown.ended || !this.audioState.buttonDownPlayed) {
      this.audioState.buttonDownPlayed = true;
      void this.audioBtnDown.play();
    }
  }

  public pressButtonUp() {
    if (this.audioBtnUp.ended || !this.audioState.buttonUpPlayed) {
      this.audioState.buttonUpPlayed = true;
      void this.audioBtnUp.play();
    }
  }

  public setVolume(volume: number, { fade = false }: { fade?: boolean } = {}) {
    this.audioState.volumnCurrent = volume;
    if (fade) this.fadeIn();
    else this.audio.volume = this.audioState.volumnCurrent;
  }

  private fadeIn(callback = () => {}) {
    clearInterval(this.fadingInterval);
    this.fadingInterval = window.setInterval(() => {
      if (this.audioState.canPlay) {
        if (this.audio.volume === this.audioState.volumnCurrent) {
          clearInterval(this.fadingInterval);
          callback();
        } else {
          this.audio.volume = Math.min(
            this.audio.volume + this.audioConfig.fadingStep,
            this.audioState.volumnCurrent
          );
        }
      } else {
        clearInterval(this.fadingInterval);
      }
    }, (this.audioConfig.fadingTime * 1000) / (1 / this.audioConfig.fadingStep));
  }

  private fadeOut(callback = () => {}) {
    clearInterval(this.fadingInterval);
    this.fadingInterval = window.setInterval(() => {
      if (this.audio.volume === 0) {
        clearInterval(this.fadingInterval);
        callback();
      } else {
        this.audio.volume = Math.max(
          this.audio.volume - this.audioConfig.fadingStep,
          0
        );
      }
    }, (this.audioConfig.fadingTime * 1000) / (1 / this.audioConfig.fadingStep));
  }

  public play() {
    this.audioState.shouldPlay = true;
    if (this.audioState.canPlay) {
      clearInterval(this.fadingInterval);
      if (this.audio.paused) {
        void this.audio.play();
      }
      this.fadeIn();
    }
  }

  public pause() {
    this.audioState.shouldPlay = false;
    if (this.audioState.canPlay) {
      clearInterval(this.fadingInterval);
      this.fadeOut(() => {
        if (!this.audio.paused) {
          this.audio.pause();
        }
      });
    }
  }

  public init() {
    this.audioState.canPlay = true;
    if (this.audioState.shouldPlay) {
      if (this.audio.paused) {
        void this.audio.play();
      }
      this.fadeIn();
    }
  }

  public drop() {
    this.audioState.canPlay = false;
    this.fadeOut(() => {
      if (!this.audio.paused) {
        this.audio.pause();
      }
    });
  }
}

export default AudioController;
