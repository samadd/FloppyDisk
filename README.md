# FloppyDisk
Wraps html5 localstorage in an api which tracks type and can observe and autosave application state. Intended for cases in which you wish your web app could just save some data to a user's floppy disk, or more reasonably cases in which you want to use html5 localstorage, but with a bit more flexibility than the bare key:value(String) structure that it provides.

##TODO
Loads.

##Methods

###FloppyDisk.insert
You can't use a floppy disk without inserting it into the floppy drive. Call .insert() to notionally insert a floppy disk into the disk drive. Remember, though - you only have one floppy disk.
####Arguments
* None
####Returns
  * FloppyDisk with all methods except .insert exposed.

###FloppyDisk.eject
Finished already? What's wrong with you? By calling .eject() you have disabled FloppyDisk. Call .insert() to get back in the game.
####Arguments
* None
####Returns
  * FloppyDisk with only .insert method exposed.

###FloppyDisk.format
Clears all values held in local storage. Like wiping a floppy disk good and proper.
####Arguments
* None
####Returns
* FloppyDisk

###FloppyDisk.saveFiles
Takes an Object representing application state and writes each key / value pair to local storage. Values can be Arrays and Objects going arbitrarily deep.

####Arguments
1. `state` (Object)
  * For each key in `state`, stores value as a record in local storage.
  * Acceptable value types:
    * String
    * Number
    * Boolean
    * Array
    * Object
    * Date **Date type will not be retained - will come back as string**

###FloppyDisk.saveFile
Writes a single value to localstorage, with optional type hinting. Can only save a top-level property - if you want to save a value in a nested object and keep your saved data isomorphic with application state, you'll need to pass in the top level value, e.g.
```javascript
FloppyDisk.saveFile('someprop.foo', 'bar'); //Not currently supported
FloppyDisk.saveFile('foo', 'bar'); //Works but will get stored as a top-level property. Okay if you're not bothered about stored data being isomorphic with application state.
appstate.someprop.somedeeperprop = 'foo';
FloppyDisk.saveFile('someprop', appstate.someprop); //Correct, but will obvious re-write all keys in someprop object, though .somedeeperprop is the intended target.
```
####Arguments
1. `key` (String)
  * Just an object key.
2. `val` (String | Number | Object | Array | Date )
  * Just the corresponding value
  * Acceptable value types:
    * String
    * Number
    * Boolean
    * Array
    * Object
    * Date
    * Any custom type **Must be suitable for Array or key/val Object representation, and specified via `type` parameter.
3. `type` (String)
  * Provides type hint. Useful to ensure a date comes back as a date and not a string, or if you have a custom type that could be stored as a serialized array or object.
  * Acceptable values:
    * "string"
    * "number"
    * "object"
    * "date"
    * "boolean"

###FloppyDisk.loadFiles
Rehydrates all values stored into a single object.
####Arguments
  * None
####Returns
  * Object representing your application state, with types restored.
  
###FloppyDisk.loadFile
Rehydrates a specified value stored in local storage.
####Arguments
  1. `key` (String)
    * The particular key to retrieve from local storage.
####Returns
  * Value retrieved by specified key, with type restored.
  
###FloppyDisk.autoSave
Takes an object representing your application state, and deep-watches for changes to that object, updating localstorage automatically. Will throw an error if initiated more than once. FloppyDisk.eject() and FloppyDisk.format() will prevent further writes to localstorage.
####Arguments
  1. `state' (Object)
    * An object representing application state.
####Returns
  * Proxy Object which you should then use in place of the original `state` object.
```javascript
let appstate = {a:1, b:'foo', c: [1,2,3], d:{foo:'bar'}};
appstate = FloppyDisk.autoSave(appstate);
FloppyDisk.loadFiles(); // {a:1, b:'foo', c: [1,2,3], d:{foo:'bar'}}
appstate.a = 2;
appstate.b = false;
appstate.c.push(4);
appstate.d.bar = 'foo';
FloppyDisk.loadFiles(); // {a:2, b:false, c: [1,2,3,4], d:{foo:'bar', bar:'foo'}}
```
