/*
 * Contains a function to load a parsed project from a file (exported with the 'exportToJson function from 'parsedProject.js')
 * into the 'parsedProject' class
 */

import ParsedProject from './parsedProject'
import fs from 'fs'

export default pathToExportedProject => {
  return new Promise(resolve => {
    const fileContent = fs.readFileSync(pathToExportedProject)

    resolve(new ParsedProject(JSON.parse(fileContent)).project)
  })
}
