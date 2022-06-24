const walls = [];
const assetsURL = 'https://wnfa-interactive-art-project.github.io/hangzhou_060122/';


function loadPosters() {
    const getMeta = (callback) => {
        fetch(assetsURL + "META.json")
        .then((r) => {
            if (r.status === 200) {
                r.json().then((d) => {
                    callback(d);
                })                            
            }
        })
        .catch((e) => {
            console.log("error", e);
        }); 
    }

    const loadPostersFromMeta = (metaJSON) => {
        const postersNum = metaJSON.posters.total;
        for (let i = 1; i <= postersNum; i++) {
            new Promise(()=>{
                const el = document.createElement('img');
                const x = (Math.random() * 50);
                const y = (Math.random() * 80);
                const r = (Math.random() * 360);
                const s = (Math.random() * 8) + 3;

                el.classList.add('poster');
        
                el.style.top = y + '%';
                el.style.right = x + '%';
                el.style.transform = `rotateZ(${r}deg) rotateY(${r}deg)`;
                el.style.width = s + 'em';

                el.src = assetsURL + 'posters/' + i + '.jpg';
        
                el.onmouseenter = () => {
                    el.style.opacity = 1;
                }
        
                el.onmouseleave = () => {
                    el.style.opacity = 0.8;
                }
        
                // append
                walls[Math.floor(Math.random() * walls.length)].appendChild(el);
            });


        }
    }

    // load
    getMeta(loadPostersFromMeta);
}

export function initPosters(container) {
    const wall_num = 6;
    for (let i = 0; i < wall_num; i++) {
        const deg = (360/wall_num) + i * (360/wall_num);
        const wall = document.createElement('div');
        
        wall.classList.add('wall');
        wall.style.transform = `rotateY(${deg}deg) translateX(-50%)`;

        walls.push(wall);
        container.appendChild(wall);
    }

    loadPosters();
}