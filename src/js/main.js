import '../style/styles.scss';
import { initSpace } from './spaceController';
import { initPosters } from './postersController';
import { icon } from './svgFactory';
import { GlobalState } from './globalState';

function main() {
    // initMovetracking();
    // loadPosters();
    const container = document.querySelector('#site-interactive');
    const room = document.querySelector('#site-interactive .room');
    const gallery = document.querySelector('#site-interactive .room .gallery');

    new GlobalState();
    initSpace(room, gallery, container);
    initPosters(gallery);

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
}


window.addEventListener('load', () => {
    const site_prompt = document.querySelector('#site-prompt');
    const prompt = document.querySelector('#site-prompt .prompt');    

    const loadingPrompts = [
        'loading<br>.',
        'loading<br>. .',
        'loading<br>. . .',
    ]

    let i = 0;
    let loadingPromptInterval = setInterval(() => {
        prompt.innerHTML = loadingPrompts[i];
        i = (i + 1) % loadingPrompts.length;
    }, 750);

    // pre-render code here
    // for now it is useless
    setTimeout(() => {
        clearInterval(loadingPromptInterval);
        prompt.innerHTML = '';
        site_prompt.style.visibility = 'hidden';
        main();
    }, 3000);

});