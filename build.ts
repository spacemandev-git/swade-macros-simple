//load macros.db file
//load src/shooting.js file
import * as fs from 'fs';

let macrosdb = fs.readFileSync("packs/macros.db").toString().split('\n').map( (line) => {
  return JSON.parse(line)
})
//Shooting Macro
macrosdb[0]['command'] = fs.readFileSync('src/shooting.js').toString()

//clear file
fs.writeFileSync('packs/macros.db', '')
macrosdb.map( (object) => {
  fs.appendFileSync('packs/macros.db',JSON.stringify(object))
})

