import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

window.API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

ReactDOM.render(<App />, document.getElementById('root'));
