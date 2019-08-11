import _ from 'lodash'

/*
 * This class contains the structure of the parsed project and functions to add data to it
 * Functions to work with the parsed project are added in 'parsedProject.js'
 */
export default class {
  constructor () {
    this.project = {
      projectInformation: {
        ID: undefined,
        name: undefined,
        etsVersion: { application: undefined, version: undefined },
        groupAddressStyle: undefined,
        deviceCount: undefined,
        lastModified: undefined,
        comment: undefined,
        codePage: undefined,
        lastUsedPuid: undefined,
        GUID: undefined,
        completionStatus: undefined,
        projectStart: undefined
      },
      topology: {
        areas: [],
        unassignedDevices: []
      },
      buildings: [],
      groupAddresses: {
        groupRanges: []
      },
      /*
       * Lookup tables for several things
       */
      productLookupTable: [],
      manufacturerLookupTable: [],
      datapointLookupTable: [],
      mediumTypeLookupTable: [],
      deviceApplicationLookupTable: [],
      deviceMaskversionLookupTable: []
    }

    // This is needed to track how for to get into the buildings[] array and its sub-arrays when adding a building part
    this.currentBuildingDepth = -1

    // This is needed to track how for to get into the groupAddresses[] array and its sub-arrays when adding a groupRange
    this.currentGroupRangeDepth = -1

    // This is needed when adding devices to keep track if the current device is assigned to a line or not
    this.comingDevicesAssigned = true
  }

  // This function adds project information to the project
  addInformationToProject (ID, name, applicationName, applicationVersion, groupAddressStyle, deviceCount, lastModified,
    comment, codePage, lastUsedPuid, GUID, completionStatus, projectStart) {
    this.project.projectInformation.ID = ID
    this.project.projectInformation.name = name
    this.project.projectInformation.etsVersion.application = applicationName
    this.project.projectInformation.etsVersion.version = applicationVersion
    this.project.projectInformation.groupAddressStyle = groupAddressStyle
    this.project.projectInformation.deviceCount = deviceCount
    this.project.projectInformation.lastModified = lastModified
    this.project.projectInformation.comment = comment
    this.project.projectInformation.codePage = codePage
    this.project.projectInformation.lastUsedPuid = lastUsedPuid
    this.project.projectInformation.GUID = GUID
    this.project.projectInformation.completionStatus = completionStatus
    this.project.projectInformation.projectStart = projectStart
  }

  /* ******************************************************* */
  /*  Functions that are used to work on the topology field
  /* ******************************************************* */

  // This function adds an area to the projects topology
  addAreaToTopology (ID, name, address) {
    this.project.topology.areas.push({
      ID: ID,
      name: name,
      address: address,
      lines: []
    })
  }

  // This function adds a line to the current (latest) area
  addLineToArea (ID, name, address, mediumTypeRefId) {
    _.last(this.project.topology.areas).lines.push({
      ID: ID,
      name: name,
      address: address,
      __referenceIDs: {
        mediumTypeRefID: mediumTypeRefId
      },
      devices: []
    })
  }

  // This function this.comingDevicesAssigned to false to signalize unassigned devices incoming
  unassignedDevicesStart () {
    this.comingDevicesAssigned = false
  }

  // This function reverts the effect of the above one
  unassignedDevicesStop () {
    this.comingDevicesAssigned = true
  }

  // This functions adds a device to the current (latest) line
  addDeviceToLine (ID, name, description, comment, address, serialNumber, applicationProgramLoaded,
    communicationPartLoaded, individualAddressLoaded, parametersLoaded, mediumConfigLoaded, lastModified, lastDownload,
    productReferenceId, hardware2ProgramReferenceId, isCommunicationObjectVisibilityCalculated, lastUsedAPDULength, maxReadAPDULength) {
    // Check if the devices is assigned or unassigned - figure out the correct push-target
    let target

    if (this.comingDevicesAssigned) {
      target = _.last(_.last(this.project.topology.areas).lines).devices
    } else {
      target = this.project.topology.unassignedDevices
    }

    // Push the device to its target
    target.push({
      ID: ID,
      name: name,
      description: description,
      comment: comment,
      address: address,
      communicationObjectReference: [],
      parameterReferences: [],
      security: {},
      isCommunicationObjectVisibilityCalculated: isCommunicationObjectVisibilityCalculated,
      programmingStatus: {
        serialNumber: serialNumber,
        applicationProgramLoaded: applicationProgramLoaded,
        communicationPartLoaded: communicationPartLoaded,
        individualAddressLoaded: individualAddressLoaded,
        parametersLoaded: parametersLoaded,
        mediumConfigLoaded: mediumConfigLoaded,
        lastUsedAPDULength: lastUsedAPDULength,
        maxReadAPDULength: maxReadAPDULength,
        lastModified: lastModified,
        lastDownload: lastDownload
      },
      __referenceIDs: {
        productRefID: productReferenceId,
        hardware2ProgramRefID: hardware2ProgramReferenceId
      }
    })
  }

