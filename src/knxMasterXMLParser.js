/*
 * This file contains functions to parse the 'knx_master.xml' file
 * 'project.xml' and '0.xml' are parsed in 'etsProjParser.xml'
 */

import sax from 'sax'
import fs from 'fs'

/*
 * The class below can be used to resolve ETS product reference IDs into the corresponding names
 */
export default class KnxMasterXMLParser {
  constructor (projectContext) {
    // The directory the project was extracted to
    this.projectContext = projectContext

    // Set the file path
    this.knxMasterXMLFile = this.projectContext.workdir + '/knx_master.xml'
  }

  // This function goes trough this.hardwareInformationFiles and parses all elements of it
  parseKNXMasterFile () {
    return new Promise(resolve => {
      try {
        // Create a read stream on the project.xml file
        const stream = fs.createReadStream(this.knxMasterXMLFile)

        // Initialize a XML parser
        const xmlParser = sax.createStream(true)

        // Needed to prevent invalid location information from being used
        let resourceLocationUnlocked = false

        // Used to close everything up and resolve
        const closeStreamAndResolve = (resolveValue) => {
          stream.close()
          resolve(resolveValue)
        }

        // This will be called on every new element
        xmlParser.on('opentag', (element) => {
          switch (element.name) {
            case ('Manufacturer'):
              this.projectContext.project.addManufacturerToManufacturerLookupTable(
                element.attributes['Id'],
                element.attributes['KnxManufacturerId'],
                element.attributes['Name'])

              break

            case ('DatapointType'):
              this.projectContext.project.addDatapointTypeToDatapointLookupTable(
                element.attributes['Id'],
                parseInt(element.attributes['Number']),
                element.attributes['Name'],
                element.attributes['Text'],
                parseInt(element.attributes['SizeInBit']))

              break

            case ('DatapointSubtype'):
              this.projectContext.project.addDatapointSubTypeToDatapointType(
                element.attributes['Id'],
                parseInt(element.attributes['Number']),
                element.attributes['Name'],
                element.attributes['Text'])

              break

            case ('MediumType'):
              this.projectContext.project.addMediumTypeToMediumTypeLookupTable(
                element.attributes['Id'],
                parseInt(element.attributes['Number']),
                element.attributes['Name'],
                element.attributes['Text'],
                parseInt(element.attributes['DomainAddressLength']))

              break

            case ('MaskVersion'):
              this.projectContext.project.addEntryToDeviceMaskversionLookupTable(
                element.attributes['Id'],
                parseInt(element.attributes['MaskVersion']),
                element.attributes['Name'],
                element.attributes['ManagementModel'],
                element.attributes['MediumTypeRefId'],
                element.attributes['OtherMediumTypeRefId'])

              break

            case ('DownwardCompatibleMask'):
              this.projectContext.project.addCompatibleMaskversionIDToMaskversionEntry(element.attributes['RefId'])
              break

            case ('Feature'):
              switch (element.attributes.Name) {
                case ('MaxIndividualAddress'):
                  this.projectContext.project.addMaxIndividualAddressToMaskversionEntry(parseInt(element.attributes['Value']))
                  break

                case ('MaxGroupAddress'):
                  this.projectContext.project.addMaxGroupAddressToMaskversionEntry(parseInt(element.attributes['Value']))
                  break

                case ('UnloadedIndividualAddress'):
                  this.projectContext.project.addUnloadedIndividualAddressToMaskversionEntry(parseInt(element.attributes['Value']))
              }

              break

            case ('Resource'):
              // Inside a resource area - location information of the current resource unlocked
              resourceLocationUnlocked = true
              this.projectContext.project.addResourceToMaskversionEntry(
                element.attributes['Name'],
                element.attributes['Access'])

              break

            case ('Location'):
              // Check if the location information of the current resource are unlocked
              if (resourceLocationUnlocked) {
                this.projectContext.project.addLocationInformationToResource(
                  element.attributes['AddressSpace'],
                  parseInt(element.attributes['StartAddress']) || undefined,
                  element.attributes['PtrResource'],
                  parseInt(element.attributes['InterfaceObjectRef']) || undefined,
                  parseInt(element.attributes['PropertyID']) || undefined,
                  parseInt(element.attributes['Occurrence']) || undefined)
              }

              break

            case ('ResourceType'):
              this.projectContext.project.addResourceTypeInformationToResource(
                parseInt(element.attributes['Length']),
                element.attributes['Flavour'])

              break

            case ('AccessRights'):
              this.projectContext.project.addAccessRightInformationToResource(
                element.attributes['Read'],
                element.attributes['Write'])
          }
        })

        xmlParser.on('closetag', (element) => {
          switch (element) {
            case ('Resource'):
              // Not in a resource area - location information of the last resource locked
              resourceLocationUnlocked = false
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
    })
  }
}
