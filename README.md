# ETS-Project parser
### Parse an ETS-Project
1) Import the parser
```
import etsProjParser from './etsProjParser'
```
2) Initialize the parser
```
const retVal = await etsProjParser(pathToProjectFile, pathToWorkdir)
```
- The initialization process mainly consists of the unpacking of the project
    - ETS-Project files are simple ZIP files containing XML files
- ```pathToProjectFile``` is the path of the ETS-Project file
- ```pathToWorkdir``` is the path to the directory the project will be unpacked to
    - The directory can be deleted after parsing is done - It should be deleted before parsing another project
3) Check if the initialization succeeded
- If everything went fine, ```retVal``` will be the parser-function
- On error, ```retVal``` will be an object of the ```Error``` type
```
if (retVal.constructor === Error) {
    console.error(retVal)
    process.exit(-1)
}
```
4) Start the actual parsing project
```
const result = await retVal(parseDeviceApplicationInformation)
```
- ```parseDeviceApplicationInformation``` (```Boolean```) enables/disables parsing information about the applications running on KNX devices (See ```result.deviceApplicationLookupTable```)
- NOTE that it can take more than 30 seconds for bigger projects
5) Check if parsing the project succeeded
```
if (result.constructor === Error) {
    console.error(result)
}
```
### The structure of a parsed project
- ```result``` is the result returned from the parser
- All the values below are example values
```
result = {
    projectInformation: {
        ID: "P-05A5",
        name: "ProjectXYZ",
        groupAddressStyle: "ThreeLevel",
        deviceCount: 33,
        lastModified: "1998-02-17T15:22:02.1918306Z",
        lastUsedPuid: 1234,
        GUID: "11c2cac3-4ab4-4548-8661-667a6c387cd9",
        completionStatus: "Editing",
        projectStart: "1996-06-18T22:22:42Z",
        etsVersion: {
            application: "ETS5",
            version: "5.4.953"
        }
    },
    topology: {
        areas: [
            ..., {
                ID: "P-05A5-0_A-1",
                name: "AreaABC",
                address: "1",
                lines: [
                    ..., {
                        ID: "P-05A5-0_L-1",
                        name: "Line123",
                        address: "1.0",
                        __referenceIDs: {
                            mediumTypeRefID: "MT-0"
                        },
                        devices: [
                            ..., {
                                ID: "P-05A5-0_DI-20",
                                name: "DeviceDEF",
                                description: "Is Green",
                                address: "1.0.13",
                                isCommunicationVisibilityCalculated: true,
                                programmingStatus: {
                                    serialNumber: "ABCDEFGH",
                                    applicationProgramLoaded: true,
                                    communicationPartLoaded: true,
                                    individualAddressLoaded: true,
                                    parametersLoaded: true,
                                    mediumConfigLoaded: true,
                                    lastUsedAPDULength: 40,
                                    maxReadAPDULength: 55,
                                    lastModified: "2009-01-24T20:25:11.7929688Z",
                                    lastDownload: "2010-12-24T22:30:00.7929688Z"
                                },
                                communicationObjectReferences: [
                                    ..., {
                                        __communicationObjectRefID: "M-0002_A-A062-11-180E_O-11_R-1426",
                                        description: "XYZ",
                                        readFlag: true,
                                        transmitFlag: false,
                                        updateFlag: true,
                                        writeFlag: true,
                                        isActive: true,
                                        channelID: "",
                                        connectors: [
                                            ..., {
                                                send: [
                                                    ..., {
                                                        __groupAddressRefID: "P-05A5-0_GA-17"
                                                    }, ...
                                                ],
                                                receive: [
                                                    ..., {
                                                        __groupAddressRefID: "P-05A5-0_GA-110"
                                                    }, ...
                                                ]
                                            }, ...
                                        ]
                                    }, ...
                                ],
                                parameterReferences: [
                                    ..., {
                                        __parameterRefID: "M-0002_A-A05C-32-3F16_P-24515_R-24515",
                                        parameterValue: "1"
                                    }, ...
                                ],
                                security: {
                                    sequenceNumber: 0,
                                    sequenceNumberTimestamp: "2011-02-29T18:03:03.0102982Z"
                                },
                                __referenceIDs: {
                                    productRefID: "M-0002_H-2CDG.20110.2011…CDG.20110.20113.20R0011",
                                    hardware2ProgramRefID: "M-0002_H-2CDG.20110.2011…R0011-1_HP-A05C-32-3F16"
                                }
                            }, ...
                        ]
                    }, ...
                ]
            }, ...
        ],
        unassignedDevices: [
            ..., contains the same type of objects as devices[], ...
        ]
    },
    buildings: [
        ..., {
            ID: "P-02A1-0_BP-1",
            name: "Building123",
            type: "Building",
            deviceReferences: [
                ..., {
                    __deviceRefID: "P-02A1-0_DI-1"
                }, ...
            ],
            functions: [
                ..., {
                    ID: "P-02A1-0_F-1",
                    name: "FunctionABC",
                    type: "SwitchableLight",
                    groupAddressReferences: [
                        ..., {
                            ID: "P-02A1-0_GF-5",
                            name: "GAReference123",
                            __groupAddressRefID: "P-02A1-0_GA-5"
                        }, ...
                    ]
                }, ...
            ],
            buildingParts: [
                ..., same type as the contents of buildings[] buf with another type, ...
            ]
        }, ...
    ],
    groupAddresses: {
        groupRanges: [
            ..., {
                ID: "P-02A1-0_GR-1",
                name: "New main group",
                rangeStart: 1,
                rangeEnd: 2047,
                passTroughLineCoupler: true,
                groupRanges: [
                    ..., GARanges can contain other GARanges, ...
                ],
                groupAddresses: [
                    ..., {
                        ID: "P-02A1-0_GA-1",
                        name: "GAName123",
                        address: 1,
                        description: "GroupAddressOfABC",
                        datapointType: "DPST-1-1",
                        passTroughLineCoupler: true,
                        centralFlag: false
                    }, ...
                ]
            }, ...
        ]
    },
    productLookupTable: [
        ..., {
            ID: "M-0002_H-2CDG.20110.20152.20R0011-1",
            name: "SA/S4.6.1.1",
            busCurrent: 12,
            serialNumber: "2CDG 110 152 R0011",
            flags: {
                isAccessory: false
                isPowerSupply: false
                isChoke: false
                isCoupler: false
                isPowerLineRepeater: false
                isPowerLineSignalFilter: false
                isCable: false
                isIPEnabled: false
                hasApplicationProgram1: true
                hasApplicationProgram2: false
                hasIndividualAddress: true
                noDownloadWithoutPlugin: false
            },
            products: [
                ..., {
                    ID: "M-0002_H-2CDG.20110.20152.20R0011-1_P-2CDG.20110.20152.20R0011",
                    text: "SA/S4.6.1.1 Switch Actuator,4-fold,6A,MDRC",
                    orderNumber: "2CDG 110 152 R0011",
                    visibleDescription: "ProductDescriptionABC"
                }, ...
            ],
            __referenceIDs: {
                originalManufacturerID: "M-00C5",
                manufacturerID: "M-00C8",
                applicationProgramRefID: "M-0083_A-000D-11-501B"
            }
        }, ...
    ],
    manufacturerLookupTable: [
        ..., {
            ID: "M-0001",
            KNXmanufacturerID: "1",
            manufacturerName: "Siemens"
        }, ...
    ],
    datapointLookupTable: [
        ..., {
            ID: "DPT-1",
            dptNumber: 1,
            dptName: "1.xxx",
            dptText: "1-bit",
            dptSizeInBit: 1,
            datapointSubtypes: [
                ..., {
                    ID: "DPST-1-1",
                    subDptNumber: 1,
                    subDptName: "DPT_Switch",
                    subDptText: "switch"
                }, ...
            ]
        }, ...
    ],
    mediumTypeLookupTable: [
        ..., {
            ID: "MT-1",
            number: 1,
            name: "PL",
            text: "PowerLine",
            domainAddressLength: 8
        }, ...
    ],
    deviceApplicationLookupTable: [
        ..., {
            ID: "M-0002_A-A088-32-C0B5",
            name: "Switch 4f 6A/3.2b",
            number: 41096,
            version: "50",
            programType: "ApplicationProgram",
            maskVersion: "MV-0701",
            __manufacturerRefID: "M-0002"
        }, ...
    ],
    deviceMaskversionLookupTable: [
        ..., {
            ID: "MV-0010",
            maskVersion: 16,
            managementModel: "Bcu1",
            unloadedIndividualAddress: 65280,
            maxIndividualAddress: 32767,
            maxGroupAddress: 4095,
            __mediumTypeRefID: "MT-0",
            __otherMediumTypeRefID: "MT-1",
            resources: [
                ..., {
                    name: "ManagementStyle",
                    access: "remote local1",
                    addressSpace: "StandardMemory",
                    startAddress: 1,
                    ptrResource: "GroupObjectTablePtr",
                    interfaceObjectRef: 2,
                    propertyID: 5,
                    occurrence: 1,
                    length: 2,
                    flavour: "GroupObjectTable_Bcu11",
                    readRights: "Runtime",
                    writeRights: "Configuration"
                }, ...
            ],
            compatibleMaskVersionIDs: [
                ..., "MV-0910", ...
            ]
        }, ...
    ],
    // Functions
    getProjectInformation: Function,
    getAreas: Function,
    getAreaByKey: Function,
    getLines: Function,
    getLineByKey: Function,
    getUnassignedDevices: Function,
    getUnassignedDeviceByKey: Function,
    getDevices: Function,
    getDeviceByKey: Function,
    getBuildingParts: Function,
    getBuildingPartByKey: Function,
    getFunctions: Function,
    getFunctionByKey: Function,
    getGroupAddresses: Function,
    getGroupAddressByKey: Function,
    getProductsFamilies: Function,
    getProductFamilyByKey: Function,
    getProducts: Function,
    getProductByKey: Function,
    getManufacturers: Function,
    getManufacturerByKey: Function,
    getDatapointTypes: Function,
    getDatapointTypeByKey: Function,
    getDatapointSubTypes: Function,
    getDatapointSubTypeByKey: Function,
    getMediumTypes: Function,
    gedMediumTypeByKey: Function,
    getDeviceApplicationInformation: Function,
    getDeviceApplicationInformationByKey: Function,
    getMaskversions: Function,
    getMaskversionByKey: Function,
    exportToJson: Function
}
```
---
### The parts of a parsed project
- Single objects of the structure (above) are explained here
- Some objects lack explanation, due to missing information
- Normally, a whole tree is contained in one section below. But there are some exceptions, like the topology tree, that are split up because they are to complex for one section
### ```result.projectInformation```
- It contains general information about the project parsed from the project information file
    - This file is contained in the project directory inside the unpacked project:
        ```
        path/to/unpacked/project/P-*/project.xml
        ```
    - ```.ID``` stores the id of the project (```String```). Same name as the project directory inside the unpacked project. Normal format:
    ```
    "P-####"        Where '#' is replaced with other characters or numbers
    ```
    - ```.name``` stores the name of the project. (```String```)
    - ```.groupAddressStyle``` stores the group address representation style used in the project (```String```). Possible values:
    ```
    "Free"          No preferred group address representation is set        (both x/y and x/y/z)
    "TwoLevel"      Group addresses are represented in two-level-style      (only x/y)
    "ThreeLevel"    Group addresses are represented in three-level-style    (only x/y/z)
    ```
    - ```.deviceCount``` stores the number of devices contained in the project (```Number```)
    - ```.lastModified``` stores a date string representing the date the project was last modified (```String```)
    - ```.lastUsedPUID``` ... (```Number```)
    - ```.GUID``` ... (```String```)
    - ```.completionStatus``` stores the completion status of the project (```String```). Possible values:
    ```
    "FinishedDesign"
    "Locked"
    "Accepted"
    "Tested"
    "FinishedCommissioning"
    "Editing"
    "Unknown"
    ```
    - ```.projectStart``` stores a date string representing the starting date of the project (```String```)
    - ```.etsVersion``` stores information about the used version of ETS
        - ```.application``` store the name of the used application (```String```). Normally of of:
        ```
        "ETS5"          For all variations of ETS five
        "ETS4"          For all variations of ETS four
        ```
        - ```.version``` stores the more precise sub-version of the ETS version used (```String```)
