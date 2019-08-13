import React from 'react'
import { Button, NonIdealState, Spinner, Card, H2, H4, HTMLTable, Icon, Breadcrumbs, Tag } from '@blueprintjs/core'
import { Link } from 'react-router-dom'
import { osInfo, getHumanReadableSize, channelInfo } from './util'

const MAX_BASES_TO_CHECK = 50

export default class ReleaseDownloads extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            logs: [],
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
        this.releaseChannel = this.props.match.params.releaseChannel
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
        const baseRevision = this.state.chromiumBaseCur - this.basesChecked
        const title = `Chromium ${this.releaseVersion} for ${osInfo[this.releaseOs].name}`
        document.title = title
        return (
            <>
                <Card>
                    <Breadcrumbs items={
                        [
                            { text: <Link to="/">All Releases</Link> },
                            { text: <Link to={`/${this.releaseOs}/`}>{osInfo[this.releaseOs].name} Releases</Link> },
                            {}
                        ]
                    }/>
                    <H2>{title}</H2>
                    <div className="bp3-text-muted">
                        Release channel: <Tag intent={channelInfo[this.releaseChannel].color}>{this.releaseChannel}</Tag>{' '}
                        Base revision: <a href={this._getCrRevUrl(baseRevision)}>{baseRevision}</a>.{' '}
                        Found build artifacts at <a href={this._getCrRevUrl(this.state.chromiumBaseCur)}>{this.state.chromiumBaseCur}</a> <a href={this._getStorageBrowserUrl(this.state.chromiumBaseCur)}>[browse files]</a>
                    </div>
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
                            const knownFile = osInfo[this.releaseOs].files.find(file => file.filename === basename)
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
            <Card>
                <NonIdealState icon={<Spinner/>}
                                description={this.state.logs.map((s, i) => <React.Fragment key={i}>{s}<br/></React.Fragment>)}
                                title="Loading"
                                />
            </Card>
        )
    }

    _renderError() {
        return (
            <Card>
                <NonIdealState icon="error"
                            description={<>
                                    <div style={{color: '#DB3737'}}>
                                        An error occurred while trying to find artifacts: <br/>
                                        "{this.state.error.message}"<br/><br/>
                                        Please try a different release or come back later.<br/>
                                        <br/>
                                    </div>
                                    <div className="bp3-text-muted">
                                        <strong>Logs:</strong><br/>
                                        {this.state.logs.map((s, i) => <React.Fragment key={i}>{s}<br/></React.Fragment>)}
                                    </div>
                                </>
                                }
                            action={<Button onClick={()=>window.location.reload()} icon="refresh">Reload page</Button>}
                            title="Error Finding Artifacts"
                            />
            </Card>
        )
    }

    // https://omahaproxy.appspot.com/deps.json?version=74.0.3704.1
    _findBase() {
        this.setState({
            logs: this._logWith(`Loading commit info for ${this.releaseVersion}`)
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
            logs: this._logWith(`Checking Chromium at base position ${base} for available artifacts`)
        })
        return fetch(this._getStorageApiUrl(base))
        .then(response => response.json())
        .then(json => {
            this.basesChecked += 1
            if (!json.items || json.items.length === 0) {
                if (this.basesChecked === MAX_BASES_TO_CHECK) {
                    throw new Error(`Reached limit of ${MAX_BASES_TO_CHECK} base checks before finding an artifact. Stopping at base ${base}`)
                }
                return this._findDownloads(base + 1)
            }
            return json.items
        })
    }

    _logWith(msg) {
        return [msg, ...this.state.logs]
    }

    _getStorageApiUrl(base) {
        return `https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=${osInfo[this.releaseOs].baseDir}/${base}/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken`
    }

    _getCrRevUrl(base) {
        return `https://crrev.com/${base}`
    }

    _getStorageBrowserUrl(base) {
        return `https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${osInfo[this.releaseOs].baseDir}/${base}/`
    }
}
