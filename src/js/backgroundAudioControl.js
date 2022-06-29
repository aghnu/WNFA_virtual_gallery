import bga from '../audio/Bach Cello Suite No.1 - Prelude (Yo-Yo Ma).mp3';

export class AudioControl {
    constructor() {
        if (AudioControl._instance) {
            return AudioControl._instance;
        }

        AudioControl._instance = this;

        // init
        // prepare audio
        this.audio = document.createElement('audio');
        this.audio.loop = true;
        this.audio.src = bga;

        this.fadingInterval;
        this.fadingTime = 1.5;            // 1s
        this.fadingStep = 0.05;
        this.audio.volume = 0;

        this.canPlay = false;
    }

    static getInstance() {
        if (AudioControl._instance) {
            return AudioControl._instance;
        }

        return new AudioControl();
    }

    fadeIn(callback=()=>{}) {
        clearInterval(this.fadingInterval);
        this.fadingInterval = setInterval(() => {
            if (this.audio.volume === 1) {
                clearInterval(this.fadingInterval);
                callback();
            } else {
                this.audio.volume = Math.min(this.audio.volume + this.fadingStep, 1);
            }
        }, this.fadingTime * 1000 / (1 / this.fadingStep));
    }

    fadeOut(callback=()=>{}) {
        clearInterval(this.fadingInterval);
        this.fadingInterval = setInterval(() => {
            if (this.audio.volume === 0) {
                clearInterval(this.fadingInterval);
                callback();
            } else {
                this.audio.volume = Math.max(this.audio.volume - this.fadingStep, 0);
            }
        }, this.fadingTime * 1000 / (1 /this.fadingStep));
    }

    play() {
        if (this.canPlay) {
            clearInterval(this.fadingInterval);
            if (this.audio.paused) {
                this.audio.play();
            }
            this.fadeIn();            
        }
    }

    pause() {
        if (this.canPlay) {
            clearInterval(this.fadingInterval);
            this.fadeOut(()=>{
                if (!this.audio.paused) {
                    this.audio.pause();
                }
            });            
        }
    }

    init() {
        this.canPlay = true;
    }
}