---
### ```result.topology```
- It contains the project topology which contains all areas, lines and devices with their attributes stored in relation to each other
- ```.areas[]``` stores information about all areas contained in the project
#### ```result.topology.unassignedDevices[]```
- It contains devices that aren't designated to any area (and line)
- The device objects contained in it are the same as those in ```result.topology.areas[n].lines[n1].devices[]``` (see below)
#### ```result.topology.areas[]```
- (Described below is a single element of ```result.topology.areas[]```)
- ```.ID``` stores the ID of the area (```String```). Normally like:
    ```
    "[PROJECT_ID]-n_A-x"
    ```
    - ```[PROJECT_ID]``` is the ID of the project (see ```result.projectInformation.ID```)
    - ```n``` some number
    - ```A``` stands for "```A```rea"
    - ```x``` is the area index, starting for one
- ```.name``` stores the name of the area (```String```)
- ```.address``` stores the ares part of the individual address of a device (```String```)
    ```
    "AA.LL.DDD"
    ```
    - ```AA``` is the area part
    - < 4²
- ```.lines[]``` stores all line contained in the area
#### ```result.topology.areas[n].lines[]```
- (Described below is a single element of ```result.topology.areas[n].lines[]```)
- ```.ID``` stores the ID of the line (```String```). Normally like:
    ```
    "[PROJECT_ID]-n_L-x"
    ```
    - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
    - ```n``` some number
    - ```L``` stands for "```L```ine"
    - ```x``` is the line index, starting for one
