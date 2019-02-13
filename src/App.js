import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { osKeys } from './util'
import Header from './Header';
import Footer from './Footer';
import NotFound from './NotFound';
import ReleaseTable from './ReleaseTable';
import ReleaseDownloads from './ReleaseDownloads';

const osRegex = osKeys.join('|')
const versionRegex = "\\d+\\.\\d+\\.\\d+\\.\\d+"

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Header/>
          <Switch>
            <Route path={`/:releaseOs(${osRegex})/:releaseVersion(${versionRegex})`} component={ReleaseDownloads}/>
            <Route path={`/:releaseVersion(${versionRegex})/`} component={ReleaseTable}/>
            <Route path={`/:releaseOs(${osRegex})/`} component={ReleaseTable}/>
            <Route path="/" component={ReleaseTable}/>
            <Route component={NotFound}/>
          </Switch>
          <Footer/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
