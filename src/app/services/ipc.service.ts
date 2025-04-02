window.ipcRenderer.on('main-process-message', (_event, ...args) => {
    console.log('[Receive Main-process message]:', ...args);
});

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'
// Node Integration Example:
//
// import { lstat } from 'node:fs/promises'
// import { cwd } from 'node:process'
//
// lstat(cwd()).then(stats => {
//   console.log('[fs.lstat]', stats)
// }).catch(err => {
//   console.error(err)
// })