- ```.name``` store the name of the line (```String```)
- ```.address``` stores the area and the line part of the individual address of a device (```String```)
    ```
    "AA.LL.DDD"
    ```
    - ```LL``` is the line part
    - < 4²
- ```.__referenceIDs``` contains IDs referencing other objects
    - ```.mediumTypeRefID``` stores the reference ID of the used physical medium (```String```). Can be resolved using:
    ```
    result.getMediumTypeByKey('ID', .mediumTypeRefID)
    ```
- ```.devices[]``` stores all devices contained in the line
#### ```result.topology.areas[n].lines[n1].devices[]```
- (Described below is a single element of ```result.topology.areas[n].lines[n1].devices[]```)
- ```.ID``` stores the ID of the device (```String```). Normally like:
    ```
    "[PROJECT_ID]-n_DI-x"
    ```
    - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
    - ```n``` some number
    - ```DI``` stands for "```D```evice" (forget about the ```I```)
    - ```x``` is the device index
- ```.address``` stores the whole individual address of a device (```String```)
    ```
    "AA.LL.DDD"
    ```
    - ```DDD``` is the device part
    - < 8²
- ```.isCommunicationVisibilityCalculated``` ...
- ```.programmingStatus``` stores device-programming related information
    - ```.serialNumber``` Stores the serial number of the device (```String```)
    - ```.applicationProgramLoaded``` (```Boolean```) Possible values:
    ```
    true        The application program is loaded onto the device
    false       The application program is not loaded onto the device
    ```
    - ```.communicationPartLoaded``` (```Boolean```) Possible values:
    ```
    true        The communication part is loaded onto the device
    false       The communication part is not loaded onto the device
    ```
    - ```.individualAddressLoaded``` (```Boolean```) Possible values:
    ```
    true        The individual address is loaded onto the device
    false       The individual address is not loaded onto the device
    ```
    - ```.parametersLoaded``` (```Boolean```) Possible values:
    ```
    true        The application parameters are loaded onto the device
    false       The application parameters are not loaded onto the device
    ```
    - ```.mediumConfigLoaded``` (```Boolean```) Possible values:
    ```
    true        The medium config is loaded onto the device
    false       The medium config is not loaded onto the device
    ```
    - ```.lastUsedAPDULength```  (```Number```) ...
    - ```.maxReadAPDULength``` (```Number```) ...
    - ```.lastModified``` (```String```) stores the date of the last time the devices programming was changed
    - ```.lastDownload``` (```String```) stores the data of the last time something was written to the device
