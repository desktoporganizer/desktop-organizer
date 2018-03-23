var ws = require('windows-shortcuts');
const fse = require('fs-extra')
const db = require('./db')
const fs = require('fs');
const path = require('path')
const { exec } = require('child_process');
const electron = require('electron')
const app = electron.app
var basepath = app.getPath('logs');
console.log()
var winston = require('winston');
  winston.configure({
    transports: [
      new (winston.transports.File)({ filename: basepath+'/somefile.log' })
    ]
  });
const watch = async()=>{
  

  try{
  winston.info('let\'s get lates file changes')
  let apps = await db.get('apps')
  if(!apps)
    return false
  // apps = JSON.parse(apps)
  let fileHistory = []
  let needUpdate =false 
  // apps.forEach(app=>{
    for(let i = 0;i<apps.length;i++){
      try{
        let app = apps[i]
        let status 
        status = fs.lstatSync(app.path)
        if(app.original){
          status = fs.lstatSync(app.original)
        }
 
        let lastAccess = status.atimeMs
        // winston.info(lastAccess)
        if(lastAccess > app.atime){
          winston.info(`${new Date(app.atime)}opened recently ${app.app},${new Date(app.atimeMs)}`)
          let counter =  parseInt(app.counter) + 1 
          
          app.counter=counter
          app.atime = lastAccess
          needUpdate = true
        }
        let ext = path.extname(app.app)
        if(ext == '.lnk' && app.isShortcutChecked == false ){
          // winston.info('shortcut',app.app)
          let shortcut = await originalPath(app.path)
          if(shortcut){
            // app.path = shortcut.target
            app.original = shortcut.target
            app.isShortcutChecked = true 
          }
          

        }
        fileHistory.push(app)
      }catch(e){
      //  winston.info(e,'asddsasad') 
      }
      }
      if(needUpdate){
        winston.info(' need to update')
         await db.clear('apps')
          winston.info(`${fileHistory.length} cleared apps`)

          await db.set('apps',fileHistory)

            
            winston.info(`${fileHistory.length} apps set after update`)
            getTopFive()
          
          
         
        

      }
  winston.info('nothing changed')

}catch(e){
  winston.info(e)
}
}

 async function getTopFive(){
  try{
    let apps = await  db.get('apps')
    let tops = apps.sort((a,b)=>{return parseInt(a.counter) < parseInt(b.counter) ? 1:-1}).splice(0,5)
      // winston.info(tops,'inja !')

      let dbTops = await db.get('tops')
      winston.info(`dbTops ${dbTops.length}`)
      if(dbTops.length == undefined){
        await db.clear('tops')
        await db.set('tops',tops)
      }
      
      let topChanges = await hasTopAppsChanged(tops,dbTops)
      if(topChanges.hasChanged == true){
        winston.info('avaz shode')
        // winston.info(tops)
        // winston.info(tops)
        await db.clear('tops')
        await db.set('tops',tops)
        removeOldTopsFromDesktop(dbTops)
        addToDesktop(tops)
        
        
      }    
    
  }catch(e){
    winston.info(`${e} get top five`)
  }

}

function addToDesktop(tops){
  let desktop = path.join(require('os').homedir(), 'Desktop')
  // winston.info(desktop,'desk')
  for(let i = 0;i < tops.length;i++){
    try{
      let app = tops[i]
      let destination = desktop+'\\'+app.name
      // winston.info(app.path,'top')
      let isThere = fs.existsSync(destination)
      // winston.info(isThere)
      if(!isThere){
        winston.info(`${destination},${app.path}`)
        fs.linkSync(app.path,destination)
        // exec(`mklink /H "${destination}" "${app.path}"`,(error,stdout,stderr)=>{
        //   if (error) {
        //     console.error(`exec error: ${error}`);
        //     return;
        //   }
        //   winston.info(`stdout: ${stdout}`);
        //   winston.info(`stderr: ${stderr}`);
        // })
        // fs.symlinkSync(app.path,destination)
        // fse.ensureSymlinkSync(app.path,destination)
      }
    }catch(e){
      winston.info(`${e} addTo`)
    }
    

  }
  return true
}
function removeOldTopsFromDesktop(tops){
  let desktop = path.join(require('os').homedir(), 'Desktop')
  // winston.info('remoev tops',tops)
  for(let i = 0;i < tops.length;i++){
    try{

      let app = tops[i]
      let destination = desktop+'/'+app.name
// winston.info('remoev tops',destination)
      fs.unlinkSync(destination)
    
      
    }catch(e){
      winston.info(`${e} remove`)
    }
    

  }
}

const init =async (path)=>{
  try{
winston.info(`${path} init ---------------------------`)
  
  let fileHistory = []
  fs.readdir(path, (err, files) => {
    files.forEach(file => {
      let dir = path+'\\'+file
      let status = fs.lstatSync(dir)
      let lastAccess = status.atimeMs
      let isShortcutChecked = false
      fileHistory.push({app:file,atime:lastAccess,counter:0,path:dir,isShortcutChecked:isShortcutChecked,name:file})

    });
     db.set('apps',fileHistory)
  })
}catch(e){
  winston.info(`${e} init watcher`)
}
}
const originalPath = (path)=>{
  return new Promise((resolve,reject)=>{
    ws.query(path, (err,result)=>{
       if(err) reject({err:err,target:path})
       resolve(result)
    });
  })
}
const hasTopAppsChanged = (tops,dbTops) => {
  tops = JSON.stringify(tops)
  dbTops = JSON.stringify(dbTops)
  if(tops == dbTops){
    return {hasChanged : false}
  }
  return {hasChanged : true}
}
const hasAppsDB = async ()=>{
  let apps = await db.get('apps')
  if(apps.length > 0){
    return {success:true}
  }
  return {success:false}
}
module.exports = {
  init,watch,originalPath,hasAppsDB
}