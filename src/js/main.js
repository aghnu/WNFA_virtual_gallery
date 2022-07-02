import '../style/styles.scss';
import { initSpace } from './spaceController';
import { initPosters } from './postersController';
import { icon } from './svgFactory';
import { GlobalState } from './globalState';
import { flickeringTextEl } from './flickerText';
import { AudioControl } from './backgroundAudioControl';

import Bowser from 'bowser';



function initAnimationLoop() {
    const animationFPS = 60;
    let oldInterval;

    window.requestAnimationFrame((t) => {
        oldInterval = t; 
    });

    setInterval(() => {

        window.requestAnimationFrame((t) => {
            const seconds_timelapse = (t-oldInterval) / 1000;
            const FPS = 1 / seconds_timelapse;
            GlobalState.getInstance().broadcastAnimationUpdate(FPS);   
            oldInterval = t;         
            // console.log(GlobalState.getInstance().animationUpdateListeners.length);
        });

    }, 1000 / animationFPS);

}

function main() {
    // initMovetracking();
    // loadPosters();
    const container = document.querySelector('#site-interactive');
    const room = document.querySelector('#site-interactive .room');
    const gallery = document.querySelector('#site-interactive .room .gallery');

    new GlobalState();
    new AudioControl();
    initSpace(room, gallery, container);
    let postersInit = initPosters(gallery)['init'];

    // // init logos
    // const logo_tiepian = document.querySelector('#logo-tiepian');
    // const logo_huixiang = document.querySelector('#logo-huixiang');



    // init buttons
    const button_info = document.querySelector('#site-button-info');
    const button_next = document.querySelector('#site-button-next');
    const button_refresh = document.querySelector('#site-button-refresh');

    const button_info_icon = document.createElement('div');
    const button_next_icon = document.createElement('div');
    const button_refresh_icon = document.createElement('div');

    button_info_icon.classList.add('icon');
    button_next_icon.classList.add('icon');
    button_refresh_icon.classList.add('icon');

    button_info_icon.innerHTML = (icon['info']('rgb(58, 58, 58)', '0.75em'));
    button_next_icon.innerHTML = (icon['next']('rgb(225, 225, 225)', '0.75em'));
    button_refresh_icon.innerHTML = (icon['refresh']('rgb(225, 225, 225)', '0.75em'));

    button_info.appendChild(button_info_icon);
    button_next.appendChild(button_next_icon);
    button_refresh.appendChild(button_refresh_icon);
    
    initAnimationLoop();
    
    return () => {
        postersInit();
    }

    
}

function browserIsSupported() {
    // broswers that are known to not render the site correctly
    const bowser = Bowser.getParser(window.navigator.userAgent);
    const notSupported = bowser.satisfies({
        chrome:         "<92",
        chromium:       "<92",
        ie:             ">-0",
        
        Android: {
            WeChat:     ">=0",
        },

        Windows: {
            WeChat:     ">=0",
        },
    });

    return !notSupported;
}

window.addEventListener('load', () => {

    // prompt
    const site_prompt = document.querySelector('#site-prompt');
    const prompt = document.querySelector('#site-prompt .prompt');    

    const prompt_hardware_string_en = 'If you encounter lag or visual artifact<br>Please make sure your broswer is up-to-date<br>and has hardware acceleration enabled';
    const prompt_hardware_string_cn = '如果遇到卡顿或渲染错误<br>请确保浏览器已经更新<br>并且支持硬件加速';

    const loadingPrompts = [
        '·',
        '· ·',
        '· · ·',
    ]

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

    setTimeout(()=>{
        clearInterval(loadingPromptInterval);
        

        if (browserIsSupported()) {
            // enter screen

            const site_interactive = document.querySelector('#site-interactive');
            const enter_screen = document.querySelector('#site-preloading-prompt');
            const enter_screen_title = document.querySelector('#site-preloading-prompt .title');
            const enter_screen_button = document.querySelector('#site-preloading-prompt .button');

            const enter_screen_title_text = enter_screen_title.innerText;
            enter_screen_title.innerHTML = '';
            let clearFlickering = flickeringTextEl(enter_screen_title, enter_screen_title_text);
            let mainInitFunc;

            enter_screen.onclick = () => {
                enter_screen_button.onclick = () => {};

                // start audio
                AudioControl.getInstance().init();

                // mark loaded
                site_interactive.classList.add('loaded');
                clearFlickering();
                setTimeout(() => {
                    enter_screen.style.display = 'none';
                }, 2000);

                // main InitFunc
                mainInitFunc();

                // set flickering footer
                const footer_first = document.querySelector('#site-interactive .room .frame .control .first');
                const footer_second = document.querySelector('#site-interactive .room .frame .control .second');
                const footer_third = document.querySelector('#site-interactive .room .frame .control .third');
                
                const footer_first_text = footer_first.innerText;
                const footer_second_text = footer_second.innerText;
                const footer_third_text = footer_third.innerText;

                footer_first.innerHTML = "";
                footer_second.innerHTML = "";
                footer_third.innerHTML = "";

                flickeringTextEl(footer_first, footer_first_text);
                flickeringTextEl(footer_second, footer_second_text);
                flickeringTextEl(footer_third, footer_third_text);
            }
            prompt.innerHTML = "";
            site_prompt.style.visibility = 'hidden';
            mainInitFunc = main();            
        } else {
            prompt.innerHTML = 
                "Your browser cannot render correctly<br>Please use another browser" +
                "<br>" +
                "您的浏览器无法正常渲染内容<br>请使用其他浏览器打开"
        }
    }, 5000)
});