- ```.security``` ...
    - ```.sequenceNumber``` (```Number```)
    - ```.sequenceNumberTimestamp``` (```String```) stores the date of the origin of the sequenceNumber
- ```.__referenceIDs```
    - ```.productRefID``` (```String```) stores the reference to the product/hardware this device is. Can be resolved with:
        ```
        result.getProductByKey('ID', .productRefID)
        ```
    - ```.hardware2ProgramRefID``` (```String```) stores the reference to the application running on this device
- ```.parameterReferences[]``` explained below
- ```.communicationObjectReferences[]``` explained below
#### ```result.topology.areas[n].lines[n1].devices[n2].parameterReferences[]```
- (Described below is a single element of ```result.topology.areas[n].lines[n1].devices[n2].parameterReferences[]```)
- It stores information about device parameters/settings
- ```.__parameterRefID``` (```String```) stores the ID of the referenced parameter
    - No parameter reference resolving supported
- ```.parameterValue``` stores the value of the referenced parameter
    - No static type can be determined
#### ```result.topology.areas[n].lines[n1].devices[n2].communicationObjectReferences[]```
- (Described below is a single element of ```result.topology.areas[n].lines[n1].devices[n2].communicationObjectReferences[]```)
- A communication object is an object that describes how and with whom the device communicates linked to a specific property of the device
- It also contains the group addresses used and the read, transmit and update flag of the property
- It is the data behind 'Group Objects' tab of a device in ETS
- ```.__communicationObjectRefID``` (```String```) stores the ID of the referenced communication object
- ```.description``` (```String```) stores the description 
- ```.readFlag``` (```Boolean```) if the object is readable or noht
- ```.transmitFlag``` (```Boolean```) if the object is transmittable (?) or not
- ```.updateFlag``` (```Boolean```) if the object is updateable (?) or not
- ```.writeFlag``` (```Boolean```) if the object is writable or not
- ```.isActive``` (```Boolean```) if the object is active or not
- ```.channelID``` (```Unknown```) ...
- ```.connectors``` stores information about where data is sent to and where data will be received from
    - ```.send[]``` stores group addresses to which data will be sent to
        - ```.__groupAddressRefID``` (```String```) stores the ID of the referenced group address
    - ```receive[]``` stores group addresses from which data will be received
        - ```.__groupAddressRedID``` (```String```) stores the ID of the referenced group address
---
### ```result.buildings[]```
- (Described below is a single element of ```result.buildings[]```)
- It contains all buildings, building parts, devices and functions of the project stored in relation to each other
- It is important to notice that a building is technically a building part like a floor, a stairway, ...
- ```.ID``` (```String```) stores the ID of the building part
    ```
    "[PROJECT_ID]-n_BP-x"
    ```
    - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
    - ```n``` some number
    - ```BP``` stands for ```B```uilding```P```art
    - ```x``` is the buildings index
- ```.name``` (```String```) the name of the building part
- ```.type``` (```String```) the type of the building part. Normally one of:
    ```
    "Building"
    "BuildingPart"
    "Room"
    "DistributionBoard"
    "Floor"
    "Stairway"
    ```
- ```.deviceReferences[]```
    - ```.__deviceRefID``` (```String```) stores the ID of the referenced device. Can be resolved with:
    ```
    result.getDeviceByKey('ID', .__deviceRefID)
    ```
