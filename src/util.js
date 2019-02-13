const filesize = require('file-size')

export const getHumanReadableSize = (size) => {
    return filesize(parseInt(size)).human('si')
}

export const osToNameMap = {
    'win64': 'Windows (x64)',
    'win':   'Windows (x86)',
    'mac':   'Mac OS',
    'linux': 'Linux'
}

export const osKeys = Object.keys(osToNameMap)

export var osToFilesMap = {
    'win': [
        {
            name: 'Installer',
            filename: 'mini_installer.exe'
        },
        {
            name: 'Archive',
            filename: 'chrome-win.zip'
        }
    ],
    'linux': [
        {
            name: 'Archive',
            filename: 'chrome-linux.zip'
        }
    ],
    'mac': [
        {
            name: 'Archive',
            filename: 'chrome-mac.zip'
        }
    ]
}

osToFilesMap.win64 = osToFilesMap.win

export const osToBaseDirMap = {
    'win64': 'Win_x64',
    'win':   'Win',
    'mac':   'Mac',
    'linux': 'Linux_x64'
}
