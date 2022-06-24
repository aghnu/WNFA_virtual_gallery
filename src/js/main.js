import '../style/styles.scss';
import { initSpace } from './spaceController';
import { initPosters } from './postersController';

function main() {
    // initMovetracking();
    // loadPosters();
    const container = document.querySelector('#site-interactive');
    const room = document.querySelector('#site-interactive .room');
    const gallery = document.querySelector('#site-interactive .room .gallery');

    initSpace(room, gallery, container);
    initPosters(gallery);

}

window.addEventListener('load', main);