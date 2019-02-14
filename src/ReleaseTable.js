import React from 'react';
import { Tag, Breadcrumbs, H2, Card, NonIdealState, Button, Spinner, HTMLTable } from '@blueprintjs/core';
import { Link } from 'react-router-dom'
import { osInfo, channelInfo } from './util';

export default class ReleaseTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            releasesLoaded: false,
            errorLoading: false
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
        return (
            <>
                {this._getOs() && <Breadcrumbs items={
                    [
                        { text: <Link to="/">All Releases</Link> },
                        {}
                    ]
                }/>}
                <H2>{title}</H2>
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
                        {this.state.releases
                        .filter(release => {
                            return !this._getOs() || release.os === this._getOs()
                        })
                        .map(release => {
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
                        })}
                    </tbody>
                </HTMLTable>
            </>
        )
    }

    _loadReleases() {
        fetch('https://omahaproxy.appspot.com/history.json')
        .then(response => {
            return response.json()
        })
        .then(releases => {
            // filter to OS's we recognize
            releases = releases.filter(release => osInfo[release.os])
            releases = releases.sort((a, b) => a.version.localeCompare(b.version)*-1)
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
}
