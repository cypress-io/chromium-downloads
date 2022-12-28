const got = require('got')

const HISTORY_URL = 'https://omahaproxy.appspot.com/history.json'
const BASES_TO_CHECK = 75

var osInfo = {
  'win64': {
      name: 'Windows (x64)',
      baseDir: 'Win_x64',
      files: [
          {
              type: 'installer',
              filename: 'mini_installer.exe'
          },
          {
              type: 'archive',
              filename: 'chrome-win.zip'
          },
          {
              type: 'archive',
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
              type: 'archive',
              filename: 'chrome-mac.zip'
          }
      ]
  },
  'linux': {
      name: 'Linux',
      baseDir: 'Linux_x64',
      files: [
          {
              type: 'archive',
              filename: 'chrome-linux.zip'
          }
      ]
  }
}

osInfo.win.files = osInfo.win64.files

function getStorageApiUrl(os, base) {
  return `https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=${osInfo[os].baseDir}/${base}/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken`
}

function findInitialBase(version) {
  return got(`https://omahaproxy.appspot.com/deps.json?version=${version}`, { json: true })
  .then(({ body }) => {
    if (!body['chromium_base_position']) {
      throw new Error(`Initial base position not found for Chromium ${version}`)
    }
    return Number(body['chromium_base_position'])
  })
}

function findDownloadsAtBase(os, base) {
  return got(getStorageApiUrl(os, base), { json: true })
}

function getDownloads(os, version) {
  return findInitialBase(version)
  .then(base => {
    let foundBase = base

    const tryBase = () =>
      findDownloadsAtBase(os, foundBase)
      .then(({ body }) => {
        if (body.items && body.items.length > 0) {
          return body.items
        }

        if (foundBase - base > BASES_TO_CHECK) {
          throw new Error("Reached maximum base check limit before finding artifact.")
        }

        foundBase += 1
        return tryBase()
      })

    return tryBase()
    .then(items => {
      return items.map(item => {
        const basename = item.name.slice(item.name.lastIndexOf('/') + 1)
        const knownFile = osInfo[os].files.find(file => file.filename === basename)

        return {
          name: item.name,
          basename,
          url: item.mediaLink,
          size: item.size,
          info: knownFile
        }
      })
    })
    .then(downloads => {
      return {
        downloads,
        base,
        foundBase
      }
    })
  })
}

function getBuilds() {
  return got(HISTORY_URL, { json: true })
  .then(({ body: releaseHistory}) => {
    return releaseHistory.map(release => {
      release.getDownloads = () => {
        if (!osInfo[release.os]) {
          return Promise.reject(new Error('Unsupported OS'))
        }
        return getDownloads(release.os, release.version)
      }

      return release
    })
  })
}

module.exports = {
  getBuilds,
  getDownloads,
  osInfo
}
