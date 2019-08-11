/*
 * This file contains the interface from which the parser can be used and functions to parse the '0.xml' and 'project.xml' files of the project
 * The 'knx_master.xml' is parsed in knxMasterXMLParser.js
 */

import ProjectStructure from './projectStructure'
import ParsedProject from './parsedProject'
import DecompressZip from 'decompress-zip'
import util from 'util'
import sax from 'sax'
import fs from 'fs'
import ProductInformationParser from './productInformationParser'
import KnxMasterXMLParser from './knxMasterXMLParser'
import ApplicationInformationParser from './applicationInformationParser'

const etsProjParser = async function (etsProjectFilePath, workdir) {
  // Create a function wide context
  const self = {}

  // Initialisation function
  const initEtsProjectParser = async (etsProjFilePath, workdir) => {
    self.etsProjFilePath = etsProjFilePath
    self.workdir = workdir
    self.projectFolder = null

    // The parsed project will be stored here
    self.project = new ProjectStructure()

    // Unzip the stream into workdir
    return unzip()
  }

  /* *********+********************************* */
  /* Functions that are NOT visible from outside */
  /* ******************************************* */

  // This function converts a String to Bool ("true" => true, "false" => false, "enabled" => true, ...)
  const strBool = str => {
    return Boolean(str && (str.match(/^true$/i) || str.match(/^enabled$/i) || str === '1'))
  }

  // This function unzips the stream into workdir
  const unzip = () => {
    // Create the unzipper
    const unzipper = new DecompressZip(etsProjectFilePath)

    return new Promise((resolve) => {
      // Install handlers
      unzipper.on('error', err => {
        resolve(err)
      })

      unzipper.on('extract', () => {
        resolve()
      })

      // Start the extraction process
      unzipper.extract({
        path: self.workdir
      })
    })
  }

  // This function finds the project information folder
  const findProjectInfoFolder = () => {
    try {
      // Look trough the list of names - everything starting with 'P-' is a project folder
      self.projectFolder = fs.readdirSync(workdir).map(name => {
        if (name.startsWith('P-')) {
          // Create the full path of the found node
          let fullName = workdir + '/' + name

          // Check if it is a file or a folder
          if (fs.statSync(fullName).isDirectory()) {
            // This node is valid
            return fullName
          }
        }
        /*
         * Filter out all undefined elements that resulted from items.map()
         * Only the first project folder found is used
         */
      }).filter(value => {
        return value || 0
      })[0]

      // Check if anything was found
      if (!self.projectFolder) {
        // Error - unable to find matching folders
        return Error(util.format('The file \'%s\' does not contain any projects!', etsProjectFilePath))
      }
    } catch (e) {
      return (e)
    }
  }

  // This function extracts project information from workdir/projectFolder/project.xml
  const parseProjectInformation = () => {
    return new Promise(resolve => {
      try {
        // Create a read stream on the project.xml file
        const stream = fs.createReadStream(self.projectFolder + '/project.xml')

        // Initialize a XML parser
        const xmlParser = sax.createStream(true)

        // A temporary object needed to parse project information
        let tmp = { application: undefined, version: undefined, projectID: undefined }

        // This will be called on every new element
        xmlParser.on('opentag', (element) => {
          switch (element.name) {
            case ('KNX'):
              tmp.application = element.attributes['CreatedBy']
              tmp.version = element.attributes['ToolVersion']
              break
            case ('Project'):
              tmp.projectID = element.attributes['Id']
              break
            case ('ProjectInformation'):
              self.project.addInformationToProject(
                tmp.projectID,
                element.attributes['Name'],
                tmp.application,
                tmp.version,
                element.attributes['GroupAddressStyle'],
                element.attributes['DeviceCount'],
                element.attributes['LastModified'],
                element.attributes['Comment'],
                element.attributes['CodePage'],
                element.attributes['LastUsedPuid'],
                element.attributes['Guid'],
                element.attributes['CompletionStatus'],
                element.attributes['ProjectStart'])
              break
          }
        })

        // This will be called when the whole stream was parsed
        xmlParser.on('end', () => {
          resolve()
        })

        // This will be called on error
        xmlParser.on('error', err => {
          resolve(err)
        })

        // Start the stream
        stream.pipe(xmlParser)
      } catch (e) {
        resolve(e)
      }
    })
  }

  // This function extracts the project from workdir/projectFolder/0.xml
  const parseProject = () => {
    return new Promise(resolve => {
      try {
        // Create a read stream on the 0.xml file
        const stream = fs.createReadStream(self.projectFolder + '/0.xml')

        // Initialize a XML parser
        const xmlParser = sax.createStream(true)

        // Used to close everything up and resolve
        const closeStreamAndResolve = (resolveValue) => {
          stream.close()
          resolve(resolveValue)
        }

        // This will be called on every new element
        xmlParser.on('opentag', (element) => {
          switch (element.name) {
            /* *************************************** */
            /*  Cases for the topology of the project  */
            /* *************************************** */
            case ('Area'):
              self.project.addAreaToTopology(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Address'])
              break

            case ('Line'):
              self.project.addLineToArea(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Address'],
                element.attributes['MediumTypeRefId'])
              break

            case ('UnassignedDevices'):
              // The counter function is called below (see closetag handlers)
              self.project.unassignedDevicesStart()
              break

            case ('DeviceInstance'):
              self.project.addDeviceToLine(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Description'],
                element.attributes['Comment'],
                element.attributes['Address'],
                element.attributes['SerialNumber'],
                strBool(element.attributes['ApplicationProgramLoaded']),
                strBool(element.attributes['CommunicationPartLoaded']),
                strBool(element.attributes['IndividualAddressLoaded']),
                strBool(element.attributes['ParametersLoaded']),
                strBool(element.attributes['MediumConfigLoaded']),
                element.attributes['LastModified'],
                element.attributes['LastDownload'],
                element.attributes['ProductRefId'],
                element.attributes['Hardware2ProgramRefId'],
                strBool(element.attributes['IsCommunicationObjectVisibilityCalculated']),
                parseInt(element.attributes['LastUsedAPDULength']),
                parseInt(element.attributes['ReadMaxAPDULength']))
              break

            case ('Security'):
              self.project.addSecurityToDevice(
                parseInt(element.attributes['SequenceNumber']),
                element.attributes['SequenceNumberTimestamp'])
              break

            case ('ParameterInstanceRef'):
              self.project.addParameterReferenceToDevice(
                element.attributes['RefId'],
                element.attributes['Value'])
              break

            case ('ComObjectInstanceRef'):
              self.project.addCommunicationReferenceToDevice(
                element.attributes['Text'],
                element.attributes['Description'],
                element.attributes['RefId'],
                element.attributes['DatapointType'],
                strBool(element.attributes['ReadFlag']),
                strBool(element.attributes['TransmitFlag']),
                strBool(element.attributes['UpdateFlag']),
                strBool(element.attributes['WriteFlag']),
                element.attributes['Priority'],
                strBool(element.attributes['IsActive']),
                element.attributes['ChannelId'])
              break

            case ('Connectors'):
              self.project.addConnectorToCommunicationReference()
              break

            case ('Send'):
              self.project.addSendToConnector(element.attributes['GroupAddressRefId'])
              break

            case ('Receive'):
              self.project.addReceiveToConnector(element.attributes['GroupAddressRefId'])
              break

              /* ******************************************** */
              /*  Cases for the building-tree of the project  */
              /* ******************************************** */
            case ('BuildingPart'):
              self.project.addBuildingPartToBuildingPart(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Type'],
                element.attributes['DefaultLine'])
              break

            case ('DeviceInstanceRef'):
              self.project.addDeviceReferenceToBuildingPart(element.attributes['RefId'])
              break

            case ('Function'):
              self.project.addFunctionToBuildingPart(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Type'])
              break

            case ('GroupAddressRef'):
              self.project.addGroupAddressReferenceToFunction(
                element.attributes['Id'],
                element.attributes['Name'],
                element.attributes['Role'],
                element.attributes['RefId'])
              break

              /* **************************************************** */
              /*  Cases for the the group address-tree of the project */
              /* **************************************************** */
            case ('GroupRange'):
              self.project.addGroupRangeToGroupRange(
                element.attributes['Id'],
                parseInt(element.attributes['RangeStart']),
                parseInt(element.attributes['RangeEnd']),
                element.attributes['Name'],
                strBool(element.attributes['Unfiltered']))
              break

            case ('GroupAddress'):
              self.project.addGroupAddressToGroupRange(
                element.attributes['Id'],
                element.attributes['Name'],
                parseInt(element.attributes['Address']),
                element.attributes['Description'],
                element.attributes['DatapointType'],
                element.attributes['Unfiltered'],
                strBool(element.attributes['Central']))
              break
          }
        })

        // This will be called when a item was closed - only needed for some items
        xmlParser.on('closetag', (element) => {
          switch (element) {
            case ('BuildingPart'):
              self.project.finishBuildingPart()
              break

            case ('GroupRange'):
              self.project.finishGroupRange()
              break

            case ('UnassignedDevices'):
              self.project.unassignedDevicesStop()
              break
          }
        })

        // This will be called on error
        xmlParser.on('error', (err) => {
          closeStreamAndResolve(err)
        })

        // This will be called when the whole stream was parsed
        xmlParser.on('end', () => {
          closeStreamAndResolve()
        })

        // Start the stream
        stream.pipe(xmlParser)
      } catch (e) {
        resolve(e)
      }
    })
  }

  /* *************************************** */
  /* Functions that are visible from outside */
  /* *************************************** */

  // This function starts the parse process
  const parse = async (parseDeviceApplicationInformation) => {
    let err

    if ((err = await findProjectInfoFolder())) { return err }
    if ((err = await parseProjectInformation())) { return err }
    if ((err = await parseProject())) { return err }
    if ((err = await new ProductInformationParser(self).parseHardwareInformationFiles())) { return err }
    if ((err = await new KnxMasterXMLParser(self).parseKNXMasterFile())) { return err }

    // Device application information parsing can be turned off since it can take +30 seconds for large projects
    if (parseDeviceApplicationInformation) {
      if ((err = await new ApplicationInformationParser(self).parseApplicationInformationFiles())) {
        return err
      }
    }
    return new ParsedProject(self.project.project).project
  }

  /* *************************************** */
  /* *************************************** */

  // Call the init function
  let ret = await initEtsProjectParser(etsProjectFilePath, workdir)

  // Return functions/vars that should be public
  return ret || parse
}

export default etsProjParser
