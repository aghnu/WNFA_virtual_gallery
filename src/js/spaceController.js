import { GlobalState } from "./globalState";
import { AudioControl } from "./backgroundAudioControl";

const FOCUS_UPDATE_ANIMATION_SPEED = 0.25;
const MIN_FPS_ALLOWED = 5;
// const UPDATE_FPS = 60;

let focus = true;

function focusUpdate(FPS) {
    const space_info = GlobalState.getInstance().space_info;


    if (FPS * FOCUS_UPDATE_ANIMATION_SPEED > 1) {
        if (Math.abs(space_info.pointerX - space_info.focusX) > 1) {
            space_info.focusX = space_info.focusX + (space_info.pointerX - space_info.focusX) / (FOCUS_UPDATE_ANIMATION_SPEED * FPS);
        } else {
            space_info.focusX = space_info.pointerX;
        }

        if (Math.abs(space_info.pointerY - space_info.focusY) > 1) {
            space_info.focusY = space_info.focusY + (space_info.pointerY - space_info.focusY) / (FOCUS_UPDATE_ANIMATION_SPEED * FPS);
        } else {
            space_info.focusY = space_info.pointerY;
        }        

        if (Math.abs(space_info.rotateDeg - space_info.rotateDegFocus) > 1) {
            if ((space_info.rotateDeg - space_info.rotateDegFocus) > 0) {
                space_info.rotateDirection = 1;
            } else {
                space_info.rotateDirection = -1;
            }
            space_info.rotateDegFocus = (space_info.rotateDegFocus + (space_info.rotateDeg - space_info.rotateDegFocus) / (FOCUS_UPDATE_ANIMATION_SPEED * FPS));
        } else {
            space_info.rotateDegFocus = space_info.rotateDeg;
        }            
    }

    GlobalState.getInstance().space_info = space_info;
}

function rotateUpdate(el, originalTransformMatrix=null) {
    if (originalTransformMatrix !== null) {
        el.style.transform = originalTransformMatrix + `rotateY(${GlobalState.getInstance().space_info.rotateDegFocus}deg)`;
    } else {
        el.style.transform = `rotateY(${GlobalState.getInstance().space_info.rotateDegFocus}deg)`;
    }
}

function spaceUpdate(spaceEl, boundingEl) {
    
    const max_degree = 50;
    const boxEl = spaceEl.getBoundingClientRect();
    const boxBody = boundingEl.getBoundingClientRect();
    
    // const bodyRatio = boxBody.height/boxBody.width;
    // const max_degree_x = max_degree * bodyRatio;
    // const max_degree_y = max_degree / bodyRatio;

    const centerX = boxEl.left + boxEl.width / 2;
    const centerY = boxEl.top + boxEl.height / 2;

    const distanceX = GlobalState.getInstance().space_info.focusX - centerX;
    const distanceY = GlobalState.getInstance().space_info.focusY - centerY;

    const distanceFactorX = distanceX / (boxBody.width/ 2);
    const distanceFactorY = distanceY / (boxBody.height / 2);

    // let calc_rotate_y = (distanceFactorX * max_degree_x) / ((boxBody.height + 600)/600);
    // let calc_rotate_x = (-distanceFactorY * max_degree_y) / ((boxBody.width + 600)/600);

    // if (Math.abs(calc_rotate_y) > max_degree) {
    //     calc_rotate_y = calc_rotate_y / Math.abs(calc_rotate_y) * max_degree;
    // }

    // if (Math.abs(calc_rotate_x) > max_degree) {
    //     calc_rotate_x = calc_rotate_x / Math.abs(calc_rotate_x) * max_degree;
    // }


    // let calc_rotate_y = (50 - distanceFactorY * max_degree) / ((boxBody.height + 600)/600);
    // let calc_rotate_x = (50 - distanceFactorX * max_degree) / ((boxBody.width + 600)/600);

    let calc_rotate_y = 50 - distanceFactorY * max_degree / ((boxBody.height + 600)/600);
    let calc_rotate_x = 50 - distanceFactorX * max_degree / ((boxBody.width + 600)/600);


    boundingEl.style.perspectiveOrigin = `${calc_rotate_x}% ${calc_rotate_y}%`
    // console.log(boundingEl.style.perspectiveOrigin);
    // spaceEl.style.transform = `rotateX(${calc_rotate_x}deg) rotateY(${calc_rotate_y}deg)`;
    // console.log(boundingEl.style.perspectiveOrigin);

    // console.log(distanceFactorX + " " + distanceFactorY);
}

