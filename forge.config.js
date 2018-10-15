const path = require('path');

module.exports = {
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
        iconUrl: "https://github.com/NicolasNewman/Hue-Control/blob/master/src/res/icons/win_icon.ico?raw=true",
        setupIcon: path.resolve(__dirname, "src/res/icons/win_icon.ico"),
        setupExe: "Hue Control Installer"
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