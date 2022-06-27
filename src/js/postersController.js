import { GlobalState } from "./globalState";

const walls = [];
const assetsURL = 'https://wnfa-interactive-art-project.github.io/hangzhou_060122/';



function getImage(url, onSuccess, onFailure) {
    fetch(url)
        .then((r) => {
            if (r.status === 200) {
                r.blob().then((d) => {
                    onSuccess(URL.createObjectURL(d));
                })
            }
        })
        .catch((e) => {
            onFailure(e);
        });
}

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
        const s = (Math.random() * 4) + 2;

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
        let i = 1;
        let next = true;
        const NUM_RESULTS = 22;
        
        preLoadingInterval = setInterval(() => {
            if (!pause && next) {

                // fetch one image
                next = false;
                getImage(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg', (url)=>{
                    // success
                    if (!pause) {
                        appendPoster(createPoster(url));
                        i++;                        
                    }
                    next = true;
                }, ()=>{
                    // failure
                    next = true;
                });
                
                if (i >= NUM_RESULTS) {
                    clearInterval(preLoadingInterval);
                    postLoadingInterval = setInterval(() => {
                        if (!pause && next) {

                            // fetch one image
                            next = false;
                            getImage(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg', (url)=>{
                                // success
                                if (!pause) {
                                    removeLastPoster();
                                    appendPoster(createPoster(url));
                                }
                                next = true;
                            }, ()=>{
                                // failure
                                next = true;
                            });    

                        };
                    }, 5000);
                };       
            };
        }, 100);        
    }

    const loadPosters = () => {
        const postersNum = metaJSON.posters.total;
        let i = 1;
        let next = true;
        preLoadingInterval = setInterval(() => {
            if (!pause && next) {

                // fetch one image
                next = false;
                getImage(assetsURL + 'posters/' + String(i) + '.jpg', (url)=>{
                    // success
                    if (!pause) {
                        appendPoster(createPoster(url));
                        i++;                        
                    }
                    next = true;
                }, ()=>{
                    // failure
                    next = true;
                });    
                
                if (i >= postersNum) {
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
        // switch between two gallerys
        const url = new URL(window.location);
        const gallery_selection = (url.searchParams.get('gallery')) ? (url.searchParams.get('gallery')) : 'tiepian';
        let postersControlType;

        switch (gallery_selection) {
            case 'tiepian':
                postersControlType = ['results', 'posters'];
                break;
            case 'huixiang':
                postersControlType = ['posters', 'results'];
                break;
            default:
                postersControlType = ['results', 'posters'];
        }

        // init first selected gallery
        const gallery_selected = postersControlType.shift();
        postersControlType.push(gallery_selected);
        let currentPostersControlFunc = loadResults(d, gallery_selected);
        

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
        const site_wall_text = document.querySelector('#site-wall-text');


        const addButtonBehavior = (btnEl, downFunc, upFunc) => {
            let buttonDown = false;

            // touch events
            btnEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                buttonDown = true;
                downFunc();
            });

            btnEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                upFunc();
            });

            btnEl.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                upFunc();
            });

            // click events
            btnEl.addEventListener('mousedown', (e) => {
                e.preventDefault();
                buttonDown = true;
                downFunc();
            });

            btnEl.addEventListener('mouseup', (e) => {
                e.preventDefault();
                upFunc();
            });

            //global up
            document.addEventListener('mouseup', (e) => {
                if (buttonDown) {
                    upFunc();
                }
            });
        }

        addButtonBehavior(info_button, () => {
            info_button.classList.add('pressed');
            site_wall_text.classList.add('focus');
            currentPostersControlFunc.hide(()=>{});
        }, () => {
            info_button.classList.remove('pressed');
            site_wall_text.classList.remove('focus');
            currentPostersControlFunc.show(()=>{});
        });

        addButtonBehavior(refresh_button, () => {
            refresh_button.classList.add('pressed');
        }, () => {
            refresh_button.classList.remove('pressed');
        })

        addButtonBehavior(next_button, () => {
            next_button.classList.add('pressed');
        }, () => {
            next_button.classList.remove('pressed');
        })

    });
}