import { GlobalState } from "./globalState";

const walls = [];
const assetsURL = 'https://wnfa-interactive-art-project.github.io/hangzhou_060122/';


function loadResults(metaJSON, type) {
    const posters = [];

    let preLoadingInterval;
    let postLoadingInterval;
    let speedUpAnimationInterval;
    let pause = false;

    const createPoster = (url) => {

        const el = document.createElement('img');
        const x = (Math.random() * 80);
        const y = (Math.random() * 80);
        const r = (Math.random() * 360);
        const s = (Math.random() * 6) + 2;

        el.classList.add('poster');
        el.onerror = () => {
            el.style.display = 'none';
        }
        el.draggable = false;


        el.style.top = y + '%';
        el.style.right = x + '%';
        el.style.transform = `rotateZ(${r}deg) rotateY(${r}deg)`;
        el.style.height = s + 'em';
        el.src = url;

        el.onmouseenter = () => {
            GlobalState.getInstance().onPoster = true;
            el.classList.add('focus');       
        }

        el.onmouseleave = () => {
            GlobalState.getInstance().onPoster = false;
            el.classList.remove('focus');     
        }

        el.onclick = () => {
            GlobalState.getInstance().onPoster = false;
            el.classList.remove('focus');

            const site_poster_detail_layer = document.querySelector('#site-poster-detail-layer');
            const showEl = document.createElement('img');
            showEl.classList.add('show');
            showEl.src = url;

            hideAllPosters(() => {
                site_poster_detail_layer.classList.add('show');
                site_poster_detail_layer.appendChild(showEl);
                site_poster_detail_layer.onclick = () => {
                    site_poster_detail_layer.onclick = () => {};
                    site_poster_detail_layer.classList.remove('show');
                    setTimeout(() => {
                        site_poster_detail_layer.removeChild(showEl);
                        showAllPosters(()=>{});
                    }, 500);
                }
            });      
        }

        return el;
    }

    const appendPoster = (el) => {
        walls[Math.floor(Math.random() * walls.length)].appendChild(el);
        posters.push(el);
        setTimeout(() => {
            if (!pause) {
                el.classList.add('show');
            }
        }, 100);
    }

    const removeLastPoster = () => {
        if (posters.length !== 0) {
            const el = posters.shift();
            el.classList.remove('show');
            setTimeout(() => {
                el.parentElement.removeChild(el);
            }, 500);
        }
    }

    const removeAllPosters = (callback = () => {}) => {
        while(posters.length !== 0) {
            removeLastPoster();
        }
        callback();
    }

    const hideAllPosters = (callback = () => {}) => {
        pause = true;
        for (let i = 0; i < posters.length; i++) {
            const el = posters[i];
            el.classList.remove('show');
        }
        callback();
    }

    const showAllPosters = (callback = () => {}) => {
        for (let i = 0; i < posters.length; i++) {
            const el = posters[i];
            el.classList.add('show');
        }
        pause = false;
        callback();
    }

    const loadResults = () => {
        const postersNum = metaJSON.results.total;
        let i = 0;
        preLoadingInterval = setInterval(() => {
            if (!pause) {
                appendPoster(createPoster(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg'));
                if (++i > 20) {
                    clearInterval(preLoadingInterval);
                    postLoadingInterval = setInterval(() => {
                        if (!pause) {
                            removeLastPoster();
                            appendPoster(createPoster(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg'));                            
                        };
                    }, 5000);
                };       
            };
        }, 100);        
    }

    const loadPosters = () => {
        const postersNum = metaJSON.posters.total;
        let i = 1;
        preLoadingInterval = setInterval(() => {
            if (!pause) {
                appendPoster(createPoster(assetsURL + 'posters/' + String(i) + '.jpg'));
                if (++i > postersNum) {
                    clearInterval(preLoadingInterval);
                };                
            }
        }, 100);        
    }

    const rotateSpeedUpAnimationSpeed = 1.25;
    const rotateSpeedTarget = 30;
    const rotateSpeedUp = (callback = () => {}) => {
        clearInterval(speedUpAnimationInterval);
        GlobalState.getInstance().rotateSpeed = 0.5;
        speedUpAnimationInterval = setInterval(() => {
            if (!pause) {
                const target = GlobalState.getInstance().rotateSpeed * rotateSpeedUpAnimationSpeed;
                if (target > rotateSpeedTarget) {
                    GlobalState.getInstance().rotateSpeed = rotateSpeedTarget;
                    clearInterval(speedUpAnimationInterval);   
                    callback();
                } else {
                    GlobalState.getInstance().rotateSpeed = target;
                }                
            }
        }, 250);
    };

    // gallery name
    const gallery_name = document.querySelector('#site-gallery-name');
    const load = () => {
        const site_interactive = document.querySelector('#site-interactive');
        
        if (type === 'results') {
            rotateSpeedUp(() => {});
            pause = false;
            loadResults();
            gallery_name.innerHTML = 'WNFA/心的铁片';
            site_interactive.classList.add('lightup');
        } else if (type === 'posters') {
            rotateSpeedUp(() => {});
            pause = false;
            gallery_name.innerHTML = '回想回想';
            loadPosters();
            site_interactive.classList.add('lightup');
        }
    }

    load();


    return {
        clean: (callback) => {
            pause = true;
            clearInterval(preLoadingInterval);
            clearInterval(postLoadingInterval);
            removeAllPosters(() => {
                const site_interactive = document.querySelector('#site-interactive');
                site_interactive.classList.remove('lightup');     
                setTimeout(() => {
                    callback();
                }, 1000);   
            });
        },
        refresh: () => {
            pause = true;
            clearInterval(preLoadingInterval);
            clearInterval(postLoadingInterval);
            removeAllPosters(() => {
                const site_interactive = document.querySelector('#site-interactive');
                site_interactive.classList.remove('lightup');     
                setTimeout(() => {
                    load();
                }, 1000);           
            });
        },
        hide: (callback) => {
            hideAllPosters(()=>{
                setTimeout(() => {
                    callback();
                }, 1000);
            });
        },
        show: (callback) => {
            showAllPosters(()=>{
                setTimeout(() => {
                    callback();
                }, 1000);
            })
        }
    };
}

export function initPosters(container) {
    const wall_num = 6;
    for (let i = 0; i < wall_num; i++) {
        const deg = (360 / wall_num) + i * (360 / wall_num);
        const wall = document.createElement('div');

        wall.classList.add('wall');
        wall.style.transform = `rotateY(${deg}deg) translateX(-50%)`;

        walls.push(wall);
        container.appendChild(wall);
    }

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

    // set up posters after got meta
    getMeta((d)=>{
        let postersControlType = ['posters', 'results'];
        let currentPostersControlFunc = loadResults(d, 'results');
        
        // set up buttons
        const refresh_button = document.querySelector('#site-button-refresh');
        refresh_button.onclick = () => {
            currentPostersControlFunc.refresh();
        }

        const next_button = document.querySelector('#site-button-next');
        next_button.onclick = () => {
            const nextControlType = postersControlType.shift();
            postersControlType.push(nextControlType);

            currentPostersControlFunc.clean(() => {
                currentPostersControlFunc = loadResults(d, nextControlType);
            });
        }

        const info_button = document.querySelector('#site-button-info');
        const gallery = document.querySelector('#site-interactive .room .gallery');


        let buttonDown = false;
        const buttonDownFunc = () => {
            buttonDown = true;
            currentPostersControlFunc.hide(()=>{
                // gallery.style.display = 'none';
            });
        };

        const buttonUpFunc = () => {
            buttonDown = false;
            currentPostersControlFunc.show(()=>{
                // gallery.style.display = 'block';
            });
        }

        // touch events
        info_button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            buttonDownFunc();
        });

        info_button.addEventListener('touchend', (e) => {
            e.preventDefault();
            buttonUpFunc();
        });

        info_button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            buttonUpFunc();
        });

        // click events
        info_button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            buttonDownFunc();
        });

        info_button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            buttonUpFunc();
        });

        //global up
        document.addEventListener('mouseup', (e) => {
            if (buttonDown) {
                buttonUpFunc();
            }
        });
    });
}