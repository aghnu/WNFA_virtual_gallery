import { GlobalState } from "./globalState";

const space_info = {
    pointerX: 0,
    pointerY: 0,
    focusX: 0,
    focusY:0,
    rotateDeg: 0,
}

const ROTATE_SPEED = 60;
const FOCUS_UPDATE_ANIMATION_SPEED = 0.25;
// const UPDATE_FPS = 60;

let focus = true;

function focusUpdate(FPS) {

    if (Math.abs(space_info.pointerX - space_info.focusX) > 10) {
        space_info.focusX = space_info.focusX + (space_info.pointerX - space_info.focusX) / (FOCUS_UPDATE_ANIMATION_SPEED * FPS);
    } else {
        space_info.pointerX = space_info.focusX
    }

    if (Math.abs(space_info.pointerY - space_info.focusY) > 10) {
        space_info.focusY = space_info.focusY + (space_info.pointerY - space_info.focusY) / (FOCUS_UPDATE_ANIMATION_SPEED * FPS);
    } else {
        space_info.pointerY = space_info.focusY
    }
}

function rotateUpdate(el, originalTransformMatrix) {
    el.style.transform = originalTransformMatrix + `rotateY(${space_info.rotateDeg}deg)`;
}

function spaceUpdate(spaceEl, boundingEl) {
    
    const max_degree = 10;
    const boxEl = spaceEl.getBoundingClientRect();
    const boxBody = boundingEl.getBoundingClientRect();
    
    const bodyRatio = boxBody.height/boxBody.width;
    const max_degree_x = max_degree * bodyRatio;
    const max_degree_y = max_degree / bodyRatio;

    const centerX = boxEl.left + boxEl.width / 2;
    const centerY = boxEl.top + boxEl.height / 2;

    const distanceX = space_info.focusX - centerX;
    const distanceY = space_info.focusY - centerY;

    const distanceFactorX = distanceX / (boxBody.width/ 2);
    const distanceFactorY = distanceY / (boxBody.height / 2);

    let calc_rotate_y = (distanceFactorX * max_degree_x) / ((boxBody.height + 600)/600);
    let calc_rotate_x = (-distanceFactorY * max_degree_y) / ((boxBody.width + 600)/600);

    if (Math.abs(calc_rotate_y) > max_degree) {
        calc_rotate_y = calc_rotate_y / Math.abs(calc_rotate_y) * max_degree;
    }

    if (Math.abs(calc_rotate_x) > max_degree) {
        calc_rotate_x = calc_rotate_x / Math.abs(calc_rotate_x) * max_degree;
    }

    spaceEl.style.transform = `rotateX(${calc_rotate_x}deg) rotateY(${calc_rotate_y}deg)`;
}

export function initSpace(spaceEl, rotateEl, boundingEl) {
    // setup listeners
    const initSpace = () => {
        const box = spaceEl.getBoundingClientRect();
        space_info.pointerX = box.left + box.width / 2;
        space_info.pointerY = box.top + box.height / 2;
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
    space_info.focusX = space_info.pointerX;
    space_info.focusY = space_info.pointerY;

    checkRatio();
    
    boundingEl.onmousemove = e => {
        if (focus) {
            if (GlobalState.getInstance().clickDown) {
                if (space_info.rotateOrigin === null) {
                    space_info.rotateOrigin = e.clientX;
                } else {
                    const distance = e.clientX - space_info.rotateOrigin;
                    const degPerPixel = 90/1080;
                    space_info.rotateDeg = (space_info.rotateDeg + 4 * distance * degPerPixel) % 360;  
                    space_info.rotateOrigin = e.clientX;         
                }
            }
            
            space_info.pointerX = e.clientX;
            space_info.pointerY = e.clientY;             
        }
             
    };

    boundingEl.ontouchmove = e => {
        if (focus) {
            if (GlobalState.getInstance().clickDown) {
                if (space_info.rotateOrigin === null) {
                    space_info.rotateOrigin = e.touches[0].clientX;
                } else {
                    const distance = e.touches[0].clientX - space_info.rotateOrigin;
                    const degPerPixel = 90/1080;
                    space_info.rotateDeg = (space_info.rotateDeg + 4 * distance * degPerPixel) % 360;   
                    space_info.rotateOrigin = e.touches[0].clientX;          
                }
            }
            space_info.pointerX = e.touches[0].clientX;
            space_info.pointerY = e.touches[0].clientY;            
        }

    };



    // drag rotate

    const pointerDown = () => {
        space_info.rotateOrigin = null;
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
        initSpace();
    }

    window.onfocus = () => {
        focus = true;
        initSpace();
    }


    // animation loop
    const rotateElOriginalTransformMatrix = window.getComputedStyle(rotateEl).transform;
    const animation_loop_frame = (old) => {
        window.requestAnimationFrame((t)=>{
            const seconds_timelapse = (t-old) / 1000;
            const FPS = 1 / seconds_timelapse;
            if (GlobalState.getInstance().canRotate()) {
                space_info.rotateDeg = (space_info.rotateDeg + (360 / (ROTATE_SPEED / (1 / FPS)))) % 360;
            }
            focusUpdate(FPS);
            spaceUpdate(spaceEl, boundingEl);            
            rotateUpdate(rotateEl, rotateElOriginalTransformMatrix);
            animation_loop_frame(t);
        });
            
    }
    window.requestAnimationFrame((t)=>{
        animation_loop_frame(t);
    });
    

    // // old implementation    
    // setInterval(() => {
    //     if (GlobalState.getInstance().canRotate()) {
    //         space_info.rotateDegY = (space_info.rotateDegY + (360 / (ROTATE_SPEED / (1 / UPDATE_FPS)))) % 360;
    //     }
    //     if (!GlobalState.getInstance().clickDown) {
    //         focusUpdate();
    //         spaceUpdate(spaceEl, boundingEl);            
    //     }
    //     rotateUpdate(rotateEl, rotateElOriginalTransformMatrix);

    // }, 1000 / UPDATE_FPS);

    window.addEventListener('resize', ()=>{
        checkRatio();
        initSpace();
    });
}