- ```.functions[]```  
    - ```.ID``` (```String```) the ID of the function
        ```
        "[PROJECT_ID]-n_F-x"
        ```
        - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
        - ```n``` some number
        - ```F``` stands for ```F```unction
        - ```x``` is the functions index
    - ```.name``` (```String```) stores the name of the function
    - ```.type``` (```String```) stores the type of the function. Normally one of:
        ```
        "DimmableLight"
        "SwitchableLight"
        "SunProtection"
        "HeatingRadiator"
        "HeatingFloor"
        "Custom"
        ```
    - ```.groupAddressReferences[]```
        - ```.ID``` (```String```) stores the ID of the group address reference
            ```
            "P-02A1-0_GF-5"
            ```
        - ```.name``` (```String```) stores the name of the GAF
        - ```.role``` (```String```) stores the role of the GAF. Examples:
            ```
            "SwitchOnOff"
            "RelativeSetvalueControl"
            "ActualDimmingValue"
            "InfoOnOff"
            ```
        - ```.__groupAddressRefID``` (```String```) stores the ID of the referenced GroupAddress. Can be resolved with:
            ```
            result.getGroupAddressByKey('ID', .__groupAddressRefID)
            ```
- ```.buildingParts[]``` stores more building parts ("recursive")
---
### ```result.groupAddresses[]```
- (Described below is a single element of ```result.groupAddresses[]```)
- Contains a structure of GroupRanges which contain GroupAddresses
- ```.groupRanges[]```
- ```.ID``` (```String```) stores the ID of the GroupRange
    ```
    "[PROJECT_ID]-n_GR-x"
    ```
    - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
    - ```n``` some number
    - ```GR``` stands for ```G```roup```R```ange
    - ```x``` is the group ranges index
- ```.name``` (```String```) stores the name of the GroupRange
- ```.rangeStart``` (```Number```) stores the start group address of the range
- ```.rangeEnd``` (```Number```) stores the end group address of the range
- ```.passTroughLineCoupler``` (```Boolean```) Possible values:
    ```
    true        Messages with group addresses in this range will be passed trough a line coupler
    false       Messages with group addresses in this range won't be passed trough a line coupler
    ```
- ```.groupAddresses[]```
    - ```.ID``` (```String```) stores the ID of the GroupAddress
        ```
        "[PROJECT_ID]-n_GA-x"
        ```
        - ```[PROJECT_ID]``` is the ID of the project (see ```projectInformation.ID```)
        - ```n``` some number
        - ```GA``` stands for ```G```roup```A```ddress
        - ```x``` is the group addresses index
    - ```.name``` (```String```) stores the name of the GroupAddress
    - ```.address``` (```Number```) stores the actual GroupAddress
    - ```.description``` (```String```) stores the description of the GroupAddress
    - ```.datapointType``` (```String```) stores the datapoint type ID associated with this address.
        - There are two possible ```.datapointType``` "variations":
        ```
        DPT-n
        DPST-n-n1
        ```
        - ```DP(S)T``` stands for ```D```ata```p```oint(```S```ub)```T```ype
        - ```n``` is the number of the datapoint type
        - ```n1``` is the number of the datapoint sub-type
        ```
        result.getDatapointTypeByKey('ID', .datapointType)
        ```
        - The first variation can be resolved with:
        ```
        result.getDatapointType('ID', .datapointType)
        ```
        - ... and the second one can be resolved with:
        ```
        result.getDatapointSubTypeByKey('ID', .datapointType)
        ```
    - ```.passTroughLineCoupler``` (```Boolean```) Possible values:
        ```
        true        Messages with group addresses in this range will be passed trough a line coupler
        false       Messages with group addresses in this range won't be passed trough a line coupler
        ```
        - If ```.passTroughLineCoupler``` is set in the GroupRange above, it is inherited from it
    - ```.centralFlag``` (```Boolean```) ...
---
### ```result.productLookupTable[]```
- (Described below is a single element of ```result.productLookupTable[]```)
- It contains product families containing products
- ```.ID``` (```String```) stores the ID of the product family
    ```
    "[MANUFACTURER_ID]_[PRODUCT/MANUFACTURER_SPECIFIC]"
    Example:   "M-0002_H-2CDG.20110.20152.20R0011-1"
    ```
    - For information about MANUFACTURER_IDs, see ```result.manufacturerLookupTable[]```
- ```.name``` (```String```) stores the name of the product family
- ```.busCurrent``` (```Number```) ...
- ```.serialNumber``` (```String```) stores the serial number of the product family
- ```.flags```
    - ```.isAccessory``` (```Boolean```)
    - ```.isPowerSupply``` (```Boolean```)
    - ```.isChoke``` (```Boolean```)
    - ```.isCoupler``` (```Boolean```)
    - ```.isPowerLineRepeater``` (```Boolean```)
    - ```.isPowerLineSignalFilter``` (```Boolean```)
    - ```.isCable``` (```Boolean```)
    - ```.isIPEnabled``` (```Boolean```)
    - ```.hasApplicationProgram1``` (```Boolean```)
    - ```.hasApplicationProgram2``` (```Boolean```)
    - ```.hasIndividualAddress``` (```Boolean```)
    - ```.noDownloadWithoutPlugin``` (```Boolean```) One of:
        ```
        true        All devices in this family can't be programmed without using a manufacturer specific plugin
        false       All devices in this family can be programmed the normal way
        ```
