const remote = require('electron').remote,
      Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      Store  = require('electron-store'),
      store  = new Store();

const host     = store.get('ip'),
      username = store.get('username'),
      hue      = new HueApi(host, username, 5000);

const elements = {
    mode_lights: document.querySelector('#mode--lights'),
    mode_groups: document.querySelector('#mode--groups'),
    mode_settings: document.querySelector('#mode--settings'),
    section_lights: document.querySelector('.section__lights').firstElementChild,
    section_actions: document.querySelector('.section__actions')
}

const homeController = (() => {
    const initValidEventListener = () => {
        elements.mode_lights.addEventListener('click', (e) => {
            elements.mode_lights.style.color = '#fffb28';
            elements.mode_groups.style.color = '#fff';
            elements.mode_settings.style.color = '#fff';   

            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                lights.lights.forEach((light) => {
                    console.log(light);
                    elements.section_lights.insertAdjacentHTML('beforeend', `
                        <div data-id="${light.id}" class="light__card">
                            <div>
                                <span><i class="star mdi mdi-star-outline"></i></span>
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
            elements.mode_groups.style.color = '#fffb28';
            elements.mode_lights.style.color = '#fff';    
            elements.mode_settings.style.color = '#fff';    
            
            hue.groups((err, groups) => {
                if (err) throw err;
                console.log(groups);
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                            <div data-id="${group.id}" class="light__card">
                                <div>
                                    <span><i class="star mdi mdi-star-outline"></i></span>
                                    <span><p>${group.name}</p></span>
                                    <span><i class="bulb mdi mdi-lightbulb-outline"></i></span>                            
                                </div>
                            </div>                                           
                        `);
                    }
                });
            });
        });
    }

    const initInvalidEventListener = () => {
        console.log("here");
        elements.mode_groups.style.display = "none";
        elements.mode_lights.style.display = "none";
    }

    const initSettingsListener = (connected) => {
        elements.mode_settings.addEventListener('click', (e) => {
            elements.mode_settings.style.color = '#fffb28';   
            elements.mode_groups.style.color = '#fff';
            elements.mode_lights.style.color = '#fff';  
            
            while(elements.section_actions.firstChild) elements.section_actions.removeChild(elements.section_actions.firstChild);
            if (connected) {

            } else {
                elements.section_actions.insertAdjacentHTML('afterbegin', `
                    <p>Connect to a new bridge:</p>
                `);
            }
        });
    }
    
    return {
        init: () => {
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