const path = require('path');

module.exports = {
    electronPackagerConfig: {
        icon: path.resolve(__dirname, "src/assets/icons/test.ico")
    },
    packagerConfig: {
        executableName: "Hue Control",
        name: "Hue Control"
    },
    makers: [
    {
        name: "@electron-forge/maker-squirrel",
        config: {
        name: "huecontrol",
        description: "A desktop application for controling your Hue Smart Lights",
        iconUrl: "https://github.com/NicolasNewman/Hue-Control/blob/master/src/assets/icons/test.ico?raw=true",
        setupIcon: path.resolve(__dirname, "src/assets/icons/test.ico"),
        setupExe: "Hue Control Installer.exe"
        }
    },
    {
        name: "@electron-forge/maker-zip",
        platforms: [
        "darwin"
        ]
    },
    {
        name: "@electron-forge/maker-deb",
        config: {}
    },
    {
        name: "@electron-forge/maker-rpm",
        config: {}
    }
    ]
}