- ```.products[]``` Contains the actual products contained in the product family
    - ```.ID``` (```String```) stores the ID of the product
        - Same structure as the ```.ID``` field of the overlaying product family, but with more data appended to it
    - ```.text``` (```String```) stores a short name-like description of the product
    - ```.orderNumber``` (```String```) ...
    - ```.visibleDescription``` (```String```) stores a description of the product
- ```.__referenceIDs[]```
    - ```.originalManufacturerID``` (```String```) stores the ID of the manufacturer who originally produced this product
    - ```.manufacturerID``` (```String```) stores the ID of the manufacturer who sold this product
    - ```.applicationProgramRefID``` (```String```) the ID of the application program used for this product family
    - ```.originalManufacturerID``` and ```.manufacturerID``` can be resolved with:
        ```
        result.getManufacturerByKey('ID', .originalManufacturerID or .manufacturerID)
        ```
    - ```.applicationProgramRefID``` can be resolved with:
        ```
        result.getDeviceApplicationInformationByKey('ID', .applicationProgramRefID)
        ```
---
### ```result.manufacturerLookupTable[]```
- (Described below is a single element of ```result.manufacturerLookupTable[]```)
- It contains information about KNX device manufacturers
- ```.ID``` (```String```) stores the ID of the manufacturer
    ```
    "M-0001"
    ```
    - ```M``` standing for "```M```anufacturer"
    - ```0001``` being the manufacturer ID, this one standing for Siemens
- ```.KNXmanufacturerID``` (```Number```) being the KNX manufacturer number/ID
- ```.manufacturerName``` (```String```) stores the name of the manufacturer
---
### ```result.datapointLookupTable[]```
- (Described below is a single element of ```result.datapointLookupTable[]```)
- It contains information about datapoint types and their sub-types
- ```.ID``` (```String```) stores the ID of the datapoint type
    ```
    "DPT-1"
    ```
    - ```DPT``` stands for "```D```ata```P```oint```T```ype"
    - ```1``` is the ID/number of the DPT
- ```.dptNumber``` (```Number```) stores the number of this DPT
- ```.dptName``` (```String```) stores the name of this DPT
- ```.dptText``` (```String```) stores a short describing string about this DPT
- ```.dptSizeInBit``` (```Number```) stores the size of the data transmitted labeled with this DPT
- ```.datapointSubtypes```
    - ```.ID``` (```String```) stores the ID of the datapoint sub-type
        ```
        "DPST-1-1"
        ```
        - ```DPST``` stand for ```D```ata```P```oint```S```ub```T```ype
        - ```1``` is the ID/number of the DPT
        - ```1``` is the ID/number of the DPST
    - ```.subDptNumber``` (```Number```) stores the number of the DPST
    - ```.subDptName``` (```String```) stores the name of the DPST
    - ```.subDptText``` (```String```) stores a short describing string about this DPST
---
### ```result.mediumTypeLookupTable[]```
- (Described below is a single element of ```result.mediumTypeLookupTable[]```)
- It contains information about physical KNX mediums
- ```.ID``` (```String```) stores the ID of the KNX medium
    ```
    "MT-1"
    ```
    - ```MT``` stands for ```M```edium```T```ype
    - ```1``` is the MT number
- ```.number``` (```Number```) stores the number of the MT
- ```.name``` (```String```) stores the name of the MT
- ```.text``` (```String```) stores a short describing string about this MT
- ```.domainAddressLength``` (```Number```) ...
---
### ```result.deviceApplicationLookupTable```
- (Described below is a single element of ```result.deviceApplicationLookupTable```)
- It contains information about device application programs
- ```.ID``` (```String```) stores the ID of the device application program
- ```.name``` (```String```) stores the name of the DAP
- ```.number``` (```Number```) stores the DAP number (also stored on the KNX device)
- ```.version``` (```String```) stores the version of the DAP (-||-)
- ```.programType``` (```String```) stores a string describing the type of the DAP. Possible values:
    ```
    ...
    ```
- ```.maskVersion``` (```String```) stores the mask version for the application program
- ```.__manufacturerRefID``` (```String```) stores the ID of the manufacturer of the device family this application program should run on. Can be resolved with:
    ```
    result.getManufacturerByKey('ID', .__manufacturerRefID)
    ```
### ```result.deviceMaskversionLookupTable```
- (Described below is a single element of ```result.deviceMaskversionLookupTable```)
    ```
    "MV-0010"
    ```
    - ```MV``` stand for ```M```ask```V```ersion
    - ```0010``` represents the maskversion number in hex (see ```.maskVersion```)
