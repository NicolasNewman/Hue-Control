const Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      hue    = new HueApi(),
      Store  = require('electron-store'),
      store  = new Store();

const elements = {
    list: document.querySelector('.devices'),
    spinner: document.querySelector('.lds-ring'),
    header: document.querySelector('.info__header'),
    section_connect: document.querySelector('.section__connect'),
    section_bridge: document.querySelector('.section__bridge'),
    loading_bar_shrink: document.querySelector('.loading_bar_shrink'),
    btn_retry: document.querySelector('#retry-sync'),
    btn_retry_search: document.querySelector('#retry-search')
}

const hueRegisterController = (() => {
    const bridgeText = [];
    let syncSuccess = false;
    let host = null;

    // Scans the network for available bridges
    const scanForBridge = () => {
        Hue.nupnpSearch().then(displayBridges).done(displayBridgesFinished)
        // Hue.upnpSearch().then(displayBridges).done(displayBridgesFinished);
    }

    // Called when each available bridge are obtained
    const displayBridges = (bridges) => {
        console.log(`Found a bridge: ${JSON.stringify(bridges)}`);
        bridges.forEach(bridge => {
            bridgeText.push(`<p data-ip="${bridge.ipaddress}" class="hue-bridge">${JSON.stringify(bridge)}</p>`)
        });
    }
    
    // Called once the bridges have been processed
    const displayBridgesFinished = () => {
        if(bridgeText.length > 0) {
            bridgeText.forEach(element => {
                elements.list.insertAdjacentHTML('beforeend', element);
            });
            elements.header.innerHTML = 'Select a device to connect to';
        } else {
            elements.header.innerHTML = 'No bridges found'
        }
        elements.spinner.style.display = 'none';
        initEventListener();
    }

    const registerBridgeSuccess = (bridge) => {
        syncSuccess = true;
        store.set('ip', host);
        store.set('username', bridge);
        console.log(bridge);
    }

    const registerBridgeError = (x, err) => {
        console.log(err);
        if(x >= 6) {
            elements.header.innerHTML = 'Bridge timeout';
            elements.btn_retry.style.display = 'block';
        }
    }

    // Initializes the event listeners
    const initEventListener = () => {
        document.querySelectorAll('.devices p').forEach(p => {
            p.addEventListener('click', (event) => {
                elements.section_bridge.style.display = 'none';
                elements.section_connect.style.display = 'block';
                elements.header.innerHTML = 'Please press the button in the middle of your bridge'
                
                host = p.getAttribute('data-ip');
                for(var x=1; x<=6; x++) {
                    window.setTimeout(((x) => {
                        if(!syncSuccess) {
                            hue.registerUser(host).then(registerBridgeSuccess).fail(registerBridgeError.bind(null, x)).done();
                        }
                    }).bind(null, x), 5000 * x);
                }
            });
        });
        elements.btn_retry.addEventListener('click', (event) => {
            console.log("clicked");
        });
        elements.btn_retry_search.addEventListener('click', (event) => {
            scanForBridge();
        });
    }

    return {
        scanForBridge:  () => {
           scanForBridge();
        }
    }
})();

elements.section_connect.style.display = 'none';
hueRegisterController.scanForBridge();