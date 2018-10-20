const remote = require('electron').remote; 
const app = require('electron').remote.app;


const menuBarController = (() => {
    const elements = {
        min: document.querySelector('#btn-min'),
        max: document.querySelector('#btn-max'),
        close: document.querySelector('#btn-close')
    }

    const initEventListener = () => {
        elements.min.addEventListener('click', (e) => {
            const window = remote.getCurrentWindow();
            window.minimize();
        });
        elements.max.addEventListener('click', (e) => {
            const window = remote.getCurrentWindow();
            if (!window.isMaximized()) {
                window.maximize();
            } else {
                window.minimize();
            }
        });
        elements.close.addEventListener('click', (e) => {
            const window = remote.getCurrentWindow();
            window.close();
            app.quit();
        });
    }

    return {
        initEventListener: () => {
            initEventListener();
        }
    }
})();
menuBarController.initEventListener();