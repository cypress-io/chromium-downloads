import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './Header';
import ReleaseTable from './ReleaseTable';
import ReleaseDownloads from './ReleaseDownloads';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Header/>
          <Route exact path="/" component={ReleaseTable}/>
          <Route exact path="/:releaseOs/:releaseVersion" component={ReleaseDownloads}/>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
