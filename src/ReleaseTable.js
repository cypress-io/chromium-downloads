import React from 'react';
import { Breadcrumbs, H2, Card, NonIdealState, Button, Spinner, HTMLTable } from '@blueprintjs/core';
import { Link } from 'react-router-dom'
import { osToNameMap } from './util';

export default class ReleaseTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            releasesLoaded: false,
            errorLoading: false
        }
    }

    componentDidMount() {
        if (this.props.match && this.props.match.params.releaseOs) {
            this.releaseOs = this.props.match.params.releaseOs
        }
        this._loadReleases()
    }

    render() {
        return (
            <Card>
                {this._render()}
            </Card>
        )
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
        return (
            <>
                {this.releaseOs && <Breadcrumbs items={
                    [
                        { text: <Link to="/">All Releases</Link> },
                        {}
                    ]
                }/>}
                <H2>Latest Releases{this.releaseOs && ` for ${osToNameMap[this.releaseOs]}`}</H2>
                <HTMLTable bordered condensed striped style={{width: '100%'}}>
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>Platform</th>
                            <th>Release Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.releases.map(release => {
                            return (
                                <tr key={`${release.version} ${release.os} ${release.timestamp}`}>
                                    <td>{release.version}</td>
                                    <td>
                                        <Link to={`/${release.os}/`}>{osToNameMap[release.os]}</Link>
                                    </td>
                                    <td>{release.timestamp}</td>
                                    <td>
                                        <Link to={`/${release.os}/${release.version}`}>Get downloads</Link>
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
            releases = releases.filter(release => osToNameMap[release.os])
            if (this.releaseOs) {
                releases = releases.filter(release => release.os === this.releaseOs)
            }
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
