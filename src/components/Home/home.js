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
    section_lights: document.querySelector('.section__lights')
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
            
            hue.lights().then(displayResult).done();
        });
        elements.mode_groups.addEventListener('click', (e) => {
            elements.mode_groups.style.color = '#fffb28';
            elements.mode_lights.style.color = '#fff';            
        });
    }

    return {
        init: () => {
            initEventListener();
        }
    }
})();

homeController.init();