  // This function adds security to the current (latest) device
  addSecurityToDevice (sequenceNumber, sequenceNumberTimestamp) {
    _.last(_.last(_.last(this.project.topology.areas).lines).devices).security = {
      sequenceNumber: sequenceNumber,
      sequenceNumberTimestamp: sequenceNumberTimestamp
    }
  }

  // This function adds a parameter reference to the current (latest) device
  addParameterReferenceToDevice (referenceID, parameterValue) {
    _.last(_.last(_.last(this.project.topology.areas).lines).devices).parameterReferences.push({
      __parameterRefID: referenceID,
      parameterValue: parameterValue
    })
  }

  // This function adds a communication reference to the current (latest) device
  addCommunicationReferenceToDevice (text, description, referenceID, datapointType, readFlag, transmitFlag, updateFlag, writeFlag, priority, isActive, channelID) {
    _.last(_.last(_.last(this.project.topology.areas).lines).devices).communicationObjectReference.push({
      __communicationObjecRefID: referenceID,
      text: text,
      description: description,
      datapointType: datapointType,
      readFlag: readFlag,
      transmitFlag: transmitFlag,
      updateFlag: updateFlag,
      writeFlag: writeFlag,
      priority: priority,
      isActive: isActive,
      channelID: channelID,
      connectors: []
    })
  }

  // This function adds a connector to the current (latest) communication reference
  addConnectorToCommunicationReference () {
    // Connectors can contain receive and send objects, will be added by another function
    _.last(_.last(_.last(_.last(this.project.topology.areas).lines).devices).communicationObjectReference)
      .connectors.push({
        send: [],
        receive: []
      })
  }

  // This function adds a send object to the current (latest) connector
  addSendToConnector (groupAddressReferenceID) {
    _.last(_.last(_.last(_.last(_.last(this.project.topology.areas).lines).devices).communicationObjectReference).connectors).send.push({
      __groupAddressRefID: groupAddressReferenceID
    })
  }

  // This function adds a receive object to the current (latest) connector
  addReceiveToConnector (groupAddressReferenceID) {
    _.last(_.last(_.last(_.last(_.last(this.project.topology.areas).lines).devices).communicationObjectReference).connectors).receive.push({
      __groupAddressRefID: groupAddressReferenceID
    })
  }

  /* ******************************************************** */
  /*  Functions that are used to work on the buildings array  */
  /* ******************************************************** */

  /*
   * This function gets the current building part from the buildings array (this.currentBuildingDepth must be correctly set)
   *
   * The getArrayFlag decides if the function should the current building part (false) or the buildingsParts array of
   * the current building part
   *
   * This flag will have no effect when there are currently no parts added to the buildings array - which will be
   * returned in that case
   */
  getCurrentBuildingPart (getArrayFlag) {
    // Get the first ('top-level') element of the buildings structure and the wayToGo (depth-counter)
    let currentBuildingPart = _.last(this.project.buildings)
    let wayToGo = this.currentBuildingDepth

    // Check if the buildings array has any elements
    if (!currentBuildingPart) {
      return this.project.buildings
    }

    // Dig deeper and deeper until the maximum depth is reached
    while (wayToGo > 0) {
      // Decrease way to go
      wayToGo--

      // Go one level deeper
      currentBuildingPart = _.last(currentBuildingPart.buildingParts)
    }

    // Reached maximum depth - return the buildingParts array of the current building part
    return getArrayFlag ? currentBuildingPart.buildingParts : currentBuildingPart
  }