export function initSpace(spaceEl, rotateEl, boundingEl) {
    // setup listeners
    const initSpace = () => {
        const box = spaceEl.getBoundingClientRect();
        GlobalState.getInstance().space_info.pointerX = box.left + box.width / 2;
        GlobalState.getInstance().space_info.pointerY = box.top + box.height / 2;
    }
    const checkRatio = () => {
        const box = boundingEl.getBoundingClientRect();
        const boxRatio = box.width / box.height;
        const site_prompt = document.querySelector('#site-prompt');
        const prompt = document.querySelector('#site-prompt .prompt');
        
        // support up to 21:9 9:21 ratio
        if ((boxRatio < 0.4) || (boxRatio > 2.5)) {
            prompt.innerHTML = 'Window ratio not supported';
            site_prompt.style.visibility = 'visible';
        } else {
            site_prompt.style.visibility = 'hidden';
            prompt.innerHTML = '';
            
            const site_interactive = document.querySelector('#site-interactive');
            if (boxRatio < 1) {
                site_interactive.classList.add('vertical');
            } else {
                site_interactive.classList.remove('vertical');
            }
            
            
        }
    }

    initSpace();
    GlobalState.getInstance().space_info.focusX = GlobalState.getInstance().space_info.pointerX;
    GlobalState.getInstance().space_info.focusY = GlobalState.getInstance().space_info.pointerY;

    checkRatio();
    
    boundingEl.onmousemove = e => {
        if (focus) {
            if (GlobalState.getInstance().clickDown && !GlobalState.getInstance().onPoster) {
                if (GlobalState.getInstance().space_info.rotateOrigin === null) {
                    GlobalState.getInstance().space_info.rotateOrigin = e.clientX;
                } else {
                    const distance = e.clientX - GlobalState.getInstance().space_info.rotateOrigin;
                    const degPerPixel = 120/window.innerWidth;
                    GlobalState.getInstance().space_info.rotateDeg = (GlobalState.getInstance().space_info.rotateDeg + 4 * distance * degPerPixel);  
                    GlobalState.getInstance().space_info.rotateOrigin = e.clientX;         
                }
            }
            
            GlobalState.getInstance().space_info.pointerX = e.clientX;
            GlobalState.getInstance().space_info.pointerY = e.clientY;             
        }
             
    };

    boundingEl.ontouchmove = e => {
        if (focus) {
            if (GlobalState.getInstance().clickDown && !GlobalState.getInstance().onPoster) {
                if (GlobalState.getInstance().space_info.rotateOrigin === null) {
                    GlobalState.getInstance().space_info.rotateOrigin = e.touches[0].clientX;
                } else {
                    const distance = e.touches[0].clientX - GlobalState.getInstance().space_info.rotateOrigin;
                    const degPerPixel = 120/window.innerWidth;
                    GlobalState.getInstance().space_info.rotateDeg = (GlobalState.getInstance().space_info.rotateDeg + 4 * distance * degPerPixel);   
                    GlobalState.getInstance().space_info.rotateOrigin = e.touches[0].clientX;          
                }
            }
            GlobalState.getInstance().space_info.pointerX = e.touches[0].clientX;
            GlobalState.getInstance().space_info.pointerY = e.touches[0].clientY;            
        }

    };



    // drag rotate

    const pointerDown = () => {
        GlobalState.getInstance().space_info.rotateOrigin = null;
        GlobalState.getInstance().clickDown = true;
    }

    const pointerUp = () => {
        GlobalState.getInstance().clickDown = false;
    }


    boundingEl.addEventListener('mousedown', (e)=>{
        pointerDown();
    });

    boundingEl.addEventListener('touchstart', (e)=>{
        pointerDown();
    });

    boundingEl.addEventListener('touchend', (e)=>{
        pointerUp();
    });

    boundingEl.addEventListener('touchcancel', (e)=>{
        pointerUp();
    });
    
    document.addEventListener('mouseup', (e)=>{
        pointerUp();
    });

    document.addEventListener('mouseleave', (e)=>{
        pointerUp();
    });

    window.onblur = () => {
        pointerUp();
        focus = false;
        AudioControl.getInstance().drop();
        initSpace();

    }

    window.onfocus = () => {
        focus = true;
        AudioControl.getInstance().init();
        initSpace();
    }


    // animation loop
    const rotateElOriginalTransformMatrix = window.getComputedStyle(rotateEl).transform;
    const site_fps_prompt = document.querySelector('#site-fps .prompt');
    let fps_report = 0;

    setInterval(() => {
        site_fps_prompt.innerHTML = 'FPS: ' + fps_report;
    }, 1000);


    const animation_loop_frame = (old) => {
        window.requestAnimationFrame((t)=>{

            const seconds_timelapse = (t-old) / 1000;
            const FPS = 1 / seconds_timelapse;
            fps_report = Math.round(FPS);

            if (FPS > MIN_FPS_ALLOWED) {
                if (GlobalState.getInstance().canRotate()) {
                    GlobalState.getInstance().space_info.rotateDeg = (GlobalState.getInstance().space_info.rotateDeg + GlobalState.getInstance().space_info.rotateDirection * (360 / (GlobalState.getInstance().rotateSpeed / (1 / FPS))));
                }
                focusUpdate(FPS);
                spaceUpdate(spaceEl, boundingEl);            
                rotateUpdate(rotateEl, rotateElOriginalTransformMatrix);    
                GlobalState.getInstance().broadcastAnimationUpdate(FPS);         
            }
            animation_loop_frame(t);   
        });
            
    }
    window.requestAnimationFrame((t)=>{
        animation_loop_frame(t);
    });

    window.addEventListener('resize', ()=>{
        checkRatio();
        initSpace();
    });
}