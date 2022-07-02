import { GlobalState } from "./globalState";
import { flickeringTextEl } from "./flickerText";
import { AudioControl } from "./backgroundAudioControl";

// const walls = [];
const assetsURL = 'https://wnfa-interactive-art-project.github.io/hangzhou_060122/';

// animation function
let animationUpdateFunction = () => {};

function disablePinchZoom() {
    // document.addEventListener('touchstart', (e) => {
    //     e.preventDefault();
    // })

    // document.addEventListener('touchmove', (e) => {
    //     e.preventDefault();
    // })

    // document.addEventListener('touchend', (e) => {
    //     e.preventDefault();
    // })
}

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
    let animationTimeout;
    let speedUpAnimationInterval;
    let pause = false;
    let pauseForFocus = false;

    const createPoster = (url) => {
        const sizeMax = 10;
        const sizeMin = 2;

        const clusterWidth = 70 - Math.sqrt(sizeMax * sizeMax * 2);
        const clusterWidthOffset = 30;
        const clusterHeight = 80 - Math.sqrt(sizeMax * sizeMax * 2);


        const el = document.createElement((url !== null) ? 'img' : 'div');
        const z = (Math.random() * clusterWidth/2 + clusterWidthOffset/2);
        const y = (Math.random() * clusterHeight - clusterHeight/2);
        const r = (Math.random() * 360);
        const s = (Math.random() * (sizeMax - sizeMin)) + sizeMin;

        const rX = (Math.random() * 90) - 45;
        const rY = (Math.random() * 180) - 95;
        // const rZ = (Math.random() * 360);

        el.classList.add('poster');
        el.onerror = () => {
            el.style.display = 'none';
        }
        el.draggable = false;


        // el.style.top = y + '%';
        // el.style.right = x + '%';
        // translateX(${x}vw)
        // translateY(${y}vh)
        el.style.transform = `
                rotateY(${r}deg)


                translateZ(${z}vw)
                translateY(${y}vh)

                rotateY(${rY}deg)

                rotateX(${rX}deg)

            `;
        
        el.style.height = s + 'em';
        el.style.width = s + 'em';

        // set custom properties
        // el.cp_distance = z;
        // el.cp_angle = r;

        el.oncustomanimationupdate = () => {
            const rotation = Math.abs((GlobalState.getInstance().space_info.rotateDegFocus + r) % 360);
            const rotation_corrected = (Math.floor(rotation / 180) === 0) ? rotation % 180 : 180 - (rotation % 180);

            let cameraDistance;
            if (rotation_corrected === 0) {
                cameraDistance = 0
            } else if (rotation_corrected === 90) {
                cameraDistance = clusterWidth/2;
            } else if (rotation_corrected === 180) {
                cameraDistance = clusterWidth;
            } else {
                const require_correction = Math.floor(rotation_corrected / 90) !== 0;
                const rotation_corrected_corrected = (require_correction) ? 90 - rotation_corrected % 90 : rotation_corrected;

                const distance2Center = z * Math.sin((90 - rotation_corrected_corrected) * Math.PI/180);
                
                if (require_correction) {
                    cameraDistance = distance2Center + clusterWidth/2;
                } else {
                    cameraDistance = clusterWidth/2 - distance2Center;
                }
            }

            let cameraDistanceFactor = cameraDistance / clusterWidth;
            // fix rounding error
            cameraDistanceFactor = Math.min(cameraDistanceFactor, 1);
            cameraDistanceFactor = Math.max(cameraDistanceFactor, 0);
            // console.log(cameraDistanceFactor);

            el.style.filter = `brightness(${(1- cameraDistanceFactor) * (0.65) + 0.05})`;


        }   

        if (url !== null) {
            el.src = url;
        } else {
            el.classList.add('mockup');
        }
        
        const focusPoster = (focusEl) => {
            pauseForFocus = true;
            posters.map(p => {
                if (p === focusEl) {
                    p.classList.add('focus');
                } else {
                    p.classList.add('fade');
                }
            });               
        };

        const defocusPoster = (focusEl) => {
            pauseForFocus = false;
            posters.map(p => {
                if (p === focusEl) {
                    p.classList.remove('focus');
                } else {
                    p.classList.remove('fade');
                }
            });    
        }


        el.onmouseenter = () => {
            const wall_text = document.querySelector('#site-wall-text');
            wall_text.classList.remove('show');
            GlobalState.getInstance().onPoster = true;

            focusPoster(el);
   
        }

        el.onmouseleave = () => {
            const wall_text = document.querySelector('#site-wall-text');
            wall_text.classList.add('show');
            GlobalState.getInstance().onPoster = false;
            defocusPoster(el);  
        }

        el.onclick = () => {
            const wall_text = document.querySelector('#site-wall-text');
            wall_text.classList.add('show');
            GlobalState.getInstance().onPoster = false;
            defocusPoster(el);

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
        // walls[Math.floor(Math.random() * walls.length)].appendChild(el);
        const gallery = document.querySelector('#site-interactive .room .gallery');
        gallery.appendChild(el);
        posters.push(el);
        setTimeout(() => {
            let setShow = setInterval(() => {
                if (!pause && !pauseForFocus) {
                    clearInterval(setShow);
                    el.classList.add('show');
                }   
            }, 100);

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
        return null;
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
            el.classList.add('hide');
        }
        callback();
    }

    const showAllPosters = (callback = () => {}) => {
        for (let i = 0; i < posters.length; i++) {
            const el = posters[i];
            el.classList.remove('hide');
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
            if (!pause && next && !pauseForFocus) {

                // fetch one image
                next = false;
                getImage(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg', (url)=>{
                    // success
                    if (!pause && !pauseForFocus) {
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
                        if (!pause && next && !pauseForFocus) {

                            // fetch one image
                            next = false;
                            getImage(assetsURL + 'results/' + Math.floor(Math.random() * postersNum + 1) + '.jpg', (url)=>{
                                // success
                                if (!pause && !pauseForFocus) {
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
            if (!pause && next && !pauseForFocus) {

                // fetch one image
                next = false;
                getImage(assetsURL + 'posters/' + String(i) + '.jpg', (url)=>{
                    // success
                    if (!pause && !pauseForFocus) {
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

    const loadMockups = () => {
        const mockupNum = 20;
        for (let i = 0; i<mockupNum; i++) {
            appendPoster(createPoster(null));
        }
    }

    const rotateSpeedUpAnimationSpeed = 1.25;
    const rotateSpeedTarget = 30;
    const rotateSpeedUp = (callback = () => {}) => {
        clearInterval(speedUpAnimationInterval);
        GlobalState.getInstance().rotateSpeed = 0.5;
        speedUpAnimationInterval = setInterval(() => {
            if (!pause && !pauseForFocus) {
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
    // const gallery_name = document.querySelector('#site-gallery-name');
    const load = () => {
        const site_interactive = document.querySelector('#site-interactive');
        const site_room = document.querySelector('#site-interactive-room');
        site_room.classList.remove('tiepian');
        site_room.classList.remove('huixiang');

        animationUpdateFunction = () => {
            for (let i = 0; i<posters.length; i++) {
                const el = posters[i];
                el.oncustomanimationupdate();
            }            
        }

        if (type === 'results') {
            rotateSpeedUp(() => {});
            pause = false;
            loadResults();
            // gallery_name.innerHTML = 'WNFA/心的铁片';
            site_room.classList.add('tiepian');
            site_interactive.classList.add('lightup');
            const wall_text = document.querySelector('#site-wall-text');
            wall_text.classList.add('show');
            AudioControl.getInstance().play();
        } else if (type === 'posters') {
            rotateSpeedUp(() => {});
            pause = false;
            // gallery_name.innerHTML = '回想回想';
            site_room.classList.add('huixiang');
            loadPosters();
            site_interactive.classList.add('lightup');
            const wall_text = document.querySelector('#site-wall-text');
            wall_text.classList.add('show');
            AudioControl.getInstance().play();
        } else if (type === 'mockups') {
            // rotateSpeedUp(()=>{});
            pause = false;
            loadMockups();
        }
    }

    load();


    return {
        clean: (callback) => {
            pause = true;
            AudioControl.getInstance().pause();
            clearInterval(preLoadingInterval);
            clearInterval(postLoadingInterval);
            clearTimeout(animationTimeout);
            removeAllPosters(() => {
                const site_interactive = document.querySelector('#site-interactive');
                site_interactive.classList.remove('lightup');     
                const wall_text = document.querySelector('#site-wall-text');
                wall_text.classList.remove('show');
                // animationTimeout = setTimeout(() => {
                //     callback();
                // }, 1000);   
            });
        },
        refresh: () => {
            pause = true;
            AudioControl.getInstance().pause();
            clearInterval(preLoadingInterval);
            clearInterval(postLoadingInterval);
            clearTimeout(animationTimeout);
            removeAllPosters(() => {
                const site_interactive = document.querySelector('#site-interactive');
                site_interactive.classList.remove('lightup');     
                const wall_text = document.querySelector('#site-wall-text');
                wall_text.classList.remove('show');
                // animationTimeout = setTimeout(() => {
                //     load();
                // }, 1000);           
            });
        },
        hide: (callback) => {

            const lighting = document.querySelector('#site-interactive .lighting');
            lighting.classList.add('hide');
            AudioControl.getInstance().pause();
            GlobalState.getInstance().onPoster = true;

            hideAllPosters(()=>{
                animationTimeout = setTimeout(() => {
                    callback();
                }, 1000);
            });
        },
        show: (callback) => {

            const lighting = document.querySelector('#site-interactive .lighting');
            lighting.classList.remove('hide');
            AudioControl.getInstance().play();
            GlobalState.getInstance().onPoster = false;

            showAllPosters(()=>{
                animationTimeout = setTimeout(() => {
                    callback();
                }, 1000);
            })
        }
    };
}

export function initPosters(container) {
    // const wall_num = 6;
    // for (let i = 0; i < wall_num; i++) {
    //     const deg = (360 / wall_num) + i * (360 / wall_num);
    //     const wall = document.createElement('div');

    //     wall.classList.add('wall');
    //     wall.style.transform = `rotateY(${deg}deg) translateX(-50%)`;

    //     walls.push(wall);
    //     container.appendChild(wall);
    // }


    // const gallery = document.querySelector('#site-interactive .room .gallery'); 
    
    // GlobalState.getInstance().subscribeAnimationUpdate(()=>{
    //     new Promise(()=>{
    //         const posters = gallery.children;    
    //         if (posters.length > 0) {
    //             // console.log(posters[0].cp_angle);
    //         }            
    //     });

    // });

    disablePinchZoom();

    GlobalState.getInstance().subscribeAnimationUpdate(() => {
        animationUpdateFunction();
    });

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

    let currentPostersControlFunc = loadResults({}, "mockups");

    return {
        init: () => {
            currentPostersControlFunc.clean(()=>{});
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
                currentPostersControlFunc = loadResults(d, gallery_selected);
        
                // set up buttons
                const refresh_button = document.querySelector('#site-button-refresh');
                const next_button = document.querySelector('#site-button-next');
                const info_button = document.querySelector('#site-button-info');
        
                const site_wall_text = document.querySelector('#site-wall-text');
        
                const addButtonBehavior = (btnEl, downFunc, upFunc) => {
                    let buttonDown = false;
        
                    // touch events
                    btnEl.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        buttonDown = true;
                        AudioControl.getInstance().pressButtonDown();
                        downFunc();
                    });
        
                    btnEl.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        buttonDown = false;
                        AudioControl.getInstance().pressButtonUp();
                        upFunc();
                    });
        
                    btnEl.addEventListener('touchcancel', (e) => {
                        e.preventDefault();
                        buttonDown = false;
                        AudioControl.getInstance().pressButtonUp();
                        upFunc();
                    });
        
                    // click events
                    btnEl.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        buttonDown = true;
                        AudioControl.getInstance().pressButtonDown();
                        downFunc();
                    });
        
                    btnEl.addEventListener('mouseup', (e) => {
                        e.preventDefault();
                        buttonDown = false;
                        AudioControl.getInstance().pressButtonUp();
                        upFunc();
                    });
        
                    //global up
                    document.addEventListener('mouseup', (e) => {
                        if (buttonDown) {
                            buttonDown = false;
                            AudioControl.getInstance().pressButtonUp();
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
        

                let refreshButtonAnimationTimeout;
                addButtonBehavior(refresh_button, () => {
                    clearTimeout(refreshButtonAnimationTimeout);
                    currentPostersControlFunc.clean(()=>{});
                    refresh_button.classList.add('pressed');
                }, () => {
                    refreshButtonAnimationTimeout = setTimeout(() => {
                        const nextControlType = postersControlType.pop();
                        postersControlType.push(nextControlType);
            
                        currentPostersControlFunc = loadResults(d, nextControlType);                        
                    }, 750);

                    refresh_button.classList.remove('pressed');
                })
        

                let nextButtonAnimationTimeout;
                addButtonBehavior(next_button, () => {
                    clearTimeout(nextButtonAnimationTimeout);
                    currentPostersControlFunc.clean(() => {});
                    next_button.classList.add('pressed');
                }, () => {
                    nextButtonAnimationTimeout = setTimeout(() => {
                        const nextControlType = postersControlType.shift();
                        postersControlType.push(nextControlType);
            
                        currentPostersControlFunc = loadResults(d, nextControlType);                        
                    }, 750);

                    next_button.classList.remove('pressed');
                })
        
            });
        }
    }

}