import bga from '../audio/Bach Cello Suite No.1 - Prelude (Yo-Yo Ma).mp3';
import buttonDown from '../audio/button_down.mp3';
import buttonUp from '../audio/button_up.mp3';


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
        this.shouldPlay = false;


        // prepare other audios
        this.button_up_audio = document.createElement('audio');
        this.button_down_audio = document.createElement('audio');

        this.button_up_audio.src = buttonUp;
        this.button_down_audio.src = buttonDown;

        this.button_up_audio.volume = 0.85;
        this.button_down_audio.volume = 0.85;

        this.button_up_audio_played = false;
        this.button_down_audio_played = false; 
    }

    static getInstance() {
        if (AudioControl._instance) {
            return AudioControl._instance;
        }

        return new AudioControl();
    }

    isReady() {
        return (
            this.audio.readyState >=3 && 
            this.button_up_audio.readyState >= 3 &&
            this.button_down_audio.readyState >=3    
        )
    }

    pressButtonDown() {
        if (this.button_down_audio.ended || !this.button_down_audio_played) {
            this.button_down_audio_played = true;
            this.button_down_audio.play();
        }
    }

    pressButtonUp() {
        if (this.button_up_audio.ended || !this.button_up_audio_played) {
            this.button_up_audio_played = true;
            this.button_up_audio.play();
        }
    }

    fadeIn(callback=()=>{}) {
        clearInterval(this.fadingInterval);
        this.fadingInterval = setInterval(() => {
            if (this.canPlay) {
                if (this.audio.volume === 1) {
                    clearInterval(this.fadingInterval);
                    callback();
                } else {
                    this.audio.volume = Math.min(this.audio.volume + this.fadingStep, 1);
                }                
            } else {
                clearInterval(this.fadingInterval);
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
        }, this.fadingTime * 1000 / (1 / this.fadingStep));
    }

    play() {
        this.shouldPlay = true;
        if (this.canPlay) {
            clearInterval(this.fadingInterval);
            if (this.audio.paused) {
                this.audio.play();
            }
            this.fadeIn();            
        }
    }

    pause() {
        this.shouldPlay = false;
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
        if (this.shouldPlay) {
            if (this.audio.paused) {
                this.audio.play();
            }
            this.fadeIn();
        }
    }

    drop() {
        this.canPlay = false;
        this.fadeOut(()=>{
            if (!this.audio.paused) {
                this.audio.pause();
            }
        });
    }
}