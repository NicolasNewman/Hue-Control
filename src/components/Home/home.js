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
    // Main event listeners when there is a valid connection
    const initValidEventListener = () => {
        // Event delegation
        document.addEventListener('click', (e) => {
            // If a star to favorite is clicked
            if(e.target && e.target.className.includes('star')) {
                // If the star is within a card
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
            if(e.target && e.target.className.includes('lightbulb')) {
                // If the lightbulb is within a card
                if (e.target.parentElement.parentElement.parentElement.className.includes('light__card')) {
                    const isLight = e.target.parentElement.parentElement.parentElement.getAttribute('data-type') === "light";
                    if (e.target.className.includes('outline')) { // The user wants to turn on
                        e.target.style.color = '#fffb28';
                        e.target.className = e.target.className.replace('-outline', '-on');

                        const id = parseInt(e.target.parentElement.parentElement.parentElement.getAttribute('data-id'));
                        if (isLight) {
                            hue.setLightState(id, {
                                "on": true
                            }).then((res) => {
                                console.log("Modified light");
                            }).fail((err) => {
                                console.log("Couldn't modify light")
                            }).done();
                        } else {
                            hue.setGroupLightState(id, {
                                "on": true
                            }).then((res) => {
                                console.log("Modified light");
                            }).fail((err) => {
                                console.log("Couldn't modify light")
                            }).done();
                        }
                        //const obj = store.get('favorite');
                        //isLight ? obj.lights[id] = {enabled: true} : obj.groups[id] = {enabled: true}
                        //store.set('favorite', obj);
                    } else { // The user wants to turn off
                        e.target.style.color = '#fff';
                        e.target.className = e.target.className.replace('-on', '') + '-outline';
                        
                        const id = parseInt(e.target.parentElement.parentElement.parentElement.getAttribute('data-id'));
                        if (isLight) {
                            hue.setLightState(id, {
                                "on": false
                            }).then((res) => {
                                console.log("Modified light");
                            }).fail((err) => {
                                console.log("Couldn't modify light")
                            }).done();
                        } else {
                            hue.setGroupLightState(id, {
                                "on": false
                            }).then((res) => {
                                console.log("Modified light");
                            }).fail((err) => {
                                console.log("Couldn't modify light")
                            }).done();
                        }
                        
                        //const obj = store.get('favorite');
                        //isLight ? obj.lights[id] = {enabled: false} : obj.groups[id] = {enabled: false}
                        //store.set('favorite', obj);
                    }
                }
            }
        });
        
        // Event for when the light tab is clicked
        elements.mode_lights.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_lights.style.color = '#fffb28';

            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                const favoriteData = store.get('favorite').lights;
                const lightData = store.get('lightState');
                lights.lights.forEach((light) => {
                    console.log(light);
                    const favoriteIdData = favoriteData[light.id];
                    const lightIdData = lightData[light.id];
                    elements.section_lights.insertAdjacentHTML('beforeend', `
                        <div data-id="${light.id}" data-type="light" class="light__card">
                            <div>
                                <span><i ${favoriteIdData && favoriteIdData.enabled ? "style='color: #fffb28'" : ""} class="star mdi ${favoriteIdData && favoriteIdData.enabled ? "mdi-star" : "mdi-star-outline"}"></i></span>
                                <span><p>${light.name}</p></span>
                                <span><i ${lightIdData.on ? "style='color: #fffb28'" : ""} class="bulb mdi ${lightIdData.on ? "mdi-lightbulb-on" : "mdi-lightbulb-outline"}"></i></span>                            
                            </div>
                            <p>${light.type}</p>
                        </div>                        
                    `);
                });
            });
        });

        // Event for when the group tab is clicked
        elements.mode_groups.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_groups.style.color = '#fffb28';
            
            hue.groups((err, groups) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);

                const favoriteData = store.get('favorite').groups;
                const groupData = store.get('groupState');
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        const favoriteIdData = favoriteData[group.id];
                        const groupIdData = groupData[group.id];
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                            <div data-id="${group.id}" data-type="group" class="light__card">
                                <div>
                                    <span><i ${favoriteIdData && favoriteIdData.enabled ? "style='color: #fffb28'" : ""} class="star mdi ${favoriteIdData && favoriteIdData.enabled ? "mdi-star" : "mdi-star-outline"}"></i></span>
                                    <span><p>${group.name}</p></span> 
                                    <span><i ${groupIdData ? "style='color: #fffb28'" : ""} class="bulb mdi ${groupIdData ? "mdi-lightbulb-on" : "mdi-lightbulb-outline"}"></i></span>                        
                                </div>
                            </div>                                           
                        `);
                    }
                });
            });
        });

        // Event for when the favorite tab is clicked
        elements.mode_favorite.addEventListener('click', (e) => {
            elements.resetModeColor();
            elements.mode_favorite.style.color = '#fffb28';
            
            const favoriteData = store.get('favorite');
            const lightData = store.get('lightState');
            const groupData = store.get('groupState');

            // Show favorite lights
            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                lights.lights.forEach((light) => {
                    const favoriteLight = favoriteData.lights[light.id];
                    const lightIdData = lightData[light.id];
                    if (favoriteLight && favoriteLight.enabled) {
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                            <div data-id="${light.id}" data-type="light" class="light__card">
                                <div>
                                    <span><i style="color: #fffb28" class="star mdi mdi-star"></i></span>
                                    <span><p>${light.name}</p></span>
                                    <span><i ${lightIdData.on ? "style='color: #fffb28'" : ""} class="bulb mdi ${lightIdData.on ? "mdi-lightbulb-on" : "mdi-lightbulb-outline"}"></i></span>                                                      
                                </div>
                                <p>${light.type}</p>
                            </div>                        
                        `);
                    }
                });
            });
            
            // Show favorite groups
            hue.groups((err, groups) => {
                if (err) throw err;
                //while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        const favoriteGroup = favoriteData.groups[group.id];
                        if (favoriteGroup && favoriteGroup.enabled) {
                            const groupIdData = groupData[group.id];
                            elements.section_lights.insertAdjacentHTML('beforeend', `
                                <div data-id="${group.id}" data-type="group" class="light__card">
                                    <div>
                                        <span><i style="color: #fffb28" class="star mdi mdi-star"></i></span>
                                        <span><p>${group.name}</p></span>
                                        <span><i ${groupIdData ? "style='color: #fffb28'" : ""} class="bulb mdi ${groupIdData ? "mdi-lightbulb-on" : "mdi-lightbulb-outline"}"></i></span>                                                    
                                    </div>
                                </div>                        
                            `);
                        }
                    }
                });
            });
        });
    }
    
    // If there is no valid connection, hide the lights, groups, and favorite tabs.
    const initInvalidEventListener = () => {
        console.log("here");
        elements.mode_groups.style.display = "none";
        elements.mode_lights.style.display = "none";
        elements.mode_favorite.style.display = "none";
    }
    
    // Initialize the setting event listener (will show different options depending on weather there is a valid connection)
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

    // Initialize stored data if it doesn't already exist
    const initLaunch = () => {
        if(!store.get('favorite', null)) {
            store.set('favorite', {
                lights: {

                },
                groups: {

                }
            });
        }
        if(!store.get('lightState', null)) { // lightState doesn't exists
            store.set('lightState', {

            });
        }
        if(!store.get('groupState', null)) {
            store.set('groupState', {
                
            });
        }

        hue.lights((err, lights) => {
            if (err) throw err;
            const lightState = store.get('lightState');
            let i = 0;
            lights.lights.forEach((light) => {
                setTimeout(() => { // Avoid overloading bridge
                    hue.lightStatus(light.id).then((status) => {
                        lightState[light.id] = status.state;
                    }).done(() => {
                        store.set('lightState', lightState)
                    })
                }, 50*i);
                i++;
            });
        });
        
        hue.groups((err, groups) => {
            if (err) throw err;
            const lightState = store.get('lightState');
            const groupState = store.get('groupState');
            groups.forEach((group) => {
                let allOn = true;
                // console.log(group);
                if (group.id !== "0") {
                    group.lights.forEach((light) => {
                        if(!lightState[light].on) {
                            allOn = false;
                        }
                    });
                    if (allOn) {
                        groupState[group.id] = true;
                    } else {
                        groupState[group.id] = false;
                    }
                }
            });
            store.set('groupState', groupState);
        });
    }
    
    return {
        init: () => {
            initLaunch();
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