- ```.ID``` (```String```) stores the ID of the device maskversion
- ```.name``` (```String```) stores the name of the maskversion
- ```.maskVersion``` (```Number```) the number of the maskversion
- ```.managementModel``` (```String```) stores the management model of this maskversion. Some examples:
    ```
    "None"
    "Bcu1"
    "Bcu2"
    "PropertyBased"
    "BimM112"
    "SystemB"
    ```
- ```.unloadedIndividualAddress``` (```Number```) stores the individual address the device would use when it isn't programmed to use another address
- ```.maxIndividualAddress``` (```Number```) stores the highest individual address usable with devices (device applications) with this maskversion
- ```.maxGroupAddress``` (```Number```) stores the highest group address usable with devices (device applications) with this maskversion
- ```.__mediumTypeRefID``` (```String```) stores the reference ID of the medium type device applications with this maskversion can run on
- ```.__otherMediumTypeRefIDs``` (```String```) stores a reference ID of an alternative medium type
- ```.compatibleMaskVersionIDs[]``` (```String[]```) stores strings (like ```.__mediumTypeRefID```)
- ```.resources[]```
### ```result.deviceMaskversionLookupTable.resources```
(Described below is a single element of ```result.deviceMaskversionLookupTable.resources```)
- A resource describes a resource available on KNX devices with the corresponding maskversion
    - Normally, the resource is a value than can be read/written from/to the device like the ```ProgrammingMode``` resource, which can be read to check if the device is in programming mode. It can also be set into programming mode by writing a value to the resource
    - There are (mostly) two ways of accessing a resource:
        - Via direct memory reading/writing - for this ```.startAddress```, ```.length``` and ```.addressSpace``` must be given
        - Via property read/write requests - for this ```.propertyID```, ```.length```
- ```.name``` (```String```) stores the name of the resource
- ```.access``` (```String```) stores a string describing how/from where the resource is accessible. Examples:
    ```
    "remote local1"
    "remote local2"
    "local1"
    "remote local1 local2"
    ```  
- ```.addressSpace``` (```String```) stores a string describing describing in which address space the resource is stored on the KNX device. Normally one of:
    ```
    "SystemProperty"
    "StandardMemory"
    "RelativeMemory"
    "RelativeMemoryByObjectType"
    "Pointer"
    "Property"
    "LcFilterMemory"
    "Constant"
    "ADC"
    "None"
    ```  
    - ``````
- ```.startAddress``` (```Number```) stores the address of the first byte to read when using direct memory access
- ```.ptrResource``` (```String```) stores the name of the resource that points to this resource
    - Will only be set if ```.addressSpace``` equals
        ```
        "Pointer"
        ```
    - Usually one of:
        ```
        "GroupAddressTablePtr"
        "GroupAssociationTablePtr"
        "GroupObjectTablePtr"
        ```
- ```.interfaceObjectRef``` (```Number```) ...
- ```.propertyID``` (```Number```)
- ```.occurrence``` (```Number```) stores the property ID when using property based access
- ```.length``` (```Number```) stores the length of the resource, independent from the method used to access the resource
- ```.flavour``` (```String```) stores the flavour/type of the resource. (Usually) one of:
    ```
    "AddressTable_Bcu1",
    "AddressTable_Bcu1PL",
    "AddressTable_SystemB"
    "AssociationTable_Bcu1"
    "AssociationTable_Bcu2"
    "AssociationTable_M112"
    "AssociationTable_SysteB"
    "FrequencyChannel_Bcu1PL"
    "GroupObjectTable_Bcu10"
    "GroupObjectTable_Bcu11"
    "GroupObjectTable_Bcu1PL"
    "GroupObjectTable_Bcu2"
    "GroupObjectTable_M112"
    "GroupObjectTable_System300"
    "GroupObjectTable_SystemB"
    "HardwareConfig_Identical"
    "HardwareConfig_Version"
    "Lc_10"
    "Lc_11"
    "Lc_12"
    "LoadControl_Bcu2"
    "LoadControl_M112"
    "ManagementStyle_Bcu2"
    "PeiType_Adc"
    "PeiType_Prop"
    "PlMc"
    "ProgrammingMode_Bcu1"
    "ProgrammingMode_Prop"
    "Ptr_StandardMemory"
    "Ptr_StandardMemory100"
    "ReConfig_Bcu1PL"
    "ReConfig_Rf"
    "RunControl_Bcu1"
    "Runerror_Bcu1"
    "Sensitivity_Bcu1PL"
    "Stamp_SystemB"
    "Voltage_Adc"
    ```  
- ```.readRights``` (```String```) stores a string describing the "situation" in which the resource can be read. Examples:
    ```
    "Configuration"
    "None"
    "Runtime"
    ```  
- ```.writeRights``` (```String```) stores a string describing the "situation" in which the resource can be written. Examples:
    ```
    "Configuration"
    "None"
    "Runtime"
    ```  
