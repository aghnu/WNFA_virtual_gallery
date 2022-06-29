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
    }

    static getInstance() {
        if (AudioControl._instance) {
            return AudioControl._instance;
        }

        return new AudioControl();
    }

    play() {
        this.audio.play();
    }
}