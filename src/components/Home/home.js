const remote = require('electron').remote,
      Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      Store  = require('electron-store'),
      store  = new Store();

const host     = store.get('ip'),
      username = store.get('username'),
      hue      = new HueApi(host, username, 5000);
//const hue = remote.getGlobal('hue_api').hue;

const elements = (() => {
    const mode_lights = document.querySelector('#mode--lights');
    const mode_groups = document.querySelector('#mode--groups');
    const mode_settings = document.querySelector('#mode--settings');
    const mode_favorite = document.querySelector('#mode--favorite');
    const section_lights = document.querySelector('.section__lights').firstElementChild;
    const section_actions = document.querySelector('.section__actions');

    return {
        mode_lights: mode_lights,
        mode_groups: mode_groups,
        mode_settings: mode_settings,
        mode_favorite: mode_favorite,
        section_lights: section_lights,
        section_actions: section_actions,
        resetModeColor: () => {
            mode_groups.style.color = '#fff';
            mode_lights.style.color = '#fff';    
            mode_settings.style.color = '#fff';
            mode_favorite.style.color = '#fff';    
        }
    }
})();

const homeController = (() => {
    const initValidEventListener = () => {
        document.addEventListener('click', (e) => {
            if(e.target && e.target.className.includes('star')) {
                if (e.target.parentElement.parentElement.parentElement.className.includes('light__card')) {
                    const isLight = e.target.parentElement.parentElement.parentElement.getAttribute('data-type') === "light";
                    if (e.target.className.includes('outline')) { // The user wants to favorite
                        e.target.style.color = '#fffb28';
                        e.target.className = e.target.className.replace('-outline', '');

                        const id = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
                        const obj = store.get('favorite');
                        isLight ? obj.lights[id] = {enabled: true} : obj.groups[id] = {enabled: true}
                        store.set('favorite', obj);
                    } else { // The user wants to unfavorite
                        e.target.style.color = '#fff';
                        e.target.className = e.target.className + '-outline';
                        
                        const id = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
                        const obj = store.get('favorite');
                        isLight ? obj.lights[id] = {enabled: false} : obj.groups[id] = {enabled: false}
                        store.set('favorite', obj);
                    }
                }
            }
        });
        
        elements.mode_lights.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_lights.style.color = '#fffb28';

            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                const favoriteData = store.get('favorite').lights;
                lights.lights.forEach((light) => {
                    console.log(light);
                    const favoriteIdData = favoriteData[light.id];
                    elements.section_lights.insertAdjacentHTML('beforeend', `
                    <div data-id="${light.id}" data-type="light" class="light__card">
                    <div>
                    <span><i ${favoriteIdData && favoriteIdData.enabled ? "style='color: #fffb28'" : ""} class="star mdi ${favoriteIdData && favoriteIdData.enabled ? "mdi-star" : "mdi-star-outline"}"></i></span>
                    <span><p>${light.name}</p></span>
                    <span><i class="bulb mdi mdi-lightbulb-outline"></i></span>                            
                    </div>
                    <p>${light.type}</p>
                    </div>                        
                    `);
                });
            });
        });
        elements.mode_groups.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_groups.style.color = '#fffb28';
            
            hue.groups((err, groups) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);

                const favoriteData = store.get('favorite').groups;
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        const favoriteIdData = favoriteData[group.id];
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                        <div data-id="${group.id}" data-type="group" class="light__card">
                            <div>
                                <span><i ${favoriteIdData && favoriteIdData.enabled ? "style='color: #fffb28'" : ""} class="star mdi ${favoriteIdData && favoriteIdData.enabled ? "mdi-star" : "mdi-star-outline"}"></i></span>
                                <span><p>${group.name}</p></span>
                                <span><i class="bulb mdi mdi-lightbulb-outline"></i></span>                            
                            </div>
                        </div>                                           
                        `);
                    }
                });
            });
        });

        elements.mode_favorite.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_favorite.style.color = '#fffb28';
            
            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                lights.lights.forEach((light) => {
                    console.log(light);
                    if (store.get('favorite').lights[light.id].enabled) {
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                            <div data-id="${light.id}" class="light__card">
                                <div>
                                    <span><i style="color: #fffb28" class="star mdi mdi-star"></i></span>
                                    <span><p>${light.name}</p></span>
                                    <span><i class="bulb mdi mdi-lightbulb-outline"></i></span>                            
                                </div>
                                <p>${light.type}</p>
                            </div>                        
                        `);
                    }
                });
            });

            hue.groups((err, groups) => {
                if (err) throw err;
                //while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        if (store.get('favorite').groups[group.id].enabled) {
                            elements.section_lights.insertAdjacentHTML('beforeend', `
                                <div data-id="${group.id}" class="light__card">
                                    <div>
                                        <span><i style="color: #fffb28" class="star mdi mdi-star"></i></span>
                                        <span><p>${group.name}</p></span>
                                        <span><i class="bulb mdi mdi-lightbulb-outline"></i></span>                            
                                    </div>
                                </div>                        
                            `);
                        }
                    }
                });
            });
        });
    }
    
    const initInvalidEventListener = () => {
        console.log("here");
        elements.mode_groups.style.display = "none";
        elements.mode_lights.style.display = "none";
        elements.mode_favorite.style.display = "none";
    }
    
    const initSettingsListener = (connected) => {
        elements.mode_settings.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_settings.style.color = '#fffb28';   
            
            while(elements.section_actions.firstChild) elements.section_actions.removeChild(elements.section_actions.firstChild);
            if (connected) {
                
            } else {
                elements.section_actions.insertAdjacentHTML('afterbegin', `
                    <p>Connect to a new bridge:</p>
                `);
            }
        });
    }

    const initFirstLaunch = () => {
        if(!store.get('favorite', null)) {
            store.set('favorite', {
                lights: {

                },
                groups: {

                }
            });
        }
    }
    
    return {
        init: () => {
            initFirstLaunch();
            if (remote.getGlobal('hue_api').connected) {
                initValidEventListener();
                initSettingsListener(true);
            } else {
                initInvalidEventListener();
                initSettingsListener(false);
            }
        }
    }
})();

homeController.init();