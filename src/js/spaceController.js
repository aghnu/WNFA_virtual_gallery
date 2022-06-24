const space_info = {
    pointerX: 0,
    pointerY: 0,
    focusX: 0,
    focusY:0,
    rotateDeg: 0,
}

const ROTATE_SPEED = 60;
const FOCUS_UPDATE_ANIMATION_SPEED = 0.2;
const UPDATE_FPS = 60;

function focusUpdate() {

    if (Math.abs(space_info.pointerX - space_info.focusX) > 1) {
        space_info.focusX = space_info.focusX + (space_info.pointerX - space_info.focusX) / (FOCUS_UPDATE_ANIMATION_SPEED * UPDATE_FPS);
    }

    if (Math.abs(space_info.pointerY - space_info.focusY) > 1) {
        space_info.focusY = space_info.focusY + (space_info.pointerY - space_info.focusY) / (FOCUS_UPDATE_ANIMATION_SPEED * UPDATE_FPS);
    }
}

function rotateUpdate(el) {
    el.style.transform = `rotateY(${space_info.rotateDeg}deg)`;
}

function spaceUpdate(spaceEl, boundingEl) {
    
    const max_degree = 20;
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

    const calc_rotate_y = (distanceFactorX * max_degree_x) / ((boxBody.height + 600)/600);
    const calc_rotate_x = (-distanceFactorY * max_degree_y) / ((boxBody.width + 600)/600);

    spaceEl.style.transform = `rotateX(${calc_rotate_x}deg) rotateY(${calc_rotate_y}deg)`;
}

export function initSpace(spaceEl, rotateEl, boundingEl) {
    // setup listeners
    const initSpace = () => {
        const box = spaceEl.getBoundingClientRect();
        space_info.pointerX = box.left + box.width / 2;
        space_info.pointerY = box.top + box.height / 2;
    }

    space_info.focusX = space_info.pointerX;
    space_info.focusY = space_info.pointerY;  
    initSpace();

    
    boundingEl.onmousemove = e => {
        space_info.pointerX = e.clientX;
        space_info.pointerY = e.clientY;
    };

    boundingEl.ontouchmove = e => {
        space_info.pointerX = e.touches[0].clientX;
        space_info.pointerY = e.touches[0].clientY;
    };

    // animation loop
    
    setInterval(() => {
        space_info.rotateDeg = space_info.rotateDeg + (360 / (ROTATE_SPEED / (1 / UPDATE_FPS)));
        focusUpdate();
        rotateUpdate(rotateEl);
        spaceUpdate(spaceEl, boundingEl);
    }, 1000 / UPDATE_FPS);


    window.addEventListener('resize', ()=>{
        initSpace();
    });
}