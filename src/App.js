import React, { Component } from 'react';
import './App.css';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer
const fs = electron.remote.require('fs');
const path = electron.remote.require('path');
var ws = require('windows-shortcuts');
// const ipcRenderer  = electron.ipcRenderer;
class App extends Component {
  componentDidMount(){
    
    console.log('watch sent')
    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault()

    }
    document.ondragover = (ev) => {
      // document.querySelector('.container').removeAttribute('id')
      // console.log('e')
      ev.preventDefault()

    }

    document.ondrop = (ev) => {
      // document.querySelector('.container').setAttribute('id','hide')
      let path = ev.dataTransfer.files[0].path
      alert('ok',path)
      ipcRenderer.send('init',path)
      ipcRenderer.send('watch')
      ev.preventDefault()
    }

  }
  render() {
    return (
  
<div className="container" id="hide" >
  <div className="dropZone">
  <h1>drop directory here</h1>
  </div> 
</div>
    );
  }
}

export default App;
