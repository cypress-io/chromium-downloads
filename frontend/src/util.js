const filesize = require('file-size')

export const getHumanReadableSize = (size) => {
    return filesize(parseInt(size)).human('si')
}

export const channelInfo = {
    'canary': {
        color: 'warning'
    },
    'canary_asan': {
        color: 'warning'
    },
    'stable': {
        color: 'success'
    },
    'dev': {
        color: 'primary'
    },
    'beta': {
        color: 'danger'
    }
}

export const channelKeys = Object.keys(channelInfo)

export var osInfo = {
    'win64': {
        name: 'Windows (x64)',
        baseDir: 'Win_x64',
        files: [
            {
                name: 'Installer',
                filename: 'mini_installer.exe'
            },
            {
                name: 'Archive',
                filename: 'chrome-win.zip'
            },
            {
                name: 'Archive',
                filename: 'chrome-win32.zip'
            }
        ]
    },
    'win': {
        name: 'Windows (x86)',
        baseDir: 'Win'
    },
    'mac': {
        name: 'Mac OS',
        baseDir: 'Mac',
        files: [
            {
                name: 'Archive',
                filename: 'chrome-mac.zip'
            }
        ]
    },
    'linux': {
        name: 'Linux',
        baseDir: 'Linux_x64',
        files: [
            {
                name: 'Archive',
                filename: 'chrome-linux.zip'
            }
        ]
    }
}

osInfo.win.files = osInfo.win64.files

export const osKeys = Object.keys(osInfo)
