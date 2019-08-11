/*
 * This file contains functions to parser the 'Hardware.xml' file contained in every manufacturer directory
 */

import sax from 'sax'
import fs from 'fs'
import util from 'util'

/*
 * The class below can be used to resolve ETS product reference IDs into the corresponding names
 */
export default class ProductInformationParser {
  constructor (projectContext) {
    // The directory the project was extracted to
    this.projectContext = projectContext

    // This list is used to store the list of hardware information file
    this.hardwareInformationFiles = []

    /* **** Call all functions needed for initialization **** */
    return this.getHardwareInformationFiles()
  }

  // This function converts a String to Bool ("true" => true, "false" => false, "enabled" => true, ...)
  strBool (str) {
    return Boolean(str && (str.match(/^true$/i) || str.match(/^enabled$/i) || str === '1'))
  }

  // This function gets a list of all hardware information files
  getHardwareInformationFiles () {
    try {
      // Look trough the list of names - everything starting with 'M-' is a vendor folder
      this.hardwareInformationFiles = fs.readdirSync(this.projectContext.workdir).map(name => {
        if (name.startsWith('M-')) {
          // Create the full path of the found vendor folder
          let fullName = this.projectContext.workdir + '/' + name

          // Check if the found node is a folder
          if (fs.statSync(fullName).isDirectory()) {
            // Check if the folder contains a 'Hardware.xml'
            if (fs.statSync(fullName + '/Hardware.xml').isFile()) {
              return (fullName + '/Hardware.xml')
            }
          }
        }
      }).filter(value => {
        return value || 0
      })

      // Check if anything was found
      if (this.hardwareInformationFiles.length < 1) {
        // Error - unable to find matching folders
        return Error(util.format('No vendor information was found inside the workdir (%s) !', this.projectContext.workdir))
      }

      // Return the result
    } catch (e) {
      return (e)
    }
  }

  // This function goes trough this.hardwareInformationFiles and parses all elements of it
  parseHardwareInformationFiles () {
    return new Promise(resolve => {
      for (let filename of this.hardwareInformationFiles) {
        try {
        // Create a read stream on the project.xml file
          const stream = fs.createReadStream(filename)

          // Initialize a XML parser
          const xmlParser = sax.createStream(true)

          // To keep track to witch manufacturer the current product belongs to
          let currentManufacturer

          // Used to close everything up and resolve
          const closeStreamAndResolve = (resolveValue) => {
            stream.close()
            resolve(resolveValue)
          }

          // This will be called on every new element
          xmlParser.on('opentag', (element) => {
            switch (element.name) {
              case ('Manufacturer'):
                currentManufacturer = element.attributes['RefId']

                break

              case ('Hardware'):
                // Some hardware elements have no attributes - these are uninteresting
                if (JSON.stringify(element.attributes) !== '{}') {
                  this.projectContext.project.addEntryToProductLookupTable(
                    element.attributes['Id'],
                    element.attributes['Name'],
                    parseFloat(element.attributes['BusCurrent']),
                    element.attributes['SerialNumber'],
                    this.strBool(element.attributes['IsAccessory']),
                    this.strBool(element.attributes['IsPowerSupply']),
                    this.strBool(element.attributes['IsChoke']),
                    this.strBool(element.attributes['IsCoupler']),
                    this.strBool(element.attributes['IsPowerLineRepeater']),
                    this.strBool(element.attributes['IsPowerLineSignalFilter']),
                    this.strBool(element.attributes['IsCable']),
                    this.strBool(element.attributes['IsIPEnabled']),
                    this.strBool(element.attributes['HasApplicationProgram']),
                    this.strBool(element.attributes['HasApplicationProgram2']),
                    this.strBool(element.attributes['HasIndividualAddress']),
                    element.attributes['OriginalManufacturer'],
                    currentManufacturer,
                    this.strBool(element.attributes['NoDownloadWithoutPlugin']))
                }

                break

              case ('Product'):
                this.projectContext.project.addProductToProductLookupTableEntry(
                  element.attributes['Id'],
                  element.attributes['Text'],
                  element.attributes['VisibleDescription'],
                  element.attributes['OrderNumber']
                )

                break

              case ('ApplicationProgramRef'):
                this.projectContext.project.addApplicationProgramRefIDToProductLookupTable(element.attributes['RefId'])

                break
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
        } catch (e) {
          resolve(e)
        }
      }
    })
  }
}
