const Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      Store  = require('electron-store'),
      store  = new Store();

const host     = store.get('ip'),
      username = store.get('username'),
      hue      = new HueApi(host, username);

const elements = {
    mode_lights: document.querySelector('#mode--lights'),
    mode_groups: document.querySelector('#mode--groups'),
    section_lights: document.querySelector('.section__lights').firstElementChild
}

const homeController = (() => {
    const displayResult = (result) => {
        console.log(result);
    };
    const init = () => {
        hue.groups().then(displayResult).done();
        hue.scenes().then(displayResult).done();        
    };

    const initEventListener = () => {
        elements.mode_lights.addEventListener('click', (e) => {
            elements.mode_lights.style.color = '#fffb28';
            elements.mode_groups.style.color = '#fff';
            
            hue.lights((err, lights) => {
                if (err) throw err;
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                lights.lights.forEach((light) => {
                    console.log(light);
                    elements.section_lights.insertAdjacentHTML('beforeend', `
                        <div data-id="${light.id}" class="light__card">
                            <p>${light.type}</p>
                            <p>${light.name}</p>
                        </div>                        
                    `);
                })
            });
        });
        elements.mode_groups.addEventListener('click', (e) => {
            elements.mode_groups.style.color = '#fffb28';
            elements.mode_lights.style.color = '#fff';    
            
            hue.groups((err, groups) => {
                if (err) throw err;
                console.log(groups);
                while(elements.section_lights.firstChild) elements.section_lights.removeChild(elements.section_lights.firstChild);
                groups.forEach((group) => {
                    if (group.id !== "0") {
                        elements.section_lights.insertAdjacentHTML('beforeend', `
                            <div data-id="${group.id}" class="light__card">
                                <p>${group.name}</p>
                            </div>                        
                        `);
                    }
                });
                // groups.groups.forEach((light) => {
                //     console.log(light);
                //     elements.section_lights.insertAdjacentHTML('beforeend', `
                //         <div data-id="${light.id}" class="light__card">
                //             <p>${light.type}</p>
                //             <p>${light.name}</p>
                //         </div>                        
                //     `);
                // })
            });
        });
    }
    
    return {
        init: () => {
            initEventListener();
        }
    }
})();

homeController.init();