  /*
   * This function adds a building part to the current building part (according to this.currentBuildingDepth)
   * If there are no building parts in the buildings array, the part will be added to it
   * If the new building part to be added has the type 'Building', it will be directly appended to the project.buildings
   * array instead of being appended to the buildingParts array of the current element
   */
  addBuildingPartToBuildingPart (ID, name, type, defaultLine) {
    // Get the correct push-target
    let target

    if (type === 'Building') {
      target = this.project.buildings
    } else {
      target = this.getCurrentBuildingPart(true)
    }

    // Get the buildingParts array of the current building part
    target.push({
      ID: ID,
      name: name,
      type: type,
      defaultLine: defaultLine,
      deviceReferences: [],
      functions: [],
      buildingParts: []
    })

    // Increase the depth since one element was added
    this.currentBuildingDepth++
  }

  // This function finishes the current building part - this is needed to keep track of where to add new building parts
  finishBuildingPart () {
    // Step one back - decrease the depth to one level above the current one
    this.currentBuildingDepth--
  }

  // This function adds a device reference to the current building part
  addDeviceReferenceToBuildingPart (referenceID) {
    this.getCurrentBuildingPart(false).deviceReferences.push({ __deviceRefID: referenceID })
  }

  // This function adds a function to the current building part
  addFunctionToBuildingPart (ID, name, type) {
    this.getCurrentBuildingPart(false).functions.push({
      ID: ID,
      name: name,
      type: type,
      groupAddressReferences: []
    })
  }

  // This function adds group address references to the current function
  addGroupAddressReferenceToFunction (ID, name, role, referenceID) {
    _.last(this.getCurrentBuildingPart(false).functions).groupAddressReferences.push({
      ID: ID,
      name: name,
      role: role,
      __groupAddressRefID: referenceID
    })
  }

  /* **************************************************** */
  /*  Functions used to work on the groupAddresses field  */
  /* **************************************************** */

  /*
   * This function gets the current group range from the groupAddresses array (this.currentGroupRangeDepth must be correctly set)
   *
   * The getArrayFlag decides if the function should the current building part (false) or the buildingsParts array of
   * the current building part
   *
   * This flag will have no effect when there are currently no parts added to the groupAddresses array - which will be
   * returned in that case
   */
  getCurrentGroupRange (getArrayFlag) {
    // Get the first ('top-level') element of the buildings structure and the wayToGo (depth-counter)
    let currentGroupRange = _.last(this.project.groupAddresses.groupRanges)
    let wayToGo = this.currentGroupRangeDepth

    // Check if the groupRanges array has any elements
    if (!currentGroupRange) {
      return this.project.groupAddresses.groupRanges
    }

    // Dig deeper and deeper until the maximum depth is reached
    while (wayToGo > 0) {
      // Decrease way to go
      wayToGo--

      // Go one level deeper
      currentGroupRange = _.last(currentGroupRange.groupRanges)
    }

    // Reached maximum depth - return the groupRanges array of the current group range
    return getArrayFlag ? currentGroupRange.groupRanges : currentGroupRange
  }

  /*
   * This function adds a group range to the current group range (according to this.currentGroupRangeDepth)
   * If there are no group ranges in the groupAddresses array, the group range will be added to it
   */
  addGroupRangeToGroupRange (ID, rangeStart, rangeEnd, name, passTroughLineCoupler) {
    // Check if the parent GroupRange has it passTroughLineCoupler set to 'true' - if so, set the current one to true
    if (this.getCurrentGroupRange(false).passTroughLineCoupler) {
      passTroughLineCoupler = true
    }

    // Get the groupRanges array of the current group range
    this.getCurrentGroupRange(true).push({
      ID: ID,
      name: name,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      passTroughLineCoupler: passTroughLineCoupler,
      groupAddresses: [],
      groupRanges: []
    })

    // Increase the depth since one element was added
    this.currentGroupRangeDepth++
  }

  // This function finishes the group range - this is needed to keep track of where to add new group ranges
  finishGroupRange () {
    // Step one back - decrease the depth to one level above the current one
    this.currentGroupRangeDepth--
  }

  // This function adds a GroupAddress to the current (latest) group range
  addGroupAddressToGroupRange (ID, name, address, description, datapointType, passTroughLineCoupler, centralFlag) {
    this.getCurrentGroupRange(false).groupAddresses.push({
      ID: ID,
      name: name,
      address: address,
      description: description,
      datapointType: datapointType,
      passTroughLineCoupler: this.getCurrentGroupRange(false).passTroughLineCoupler,
      centralFlag: centralFlag
    })
  }