## Functions
- For information on the returned values, see above
### ```result.get*ByKey(key, value)```
- Function of this type (see below) are used to get an element which matches the key-value pair
    ```
    let a = [
        {
            b: 1,
            c: 2,
            e: 5
        },
        {
            b: { c: 3 },
            e: 5
        },
        {
            d: 4,
            e: 5
        }
    ]
    
    // If there would be a function result.getAByKey()
    //      result.getAByKey('b', 1) would return [{b: 1, c: 2, e: 5}]
    //      result.getAByKey(['b', 'c'], 3) would return [{b: { c: 3 }, e: 5}]
    //      result.getAByKey('e', 5) would return all members of the array a
    ``` 
#### ```result.getProjectInformation()```
- Returns ```result.projectInformation```
#### ```result.getAreas()```
- Returns ```result.topology.areas[]```
#### ```result.getAreaByKey(key, value)```
- Returns an array of matching elements of ```result.topology.areas[]```
#### ```result.getLines()```
- Returns ```result.topology.areas[n].lines[]```
#### ```result.getLineByKey(key, value)```
- Returns an array of matching elements of ```result.topology.areas[n].lines[]```
#### ```result.getUnassignedDevices()```
- Returns ```result.topology.unassignedDevices[]```
#### ```result.getUnassignedDeviceByKey(key, value)```
- Returns an array of matching elements of ```result.topology.unassignedDevices[]```
#### ```result.getDevices()```
- Returns ```result.topology.areas[n].lines[n1].devices[]```
#### ```result.getDeviceByKey(key, value)```
- Returns an array of matching elements of ```result.topology.areas[n].lines[n1].devices[]```
#### ```result.getBuildingParts()```
- Returns ```result.buildings[]```
#### ```result.getBuildingPartByKey(key, value)```
- Returns an array of matching elements of ```result.buildings[]```
#### ```result.getFunctions()```
- Returns ```result.buildings[n].functions[]```
#### ```result.getFunctionByKey(key, value)```
- Return an array of matching elements of ```result.buildings[n].functions[]```
#### ```result.getGroupAddresses()```
- Returns ```result.groupAddresses[]```
#### ```result.getGroupAddressByKey(key, value)```
- Returns an array matching elements of ```result.groupAddresses[0-n].groupAddresses[]```
#### ```result.getProductFamilies()```
- Returns ```result.productLookupTable[]```
#### ```result.getProductFamilyByKey(key, value)```
- Returns an array of matching elements of ```result.productLookupTable[]```
#### ```result.getProducts()```
- Returns ```result.productLookupTable[n].products[]``` with a modification:
    - Every product contained in the returned array got an extra field:
        ```
        result.productLookupTable[n].products[n1].productFamilyInformation
        ```
        - which represents the ```result.productLookupTable[n]``` object the product was originally contained in
        - NOTE that the ```.products``` field of the ```.productFamilyInformation``` field is deleted 
#### ```result.getProductByKey(key, value)```
- Returns ```result.productLookupTable[n].products```
    - All elements are altered as described above (```result.getProducts()```)
#### ```result.getManufacturers()```
- Returns ```result.manufacturerLookupTable[]```
#### ```result.getManufacturerByKey(key, value)```
- Returns an array of matching elements of ```result.manufacturerLookupTable[]```
#### ```result.getDatapointTypes()```
- Returns ```result.datapointLookupTable[]```
#### ```result.getDatapointTypeByKey(key, value)```
- Returns an array of matching elements of ```result.datapointLookupTable[]```
#### ```result.getDatapointSubTypes()```
- Returns ```result.datapointLookupTable[n].datapointSubtypes[]```
#### ```result.getDatapointSubTypeByKey(key, value)```
- Returns an array of matching elements of ```result.datapointLookupTable[n].datapointSubtypes[]```
#### ```result.getMediumTypes()```
- Returns ```result.mediumTypeLookupTable[]```
#### ```result.getMediumTypeByKey(key, value)```
- Returns an array of matching elements of ```result.mediumTypeLookupTable[]```
#### ```result.getDeviceApplicationInformation()```
- Returns ```result.deviceApplicationLookupTable```
#### ```result.getDeviceApplicationInformationByKey(key, value)```
- Returns an array of matching elements of ```result.deviceApplicationLookupTable```
#### ```result.exportToJson(outputFilePath)```
- Writes the parsed project (```result```) into ```outputFilePath``` in JSON format
- Functions are obviously not written into that file
## Import a parsed project
- An exported parsed project (in JSON format) can be imported like this: 
    ```
    import readProject from './readProjectFromJson'
    
    let result = await readProject(pathToExportedParsedProject).catch(e => {
        ...
    })
    ```
- ```pathToExportedParsedProject``` is a path a parsed exported project (a file written by ```result.exportToJson()```)
- The returned value ```result``` is a promise that resolves into the same structure as the ```result``` structure returned from the parser (see above) 
# Examples
- An example can be found in ```test.js```
- It contains the initialization of the parser, how to use it and how to work with the parsed project
- To run the test/example:
    ```
    yarn test path/to/knx/project/file.knxproj 
    ```
