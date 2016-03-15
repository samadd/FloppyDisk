/* global describe, it, expect, FloppyDisk */

(function () {
    'use strict';
    
    describe('FloppyDisk', function () {
        
        FloppyDisk.insert();
        localStorage.clear();
        
        describe('saveFile', function () {
            it(
                'Should retrieve a saved string value',
                function () {
                    var result = FloppyDisk.saveFile('teststring', 'value').loadFile('teststring');
                    expect(result).toEqual('value');
                }
            );
            it(
                'Should retrieve a saved numeric value',
                function () {
                    var result = FloppyDisk.saveFile('testnumber', 4).loadFile('testnumber');
                    expect(result).toEqual(4);
                }
            );
            it(
                'Should retrieve a saved boolean value',
                function () {
                    var result = FloppyDisk.saveFile('testboolean', true).loadFile('testboolean');
                    expect(result).toEqual(true);
                }
            );
            it(
                'Should retrieve a saved date value',
                function () {
                    var d = new Date();
                    var result = FloppyDisk.saveFile('testdate', d, 'date').loadFile('testdate');
                    expect(result).toEqual(d);
                }
            );
            it(
                'Should retrieve a saved array value',
                function () {
                    var a = [1,2,3];
                    var result = FloppyDisk.saveFile('testarray', a).loadFile('testarray');
                    expect(result).toEqual(a);
                }
            );
            it(
                'Should retrieve a saved object value',
                function () {
                    var o = {a:1, b:"test"};
                    var result = FloppyDisk.saveFile('testobject', o).loadFile('testobject');
                    expect(result).toEqual(o);
                }
            );
        });
        
    });
    
}());