  /* **************************************************** */
  /*  Functions used to work on the product lookup table  */
  /* **************************************************** */

  /*
   * This function adds an entry to the product lookup table
   * This entry does not represent a single device but a device family
   * It contains names and IDs of all devices belonging to this family (products[])
   * When performing a lookup, the products array will be removed + ID and name are to be set to the values of the single product
   */
  addEntryToProductLookupTable (ID, name, busCurrent, serialNumber, isAccessory, isPowerSupply, isChoke, isCoupler, isPowerLineRepeater,
    isPowerLineSignalFilter, isCable, isIPEnabled, hasApplicationProgram1, hasApplicationProblem2, hasIndividualAddress,
    originalManufacturer, manufacturer, noDownloadWithoutPlugin) {
    this.project.productLookupTable.push({
      ID: ID,
      name: name,
      busCurrent: busCurrent,
      serialNumber: serialNumber,
      // All contained products share these attributes
      products: [],
      flags: {
        isAccessory: isAccessory,
        isPowerSupply: isPowerSupply,
        isChoke: isChoke,
        isCoupler: isCoupler,
        isPowerLineRepeater: isPowerLineRepeater,
        isPowerLineSignalFilter: isPowerLineSignalFilter,
        isCable: isCable,
        isIPEnabled: isIPEnabled,
        hasApplicationProgram1: hasApplicationProgram1,
        hasApplicationProgram2: hasApplicationProblem2,
        hasIndividualAddress: hasIndividualAddress,
        noDownloadWithoutPlugin: noDownloadWithoutPlugin
      },
      __referenceIDs: {
        originalManufacturerRefID: originalManufacturer,
        manufacturerRefID: manufacturer,
        applicationProgramRefID: undefined
      }
    })
  }

  // This function adds the ApplicationProgramRef reference ID to the current (latest) product table entry
  addApplicationProgramRefIDToProductLookupTable (applicationProgramRefID) {
    _.last(this.project.productLookupTable).__referenceIDs.applicationProgramRefID = applicationProgramRefID
  }

  // This function adds a product to the current (latest) product lookup table entry
  addProductToProductLookupTableEntry (ID, text, visibleDescription, orderNumber) {
    _.last(this.project.productLookupTable).products.push({
      ID: ID,
      text: text,
      visibleDescription: visibleDescription,
      orderNumber: orderNumber
    })
  }

  /* ********************************************************* */
  /*  Functions used to work on the manufacturer lookup table  */
  /* ********************************************************* */

  // This function adds a vendor to the vendor lookup table
  addManufacturerToManufacturerLookupTable (ID, manufacturerID, manufacturerName) {
    this.project.manufacturerLookupTable.push({
      ID: ID,
      KNXmanufacturerID: manufacturerID,
      manufacturerName: manufacturerName
    })
  }

  /* ****************************************************** */
  /*  Functions used to work on the datapoint lookup table  */
  /* ****************************************************** */

  // This function adds a datapoint type to the datapoint lookup table
  addDatapointTypeToDatapointLookupTable (ID, dptNumber, dptName, dptText, dptSizeInBit) {
    this.project.datapointLookupTable.push({
      ID: ID,
      dptNumber: dptNumber,
      dptName: dptName,
      dptText: dptText,
      dptSizeInBit: dptSizeInBit,
      datapointSubtypes: []
    })
  }

  // This function adds a sub-type to the current (latest) datapoint type entry
  addDatapointSubTypeToDatapointType (ID, subDptNumber, subDptName, subDptText) {
    _.last(this.project.datapointLookupTable).datapointSubtypes.push({
      ID: ID,
      subDptNumber: subDptNumber,
      subDptName: subDptName,
      subDptText: subDptText
    })
  }

  /* ******************************************************** */
  /*  Functions used to work on the medium type lookup table  */
  /* ******************************************************** */

  // This functions adds a medium type to the medium type lookup table
  addMediumTypeToMediumTypeLookupTable (ID, number, name, text, domainAddressLength) {
    this.project.mediumTypeLookupTable.push({
      ID: ID,
      number: number,
      name: name,
      text: text,
      domainAddressLength: domainAddressLength
    })
  }

