/*
 * This file contains functions to get information for a KNX Device Application Name <--> ID lookup table from device application information files
 * These are found like this:
 *    path/to/extracted/project/M-[MANUFACTURER_ID]/M-[MANUFACTURER_ID]_A-*.xml
 *
 * e.g.:
 *    workdir/M-0083/M-0083_A-000D-11-501B.xml
 */

import sax from 'sax'
import fs from 'fs'
import util from 'util'

/*
 * The class below can be used to resolve ETS product reference IDs into the corresponding names
 */
export default class ApplicationInformationParser {
  constructor (projectContext) {
    // The directory the project was extracted to
    this.projectContext = projectContext

    // Set the file path
    this.knxApplicationInformationFiles = []

    /* **** Call all functions needed for initialization **** */
    return this.getApplicationInformationFiles()
  }

  // This function finds all application information files
  getApplicationInformationFiles () {
    try {
      let vendorFolders = []

      const getVendorFolders = () => {
        // First, search all vendor folders
        fs.readdirSync(this.projectContext.workdir).map(name => {
          if (name.startsWith('M-')) {
            // Create the full path of the found vendor folder
            let fullName = this.projectContext.workdir + '/' + name

            // Check if the found node is a folder
            if (fs.statSync(fullName).isDirectory()) {
              vendorFolders.push(fullName)
            }
          }
        })
      }

      const getAppInfoFiles = () => {
        for (let vendorFolder of vendorFolders) {
          // Look for all application information files in this vendor folder
          fs.readdirSync(vendorFolder).map(name => {
            if (name.startsWith('M-')) {
              // Create the full path of the found vendor folder
              let fullName = vendorFolder + '/' + name

              // Check if the found node is a folder
              if (fs.statSync(fullName).isFile()) {
                this.knxApplicationInformationFiles.push(fullName)
              }
            }
          })
        }
      }

      getVendorFolders()
      getAppInfoFiles()

      // Check if anything was found
      if (!this.knxApplicationInformationFiles || this.knxApplicationInformationFiles.length < 1) {
        // Error - unable to find matching folders
        return Error(util.format('No application information files were found inside the workdir (%s) !', this.projectContext.workdir))
      }
    } catch (e) {
      return (e)
    }
  }

  // This function goes trough this.hardwareInformationFiles and parses all elements of it
  parseApplicationInformationFiles () {
    return new Promise(resolve => {
      try {
        for (let filePath of this.knxApplicationInformationFiles) {
          // Create a read stream on the project.xml file
          const stream = fs.createReadStream(filePath)

          // Initialize a XML parser
          const xmlParser = sax.createStream(true)

          // Needed to store the ID of the current manufacturer
          let manufacturerRefID

          // Used to close everything up and resolve
          const closeStreamAndResolve = (resolveValue) => {
            stream.close()
            resolve(resolveValue)
          }

          // This will be called on every new element
          xmlParser.on('opentag', (element) => {
            switch (element.name) {
              case ('Manufacturer'):
                manufacturerRefID = element.attributes['RefId']

                break
              case ('ApplicationProgram'):
                this.projectContext.project.addEntryToApplicationProgramLookupTable(
                  element.attributes['Id'],
                  element.attributes['Name'],
                  parseInt(element.attributes['ApplicationNumber']),
                  element.attributes['ApplicationVersion'],
                  element.attributes['ProgramType'],
                  element.attributes['MaskVersion'],
                  manufacturerRefID)
            }
          })

          // This will be called when the whole stream was parsed
          xmlParser.on('end', () => {
            closeStreamAndResolve()
          })

          // This will be called on error
          xmlParser.on('error', err => {
            closeStreamAndResolve(err)
          })

          // Start the stream
          stream.pipe(xmlParser)
        }
      } catch (e) {
        resolve(e)
      }
    })
  }
}
