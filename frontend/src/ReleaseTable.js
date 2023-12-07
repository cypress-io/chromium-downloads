import React from 'react';
import { Tag, Breadcrumbs, H2, Card, NonIdealState, Button, Spinner, HTMLTable } from '@blueprintjs/core';
import { Link } from 'react-router-dom'
import { osInfo, channelInfo } from './util'
import ReleaseFilter from './ReleaseFilter'

export default class ReleaseTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            releasesLoaded: false,
            errorLoading: false,
            filters: {
                'os': [],
                'channel': [],
                'majorVersion': []
            }
        }
    }

    componentDidMount() {
        this._loadReleases()
    }

    render() {
        return (
            <Card>
                {this._render()}
            </Card>
        )
    }

    _getOs() {
        if (this.props.match && this.props.match.params.releaseOs) {
            return this.props.match.params.releaseOs
        }
    }

    _render() {
        if (this.state.errorLoading) {
            return this._renderError()
        }
        if (!this.state.releasesLoaded) {
            return this._renderLoading()
        }
        return this._renderReleases()
    }

    _renderError() {
        return (
            <NonIdealState icon="error"
                           description={`An error occurred while loading release history: "${this.state.errorLoading.message}"`}
                           title="Error Loading Releases"
                           action={<Button onClick={()=>window.location.reload()} icon="refresh">Reload page</Button>}
                           />
        )
    }

    _renderLoading() {
        return (
            <NonIdealState icon={<Spinner/>}
                           description="Loading release history..."
                           title="Loading"
                           />
        )
    }

    _renderReleases() {
        const title = document.title = `Latest Releases${this._getOs() ? ` for ${osInfo[this._getOs()].name}` : ''}`
        const filteredReleases = this._getFilteredReleases()
        return (
            <>
                {this._getOs() && <Breadcrumbs items={
                    [
                        { text: <Link to="/">All Releases</Link> },
                        {}
                    ]
                }/>}

                <ReleaseFilter hideOs={!!this._getOs()}
                               filters={this.state.filters}
                               majorVersions={this._getMajorVersions()}
                               onFilter={(type, key, value) => {
                                    this.setState({
                                        filters: Object.assign({}, this.state.filters, {
                                            [type]: this.state.filters[type].filter(key2 => value || key2 !== key).concat(value ? [key] : [])
                                        })
                                    })
                                }}
                                onClearFilters={() => {
                                    this.setState({
                                        filters: {
                                            os: [], channel: [], majorVersion: []
                                        }
                                    })
                                }}
                                />

                <H2 style={{display: 'inline-block'}}>{title}</H2>

                <HTMLTable bordered condensed striped style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>Channel</th>
                            <th>Platform</th>
                            <th>Release Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReleases.length !== 0 ? filteredReleases.map(release => {
                            return (
                                <tr key={`${release.version} ${release.os} ${release.timestamp}`}>
                                    <td>{release.version}</td>
                                    <td><Tag intent={channelInfo[release.channel].color}>{release.channel}</Tag></td>
                                    <td>
                                        <Link to={`/${release.os}/`}>{osInfo[release.os].name}</Link>
                                    </td>
                                    <td>{release.timestamp}</td>
                                    <td>
                                        <Link to={`/${release.os}/${release.channel}/${release.version}`}>Get downloads</Link>
                                    </td>
                                </tr>
                            )
                        })
                        :
                        <tr>
                            <td colSpan="5" style={{textAlign: 'center'}} className="bp3-text-muted">No releases were found matching your filters.</td>
                        </tr>}
                    </tbody>
                </HTMLTable>
            </>
        )
    }

    _getFilteredReleases() {
        return this.state.releases
        .filter(release => {
            return (this._getOs() ? release.os === this._getOs() : (this.state.filters.os.length === 0 || this.state.filters.os.includes(release.os)))
                    && (this.state.filters.channel.length === 0 || this.state.filters.channel.includes(release.channel))
                    && (this.state.filters.majorVersion.length === 0 || this.state.filters.majorVersion.includes(release.version.split('.', 2)[0]))
        })
    }

    _loadReleases() {
        fetch(`${window.API_URL}/builds`)
        .then(response => {
            return response.json()
        })
        .then(releases => {
            // filter to OS's we recognize
            releases = releases.filter(release => osInfo[release.os])
            releases = releases.sort((a, b) => {
                var items1 = a.version.split('.');
                var items2 = b.version.split('.');
                var k = 0;
                for (let i in items1) {
                    let a1 = items1[i];
                    let b1 = items2[i];
                    if (typeof b1 === undefined) {
                        k = -1;
                        break;
                    } else {
                        if (a1 === b1) {
                            continue;
                        }
                        k = Number(b1) - Number(a1);
                        break;
                    }
                }
                return k;
            });
            this.setState({
                releasesLoaded: true,
                releases
            })
        })
        .catch(err => {
            this.setState({
                errorLoading: err
            })
        })
    }

    _getMajorVersions() {
        if (!this._majorVersions) {
            var majorVersions = []
            this.state.releases.forEach(release => {
                const majorVersion = release.version.split('.', 2)[0]
                if (!majorVersions.includes(majorVersion)) {
                    majorVersions.push(majorVersion)
                }
            })
            this._majorVersions = majorVersions
        }
        return this._majorVersions
    }
}
