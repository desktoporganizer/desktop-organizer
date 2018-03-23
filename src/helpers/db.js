const storage = require('electron-json-storage');
const config = require('../config')
const electron = require('electron')
const app = electron.app
var basepath = app.getPath('userData')
storage.setDataPath(basepath+'/storage');
const get = (key)=>{
  return new Promise((resolve,reject)=>{
    has(key)
    .then(data=>{
      storage.get(key,(error,data)=>{
        if(error) reject(error)
        resolve(data)
      })
    }).catch(e=>console.log(e))
    
  })
}
const has = (key)=>{
  return new Promise((resolve,reject)=>{
    storage.has(key, function(error, hasKey) {
      if (error) reject(error)
    
      if (hasKey) {
        resolve(`There is data stored as ${key}`);
      }
      resolve({success:false,message:'no such a key'})
    });
  })
}
const set = (key,value)=>{
  return new Promise((resolve,reject)=>{
    storage.set(key,value, function(error) {
      if (error) reject(error)
    
      
      resolve(key,'saved')
    });
  })
}
const clear = (key)=>{
  return new Promise((resolve,reject)=>{
    storage.remove(key, function(error) {
      if (error) reject(error)
    
      
      resolve(key,'saved')
    });
  })
}

module.exports = {
  get ,has ,set ,clear
}