  /* *************************************************************** */
  /*  Functions used to work on the device application lookup table  */
  /* *************************************************************** */

  // This function adds an entry to the applicationProgramLookupTable
  addEntryToApplicationProgramLookupTable (applicationID, applicationName, applicationNumber, applicationVersion, applicationProgramType, maskVersion, manufacturerRefID) {
    this.project.deviceApplicationLookupTable.push({
      ID: applicationID,
      name: applicationName,
      number: applicationNumber,
      version: applicationVersion,
      programType: applicationProgramType,
      maskVersion: maskVersion,
      __manufacturerRefID: manufacturerRefID
    })
  }

  /* *************************************************************** */
  /*  Functions used to work on the device maskversion lookup table  */
  /* *************************************************************** */

  // This functions adds a maskversion to the deviceMaskversionLookupTable
  addEntryToDeviceMaskversionLookupTable (ID, maskVersion, name, managementModel, mediumTypeRefID, otherMediumTypeRefID) {
    this.project.deviceMaskversionLookupTable.push({
      ID: ID,
      maskVersion: maskVersion,
      name: name,
      managementModel: managementModel,
      unloadedIndividualAddress: undefined,
      maxIndividualAddress: undefined,
      maxGroupAddress: undefined,
      __mediumTypeRefID: mediumTypeRefID,
      __otherMediumTypeRefID: otherMediumTypeRefID,
      resources: [],
      compatibleMaskVersionIDs: []
    })
  }

  // This function adds a compatible maskversion ID to the current (last) maskversion entry
  addCompatibleMaskversionIDToMaskversionEntry (ID) {
    _.last(this.project.deviceMaskversionLookupTable).compatibleMaskVersionIDs.push(ID)
  }

  // This function adds the unloaded individual address to the current (last) maskversion entry
  addUnloadedIndividualAddressToMaskversionEntry (unloadedIndividualAddress) {
    _.last(this.project.deviceMaskversionLookupTable).unloadedIndividualAddress = unloadedIndividualAddress
  }

  /*
   * This function adds the maximal (highest) individual address possible to the current (last) maskversion entry
   * (The highest individual address usable for devices with this maskversion)
   */
  addMaxIndividualAddressToMaskversionEntry (maxIndividualAddress) {
    _.last(this.project.deviceMaskversionLookupTable).maxIndividualAddress = maxIndividualAddress
  }

  /*
   * This function adds the maximal (highest) group address possible to the current (last) maskversion entry
   * (The highest group address usable for devices with this maskversion)
   */
  addMaxGroupAddressToMaskversionEntry (maxGroupAddress) {
    _.last(this.project.deviceMaskversionLookupTable).maxGroupAddress = maxGroupAddress
  }

  // This function adds a resource to the current (last) entry of the deviceMaskversionLookupTable
  addResourceToMaskversionEntry (name, access) {
    _.last(this.project.deviceMaskversionLookupTable).resources.push({
      name: name,
      access: access,
      addressSpace: undefined,
      startAddress: undefined,
      ptrResource: undefined, // Only if addrSpace === "Pointer"
      interfaceObjectRef: undefined, // Only if addressSpace === "SystemProperty"
      propertyID: undefined, // Only if addressSpace === "SystemProperty"
      occurrence: undefined,
      length: undefined,
      flavour: undefined,
      readRights: undefined,
      writeRights: undefined
    })
  }

  // This function adds location information to the current (last) resource entry
  addLocationInformationToResource (addressSpace, startAddress, ptrResource, interfaceObjectRef, propertyID, occurrence) {
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).addressSpace = addressSpace
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).startAddress = startAddress
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).ptrResource = ptrResource
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).interfaceObjectRef = interfaceObjectRef
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).propertyID = propertyID
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).occurrence = occurrence
  }

  // This function adds information about the resource type of the current (last) resource entry
  addResourceTypeInformationToResource (length, flavour) {
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).length = length
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).flavour = flavour
  }

  // This function adds access rights information to the resource type of the current (last) resource entry
  addAccessRightInformationToResource (readRights, writeRights) {
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).readRights = readRights
    _.last(_.last(this.project.deviceMaskversionLookupTable).resources).writeRights = writeRights
  }
}
