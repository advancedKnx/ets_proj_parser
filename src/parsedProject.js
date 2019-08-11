/*
 * This functions stores the parsed project as in defined in 'projectStructure.js' and provides helper functions to work with it
 */

import fs from 'fs'

export default class {
  constructor (project) {
    // This is a helper function to get a field of a JSON object by its key - key = [Key, Subkey, SubSubKey, ...]
    const getValByKey = (source, key) => {
      const sourceCopy = JSON.parse(JSON.stringify(source))
      let retVal

      if (key && key.constructor === Array) {
        retVal = sourceCopy[key[0]]

        for (let currentKey of key.slice(1)) {
          // Check if the retVal exists to prevent accessing undefined.foo
          if (!retVal) {
            break
          }

          retVal = retVal[currentKey]
        }
      } else {
        retVal = sourceCopy[key]
      }

      return retVal
    }

    /*
     * Set the project - DO NOT ACCESS THIS DIRECTLY
     * SOME DATA, FOR EXAMPLE ADDRESSES IN THE TOPOLOGY TREE, WILL BE 'REPAIRED/REFORMATTED' WHEN THE CORRESPONDING
     * GETTER IS CALLED - DIRECTLY ACCESSING THIS DATA WILL LEAD TO INVALID RESULTS
     */
    this.project = project

    // Function to export the project into a JSON file (without functions)
    this.project.exportToJson = (outputFile) => {
      return fs.writeFileSync(outputFile, JSON.stringify(this.project, null, 4))
    }

    // Function to get general project information
    this.project.getProjectInformation = () => {
      return this.project.projectInformation
    }

    /* ************************************************************************ */
    /* Functions to get information from the projects topology and its elements */

    // Get all areas of the projects topology (Ret: Array)
    this.project.getAreas = () => { return this.project.topology.areas }

    // Get an area by a key and its value (Ret: Array)
    this.project.getAreaByKey = (key, value) => {
      return this.project.topology.areas.filter(a => {
        if (getValByKey(a, key) === value) { return a }
      })
    }

    // Get all lines of the projects topology (Ret: Array)
    this.project.getLines = () => {
      let lines = []

      // Iterate over all areas and collect their lines
      for (let a of this.project.getAreas()) {
        lines = lines.concat(a.lines)
      }

      // Return lines
      return lines
    }

    // Get a line by a key and its value (Ret: Array)
    this.project.getLineByKey = (key, value) => {
      return this.project.getLines().filter(l => {
        if (getValByKey(l, key) === value) { return l }
      })
    }

    // Get all unassigned devices of the projects topology (Ret: Array)
    this.project.getUnassignedDevices = () => { return this.project.topology.unassignedDevices }

    // Get an unassigned device by a key and its value (Ret: Array)
    this.project.getUnassignedDeviceByKey = (key, value) => {
      return this.project.getUnassignedDevices().filter(ud => {
        if (getValByKey(ud, key) === value) { return ud }
      })
    }

    // Get all devices of the project topology (Ret: Array)
    this.project.getDevices = () => {
      let devices = []

      // Iterate over all lines and collect their devices
      for (let l of project.getLines()) {
        // Append the current device to the devices array
        devices = devices.concat(l.devices)
      }

      // Return devices
      return devices
    }

    // Get a device by a key and its value (Ret: Array)
    this.project.getDeviceByKey = (key, value) => {
      return this.project.getDevices().filter(d => {
        if (getValByKey(d, key) === value) { return d }
      })
    }

    /* ************************************************************************* */
    /* Functions to get information from the projects buildings and its elements */

    /* Get all buildings of the buildings array (Ret: Array)
     * ATTENTION: Each building part will be returned without its buildingParts array
     * The keepBuildingPartsSubarray option controls this - false/undefined -> subarrays deleted; true -> kept
     */
    this.project.getBuildingParts = keepBuildingPartsSubarray => {
      // Use some recursive stuff to get all the building parts
      const goTroughBuildingParts = (currentBuildingParts) => {
        let retVal = currentBuildingParts

        // Check if there are following building parts or if this is the last one
        for (let currentBuildingPart of currentBuildingParts) {
          if (currentBuildingPart.buildingParts && currentBuildingPart.buildingParts.length > 0) {
            retVal = retVal.concat(goTroughBuildingParts(currentBuildingPart.buildingParts))
          }
        }

        return retVal
      }

      // Get the building parts
      let buildingParts = goTroughBuildingParts(this.project.buildings)

      // Check if subarrays need to be deleted or not
      if (keepBuildingPartsSubarray) {
        return buildingParts
      } else {
        return buildingParts.map(buildingPart => {
          // Destroy the reference from buildingPart to this.project.buildings
          buildingPart = JSON.parse(JSON.stringify(buildingPart))

          // Delete the array and return the element
          delete buildingPart.buildingParts
          return buildingPart
        })
      }
    }

    // Get a building by a key and its value (Ret: Array)
    this.project.getBuildingPartByKey = (key, value) => {
      return this.project.getBuildingParts(true).filter(b => {
        if (getValByKey(b, key) === value) { return b }
      })
    }

    // Gets all functions contained in the buildings structure (Ret: Array)
    this.project.getFunctions = () => {
      let functions = []

      for (let buildingPart of this.project.getBuildingParts(false)) {
        if (buildingPart.functions && buildingPart.functions.length > 0) {
          functions = functions.concat(buildingPart.functions)
        }
      }

      return functions
    }

    // Gets a function by a key and its value (Ret: Array)
    this.project.getFunctionByKey = (key, value) => {
      return this.project.getFunctions().filter(f => {
        if (getValByKey(f, key) === value) { return f }
      })
    }

    /* ****************************************************************************** */
    /* Functions to get information from the projects groupAddresses and its elements */

    /*
     * Get all group addresses from this.project.groupAddresses
     * Works similar to this.project.buildings.getBuildingParts()
     */
    this.project.getGroupAddresses = () => {
      // Use some recursive stuff to get all group addresses
      const goTroughGroupRanges = (groupRanges) => {
        let retVal = []

        for (let currentGroupRange of groupRanges) {
          if (currentGroupRange.groupRanges && currentGroupRange.groupRanges.length > 0) {
            retVal = retVal.concat(goTroughGroupRanges(currentGroupRange.groupRanges))
          }

          // Add the group addresses of the currentGroupRange to retVal
          retVal = retVal.concat(currentGroupRange.groupAddresses)
        }

        return retVal
      }

      // Get and return the building parts
      return goTroughGroupRanges(this.project.groupAddresses.groupRanges)
    }

    // Get a groupAddress by a key and its value (Ret: Array)
    this.project.getGroupAddressByKey = (key, value) => {
      return this.project.getGroupAddresses().filter(ga => {
        if (getValByKey(ga, key) === value) { return ga }
      })
    }

    /* ********************************************************** */
    /* Functions to get information from the product lookup table */

    // Get all product families (Ret: Array)
    this.project.getProductFamilies = () => {
      return this.project.productLookupTable
    }

    // Get a product family by a key and its value (Ret: Array)
    this.project.getProductFamilyByKey = (key, value) => {
      return this.project.productLookupTable.filter(pf => {
        if (getValByKey(pf, key) === value) { return pf }
      })
    }

    // Get all products (Ret: Array)
    this.project.getProducts = () => {
      let retVal = []
      let tmpVal

      for (let currentProductFamily of this.project.getProductFamilies()) {
        for (let currentProduct of currentProductFamily.products) {
          // Copy the currentProduct without leaving a reference to the original, then insert productFamily information
          tmpVal = JSON.parse(JSON.stringify(currentProduct))
          tmpVal.productFamilyInformation = JSON.parse(JSON.stringify(currentProductFamily))

          // Delete the products array from productFamilyInformation
          delete tmpVal.productFamilyInformation.products

          // Append it to retVal[]
          retVal.push(tmpVal)
        }
      }

      return retVal
    }

    // Get a product by a key and its value (Ret: Array)
    this.project.getProductByKey = (key, value) => {
      return this.project.getProducts().filter(p => {
        if (getValByKey(p, key) === value) { return p }
      })
    }

    /* *************************************************************** */
    /* Functions to get information from the manufacturer lookup table */

    // Get all manufacturers (Ret: Array)
    this.project.getManufacturers = () => {
      return this.project.manufacturerLookupTable
    }

    // Get a manufacturer by a key and its value (Ret: Array)
    this.project.getManufacturerByKey = (key, value) => {
      return this.project.getManufacturers().filter(m => {
        if (getValByKey(m, key) === value) { return m }
      })
    }

    /* ***************************************************************** */
    /* Functions to get information from the datapoint type lookup table */

    // Get all datapoint types (Ret: Array)
    this.project.getDatapointTypes = () => {
      return this.project.datapointLookupTable
    }

    // Get a datapoint type by a key and its value (Ret: Array)
    this.project.getDatapointTypeByKey = (key, value) => {
      return this.project.getDatapointTypes().filter(dpt => {
        if (getValByKey(dpt, key) === value) { return dpt }
      })
    }

    // Get all datapoint sub-types (Ret: Array)
    this.project.getDatapointSubTypes = () => {
      let dptSubTypes = []
      let tmp

      for (let currentDPT of this.project.getDatapointTypes()) {
        for (let currentSubDPT of currentDPT.datapointSubtypes) {
          tmp = JSON.parse(JSON.stringify(currentSubDPT))

          // Add the parent DPT and delete its subDPT array
          tmp.parentDPT = JSON.parse(JSON.stringify(currentDPT))
          delete tmp.parentDPT.datapointSubtypes

          // Append tmp to dptSubTypes
          dptSubTypes.push(tmp)
        }
      }

      // Return the result
      return dptSubTypes
    }

    // Get a datapoint sub-type by a key and its value (Ret: Array)
    this.project.getDatapointSubTypeByKey = (key, value) => {
      return this.project.getDatapointSubTypes().filter(subDPT => {
        if (getValByKey(subDPT, key) === value) {
          return subDPT
        }
      })
    }

    /* ************************************************************** */
    /* Functions to get information from the medium type lookup table */

    // Get all medium types (Ret: Array)
    this.project.getMediumTypes = () => {
      return this.project.mediumTypeLookupTable
    }

    // Get a medium type by a key and its value (Ret: Array)
    this.project.getMediumTypeByKey = (key, value) => {
      return this.project.getMediumTypes().filter(mt => {
        if (getValByKey(mt, key) === value) { return mt }
      })
    }

    /* ************************************************************** */
    /* Functions to get information from the medium type lookup table */

    // Get all application program information (Ret: Array)
    this.project.getDeviceApplicationInformation = () => {
      return this.project.deviceApplicationLookupTable
    }

    // Get a application information entry by a key and its value (Ret: Array)
    this.project.getDeviceApplicationInformationByKey = (key, value) => {
      return this.project.getDeviceApplicationInformation().filter(dai => {
        if (getValByKey(dai, key) === value) { return dai }
      })
    }

    /* ************************************************************** */
    /* Functions to get information from the maskversion lookup table */

    // Get all mask versions (Ret: Array)
    this.project.getMaskversions = () => {
      return this.project.deviceMaskversionLookupTable
    }

    // Get a maskversion entry by a key and its value (Ret: Array)
    this.project.getMaskversionByKey = (key, value) => {
      return this.project.getMaskversions().filter(mav => {
        if (getValByKey(mav, key) === value) { return mav }
      })
    }

    /* ****************************************************************************************** */
    /*  This section contains preparation functions that are called when the class is initialized */
    /* ****************************************************************************************** */

    // This function resolves the addresses of the devices in the topology tree
    const topologyResolveDeviceAddresses = () => {
      // Iterate over all lines and correct the addresses of the contained devices
      for (let a of this.project.getAreas()) {
        for (let l of a.lines) {
          // Check if this address is already 'repaired' (important when importing parsed projects)
          if (l.address && l.address.length <= 1) {
            // Correct the lines address (include the address part of the parent-area)
            l.address = a.address + '.' + l.address
          }

          for (let d of l.devices) {
            // Check if this address is already 'repaired' (important when importing parsed projects)
            if (d.address && d.address.length <= 3) {
              // Correct the devices address (include the address part of the parent-line)
              d.address = l.address + '.' + d.address
            }
          }
        }
      }
    }

    /* ***************************** */
    /* Call the preparation function */
    /* ***************************** */

    topologyResolveDeviceAddresses()
  }
}
