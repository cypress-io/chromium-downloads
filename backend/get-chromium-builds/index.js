const got = require('got')

// Cypress's minimum browser version is 64
const BASES_TO_CHECK = 120

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
  //https://omahaproxy.appspot.com/deps.json?version=${version}
  /*
  {
    "chromium_version": "113.0.5672.127", 
    "skia_commit": "1195e70d671947af02a6a5b0ddc65806b9645252", //'skia_revision': '1195e70d671947af02a6a5b0ddc65806b9645252',
    "chromium_base_position": "1121455", 
    "v8_version": "11.3.244.11", 
    "v8_commit": "62a6b2a10ad6157613544eb9e4be0f4ef821159b", 
    "chromium_branch": "5672", 
    "v8_position": "21", 
    "chromium_base_commit": "5f2a72468eda1eb945b3b5a2298b5d1cd678521e", 
    "chromium_commit": "c360dcf587f4828a1ce798e1b61f238cb6d69640"}
  */

  //https://chromiumdash.appspot.com/fetch_version?version=113.0.5672.127
  /*
  {"chromium_main_branch_position":1121455,"hashes":{"angle":"b02f159baf67e5dcbbb5c69d760889823ce09aae","chromium":"c360dcf587f4828a1ce798e1b61f238cb6d69640","dawn":"543ca1e4cd6474fe2772ad689bab7256a946cf04","devtools":"e24710d614f3f16412444484e1f64b4439b965d8","pdfium":"7c9b2b33ac5759b0443d8f6e01f07432ff034c12","skia":"1195e70d671947af02a6a5b0ddc65806b9645252","v8":"62a6b2a10ad6157613544eb9e4be0f4ef821159b","webrtc":"f6ab0b438e22ea30db7ad3fbf9f870b0d4506235"},"milestone":113,"v8_main_branch_position":86647,"v8_version":"11.3.244.11"}
  */
  return got(`https://chromiumdash.appspot.com/fetch_version?version=${version}`, { json: true })
  .then(({ body }) => {
    if (!body['chromium_main_branch_position']) {
      throw new Error(`Initial base position not found for Chromium ${version}`)
    }
    return Number(body['chromium_main_branch_position'])
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
  //https://versionhistory.googleapis.com/v1/chrome/platforms/all/channels/all/versions/all/releases?filter=endtime%3E2021-01-01T00:00:00Z
  /*
  {
    "name": "chrome/platforms/linux/channels/stable/versions/120.0.6099.71/releases/1701896460",
    "serving": {
      "startTime": "2023-12-06T21:01:00Z"
    },
    "fraction": 1,
    "version": "120.0.6099.71",
    "fractionGroup": "1"
  }*/

  //https://omahaproxy.appspot.com/history.json
  //{"timestamp": "2020-12-22 08:55:08.893176", "version": "89.0.4364.0", "os": "android", "channel": "canary"},
  return got('https://versionhistory.googleapis.com/v1/chrome/platforms/all/channels/all/versions/all/releases?filter=endtime%3E2021-01-01T00:00:00Z', { json: true })
  .then(({ body: releaseHistory}) => {
    return releaseHistory.map(release => {
      
      release.timestamp = release.serving.startTime
      release.version = release.name.toString().split("/")[6]
      release.os = release.name.toString().split("/")[2]
      release.channel = release.name.toString().split("/")[4]

      release.getDownloads = () => {
        if (!osInfo[os]) {
          return Promise.reject(new Error('Unsupported OS'))
        }
        return getDownloads(os, version)
      }

      return {timestamp, version, os, channel}
    })
  })
}

module.exports = {
  getBuilds,
  getDownloads,
  osInfo
}
