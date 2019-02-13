import React from 'react'
import { NonIdealState, Spinner, Card, H2, H4, HTMLTable, Icon } from '@blueprintjs/core'
import { osToBaseDirMap, osToFilesMap, osToNameMap, getHumanReadableSize } from './util'

const MAX_BASES_TO_CHECK = 50

export default class ReleaseDownloads extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            status: "Initializing",
            chromiumBaseCur: undefined,
            downloads: [],
            loaded: false,
            error: false
        }
        this.basesChecked = 0
    }

    componentDidMount() {
        this.releaseOs = this.props.match.params.releaseOs
        this.releaseVersion = this.props.match.params.releaseVersion
        this._findBase().then((base) => this._findDownloads(base))
        .then(downloads => {
            this.setState({ loaded: true, downloads })
        })
        .catch(error => {
            this.setState({ error })
        })
    }

    render() {
        if (this.state.error) {
            return this._renderError()
        }
        if (this.state.loaded) {
            return this._renderDownloads()
        }
        return this._renderLoading()
    }

    _renderDownloads() {
        let unknownDownloads = []
        const title = `Chromium ${this.releaseVersion} for ${osToNameMap[this.releaseOs]}`
        document.title = title
        return (
            <>
                <Card>
                    <H2>{title}</H2>
                    Downloads for this version found!
                </Card>
                <Card>
                    <H4>Archives and installers</H4>
                    <HTMLTable striped style={{width: '100%'}}>
                        <thead>
                            <tr>
                                <th style={{maxWidth: '30px'}}></th>
                                <th>Filename</th>
                                <th style={{maxWidth: '175px'}}>File Size</th>
                            </tr>
                        </thead>
                        <tbody>
                        {this.state.downloads.map(download => {
                            const basename = download.name.slice(download.name.lastIndexOf('/') + 1)
                            const knownFile = osToFilesMap[this.releaseOs].find(file => file.filename === basename)
                            if (!knownFile) {
                                unknownDownloads.push(download)
                                return false
                            }
                            return (
                                <tr key={download.name}>
                                    <td><Icon icon="download"/></td>
                                    <td>
                                        <a href={download.mediaLink} target="_blank" rel="noopener noreferrer">{basename}</a> ({knownFile.name})
                                    </td>
                                    <td>
                                        {getHumanReadableSize(download.size)}
                                    </td>
                                </tr>
                            )
                        }).filter(a=>a)}
                        </tbody>
                    </HTMLTable>
                </Card>
                <Card>
                    <H4>Other files</H4>
                    <HTMLTable striped style={{width: '100%'}}>
                        <thead>
                            <tr>
                                <th style={{maxWidth: '30px'}}></th>
                                <th>Filename</th>
                                <th style={{maxWidth: '175px'}}>File Size</th>
                            </tr>
                        </thead>
                        <tbody>
                        {unknownDownloads.map(download => {
                            const basename = download.name.slice(download.name.lastIndexOf('/') + 1)
                            return (
                                <tr key={download.name}>
                                    <td><Icon icon="help"/></td>
                                    <td>
                                        <a href={download.mediaLink} target="_blank" rel="noopener noreferrer">{basename}</a>
                                    </td>
                                    <td>
                                        {getHumanReadableSize(download.size)}
                                    </td>
                                </tr>
                            )
                        }).filter(a=>a)}
                        </tbody>
                    </HTMLTable>
                </Card>
            </>
        )
    }

    _renderLoading() {
        return (
            <NonIdealState icon={<Spinner/>}
                            description={this.state.status}
                            title="Loading"
                            />
        )
    }

    _renderError() {
        return (
            <NonIdealState icon="error"
                           description={`An error occurred while loading release history: "${this.state.error.message}"`}
                           title="Error Loading Downloads"
                           />
        )
    }

    // https://omahaproxy.appspot.com/deps.json?version=74.0.3704.1
    _findBase() {
        this.setState({
            status: `Loading commit info for ${this.releaseVersion}`
        })
        return fetch(`https://omahaproxy.appspot.com/deps.json?version=${this.releaseVersion}`)
        .then(response => response.json())
        .then(json => {
            if (!json['chromium_base_position']) {
                throw new Error(`Initial base position not found for Chromium ${this.releaseVersion}`)
            }
            return parseInt(json['chromium_base_position'])
        })
    }

    _findDownloads(base) {
        this.setState({
            chromiumBaseCur: base,
            status: `Checking Chromium at base position ${base} for available artifacts`
        })
        return fetch(this._getStorageApiUrl(base))
        .then(response => response.json())
        .then(json => {
            this.basesChecked += 1
            if (!json.items || json.items.length === 0) {
                if (this.basesChecked === MAX_BASES_TO_CHECK) {
                    throw new Error(`Reached limit of ${MAX_BASES_TO_CHECK} base checks before finding an artifact. Stopping at base ${base}`)
                }
                return this._findDownloads(base - 1)
            }
            return json.items
        })
    }

    _getStorageApiUrl(base) {
        return `https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=${osToBaseDirMap[this.releaseOs]}/${base}/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken`
    }
}
