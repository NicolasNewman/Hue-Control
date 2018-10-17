const Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      hue    = new HueApi(),
      Store  = require('electron-store'),
      store  = new Store();

const elements = {

}

const homeController = (() => {
    const displayResult = (result) => {
        console.log(result);
    };
    const init = () => {
        hue.lights().then(displayResult).done();
        hue.groups().then(displayResult).done();
        hue.scenes().then(displayResult).done();        
    };
    return {
        init: () => {
            init();
        }
    }
})();

homeController.init();