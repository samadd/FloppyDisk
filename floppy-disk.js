/* global window, console */

(function (window) {
    'use strict';
    
    var localStore = window.localStorage,
        validTypes = ["string", "number", "object", "date"],
        rootAppState;
    
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
    
    function isObjectOrArray(v) {
        var toClass = {}.toString;
        var classType = toClass.call(v);
        return classType === "[object Object]" || classType === "[object Array]";
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
        rootAppState = undefined;
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
        var handler = {
            set: function (origObj, key, value) {
                origObj[key] = value;
                writeProperties(rootAppState); // clobber everything since we don't know how deep we are
            }
        };
        for (let key in appState) {
            if (isObjectOrArray(appState[key])) {
                appState[key] = observe(appState[key]);
            } 
        }
        return new Proxy(appState, handler);
    }
    
    var FloppyDisk = {
        saveFiles: writeProperties,
        saveFile: writeProperty,
        loadFiles: readProperties,
        loadFile: readProperty,
        format: clearState,
        autoSave: function(appState) {
            if (rootAppState) {throw new Error('Autosave already initiated. Specify one root object only.');}
            rootAppState = appState;
            writeProperties(appState);
            return observe(appState);
        },
        eject: function () {clearState(); window.FloppyDisk = DF0;}
    };
    
    var DF0 = {
        insert: function() {window.FloppyDisk = FloppyDisk;}  
    };
    
    window.FloppyDisk = DF0;
    
}(window));