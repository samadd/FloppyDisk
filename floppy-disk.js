/* global window, console */

(function (window) {
    'use strict';
    
    var localStore = window.localStorage,
        validTypes = ["string", "number", "object", "date", "boolean"],
        toClass = {}.toString,
        undefinedVal = {type:"undefined", value:undefined},
        rootAppState,
        FloppyDisk;
    
    function extractValue(val) {
        var returnVal;
        switch (val.type) {
        case "number":
            returnVal = parseFloat(val.value);
            break;
        case "date":
            returnVal = new Date(val.value);
            break;
        case "string":
        case "object":
        case "boolean":
        case "undefined":
            returnVal = val.value;
            break;
        default:
            returnVal = val;
        }
        return returnVal;
    }
    
    function isObjectOrArray(v) {
        var classType = toClass.call(v);
        return classType === "[object Object]" || classType === "[object Array]";
    }
    
    /**
    * @constructor
    */
    function Value(val, type) {
        if (type && validTypes.indexOf(type) === -1) {
            throw new Error("Unsupported type. Not saved. Condemned.");
        }
        this.type = (type || typeof val);
        this.value = val;
    }
    
    function writeProperties(stateObj) {
        for (let key in stateObj) {
            writeProperty(key, stateObj[key], undefined);
        }
        return FloppyDisk;
    }
    
    function writeProperty(key, val, type) {
        localStore.setItem(key, typeSerializer(val, type) );
        return FloppyDisk;
    }
    
    function readProperties() {
        var obj = {};
        for (let i =0, ilength = localStore.length; i < ilength; i++) {
            let key = localStore.key(i);
            obj[key] = jsonDeserializer(localStore.getItem((key || "")));
        }
        return obj;
    }
    
    function readProperty(key) {
        var serialProp = localStore.getItem(key);
        return jsonDeserializer((serialProp));
    }
    
    function deleteProperty(key) {
        localStore.removeItem(key);
        return FloppyDisk;
    }
    
    function clearState() {
        clearRootAppState();
        localStore.clear();
        return FloppyDisk;
    }
    
    function clearRootAppState() {
        rootAppState = undefined;
    }
    
    function typeSerializer(val, type) {
        return jsonSerializer(new Value(val, type));
    }
    
    function jsonSerializer(obj) {
        return JSON.stringify(obj);
    }
    
    function jsonDeserializer(str) {
        var deserializedObj;
        try {
            deserializedObj = (typeof str === "string") ? JSON.parse(str) : undefinedVal;
        } catch (e) {
            console.error("Failed to parse text '"+ str + "' as JSON. Probably an existing string in local storage. Returning plain text value.");
            deserializedObj = {type:"string", value:str};
        }
        return extractValue(deserializedObj);
    }
    
    function observe(appState) {
        var handler = {
            set: function (origObj, key, value) {
                if (isObjectOrArray(value)) {
                    value = observe(value);
                }
                origObj[key] = value;
                writeProperties(rootAppState); // clobber everything since we don't know how deep we are
                return true;
            },
            deleteProperty: function (origObj, key) {
                delete origObj[key];
                deleteProperty(key); //doesn't matter if this isn't top level property - about to clobber anyway - but must in case it is.
                writeProperties(rootAppState);
                return true;
            }
        };
        for (let key in appState) {
            if (isObjectOrArray(appState[key])) {
                appState[key] = observe(appState[key]);
            } 
        }
        return new Proxy(appState, handler);
    }
    
    FloppyDisk = {
        saveFiles: writeProperties,
        saveFile: writeProperty,
        loadFiles: readProperties,
        loadFile: readProperty,
        deleteFile: deleteProperty,
        format: clearState,
        autoSave: function(appState) {
            if (rootAppState) {throw new Error('Autosave already initiated. Specify one root object only.');}
            rootAppState = appState;
            writeProperties(appState);
            return observe(appState);
        },
        eject: function () {clearRootAppState(); window.FloppyDisk = DF0; return DF0;}
    };
    
    var DF0 = {
        insert: function() {window.FloppyDisk = FloppyDisk; return FloppyDisk;}  
    };
    
    window.FloppyDisk = DF0;
    
}(window));