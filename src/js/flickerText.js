export function flickeringTextEl(pEL, text) {
    let ifContinue = true;
    for (let i = 0; i < text.length; i++) {
        const el = document.createElement('span');
        const animationLength = Math.random() * 2.5 + 1;

        const maxBrightness = 1;
        const minBrightness = Math.random() * 0.25 + 0.25;

        el.style.transition = `opacity ${animationLength}s`;
        el.innerHTML = text[i];
        el.style.opacity = [maxBrightness, minBrightness][Math.floor(Math.random() * 2)];

        let timeout;
        const start = () => {
            if (el.style.opacity === String(maxBrightness)) {
                el.style.opacity = String(minBrightness);
            } else {
                el.style.opacity = String(maxBrightness);
            }

            timeout = setTimeout(() => {
                if (ifContinue) {
                    start();
                }    
            },  Math.random() * 1000 + animationLength * 1000);
        }
        timeout = setTimeout(()=>{
            start();
        }, 100);
        
        pEL.appendChild(el);
    }

    return () => {
        ifContinue = false;
    }
}