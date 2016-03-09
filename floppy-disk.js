/* global window, console */

(function (window) {
    'use strict';
    
    var localStore = window.localStorage,
        validTypes = ["string", "number", "object", "date"];
    
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
            returnVal = val.value;
            break;
        default:
            returnVal = val;
        }
        return returnVal;
    }
    
    function Value(val, type) {
        if (type && validTypes.indexOf(type) === -1) {
            throw new Error("Unsupported type. Not saved. Condemned.");
        }
        this.type = (type || typeof val);
        this.date = new Date();
        this.value = val;
    }
    
    function writeProperties(stateObj) {
        for (let key in stateObj) {
            writeProperty(key, stateObj[key]);
        }
    }
    
    function writeProperty(key, val, type) {
        localStore.setItem(key, typeSerializer(val, type) );
    }
    
    function readProperties() {
        var obj = {};
        for (let i =0, ilength = localStore.length; i < ilength; i++) {
            let key = localStore.key(i);
            obj[key] = jsonDeserializer(localStore.getItem(key));
        }
        return obj;
    }
    
    function readProperty(key) {
        var serialProp = localStore.getItem(key);
        return jsonDeserializer(serialProp);
    }
    
    function clearState() {
        localStore.clear();
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
            deserializedObj = JSON.parse(str);
        } catch (e) {
            console.error("Failed to parse text as JSON. Must not be valid JSON.");
        }
        return extractValue(deserializedObj);
    }
    
    function observe(appState) {
        writeProperties(appState);
        var handler = {
            set: function (origObj, key, value) {
                origObj[key] = value;
                writeProperty(key, value);
            }
        };
        return new Proxy(appState, handler);
    }
    
    var FloppyDisk = {
        saveFiles: writeProperties,
        saveFile: writeProperty,
        loadFiles: readProperties,
        loadFile: readProperty,
        format: clearState,
        autoSave: observe,
        eject: function () {window.FloppyDisk = DF0;}
    };
    
    var DF0 = {
        insert: function() {window.FloppyDisk = FloppyDisk;}  
    };
    
    window.FloppyDisk = DF0;
    
}(window));