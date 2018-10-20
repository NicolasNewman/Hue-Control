const Hue    = require('node-hue-api'),
      HueApi = Hue.HueApi,
      hue    = new HueApi(),
      Store  = require('electron-store'),
      store  = new Store(),
      global = require('../../assets/js/global');

const elements = {
    list: document.querySelector('.devices'),
    spinner: document.querySelector('.lds-ring'),
    header: document.querySelector('.info__header'),
    section_connect: document.querySelector('.section__connect'),
    section_bridge: document.querySelector('.section__bridge'),
    loading_bar_shrink: document.querySelector('.loading_bar_shrink'),
    btn_retry_sync: document.querySelector('#retry-sync'),
    btn_retry_search: document.querySelector('#retry-search')
}

const setHeaderText = (text) => {
    elements.header.innerHTML = text
}

// const toggleVisibility = (element, state) => {
//     if (element.style) {
//         element.style.display = state
//     }
// }

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
        console.log(`Found bridges: ${JSON.stringify(bridges)}`);
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
            setHeaderText('Select a device to connect to');
            global.toggleVisibility(elements.btn_retry_search, 'none');
            // elements.btn_retry_search.style.display = 'none';
        } else {
            setHeaderText('No bridges found');
            global.toggleVisibility(elements.btn_retry_search, 'block');
            // elements.btn_retry_search.style.display = 'block';
        }
        global.toggleVisibility(elements.spinner, 'none');
        // elements.spinner.style.display = 'none';
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
            setHeaderText('Bridge timeout');
            global.toggleVisibility(elements.btn_retry_sync, 'block');
            // elements.btn_retry_sync.style.display = 'block';
        }
    }
    
    // Initializes the event listeners
    const initEventListener = () => {
        document.addEventListener('click', (e) => {
            console.log(e.target);
            if(e.target && e.target.className == 'hue-bridge') {
                global.toggleVisibility(elements.section_bridge, 'none');
                global.toggleVisibility(elements.section_connect, 'block');
                // elements.section_bridge.style.display = 'none';
                // elements.section_connect.style.display = 'block';
                setHeaderText('Please press the button in the middle of your bridge');
                
                host = e.target.getAttribute('data-ip');
                for(var x=1; x<=6; x++) {
                    window.setTimeout(((x) => {
                        if(!syncSuccess) {
                            hue.registerUser(host).then(registerBridgeSuccess).fail(registerBridgeError.bind(null, x)).done();
                        }
                    }).bind(null, x), 5000 * x);
                }
            }
        });
        elements.btn_retry_sync.addEventListener('click', (event) => {
            // TODO: improve retry 
            setHeaderText('Select a device to connect to');
            global.toggleVisibility(elements.btn_retry_sync, 'none');
            global.toggleVisibility(elements.section_bridge, 'block');
            global.toggleVisibility(elements.section_connect, 'none');
            // elements.btn_retry_sync.style.display = 'none';
            // elements.section_bridge.style.display = 'block';
            // elements.section_connect.style.display = 'none';
        });
        elements.btn_retry_search.addEventListener('click', (event) => {
            scanForBridge();
        });
    }
    
    return {
        scanForBridge: () => {
           scanForBridge();
        },

        initEventListener: () => {
            initEventListener();
        }
    }
})();

// elements.section_connect.style.display = 'none';
global.toggleVisibility(elements.section_connect, 'none');
hueRegisterController.initEventListener();
hueRegisterController.scanForBridge();
