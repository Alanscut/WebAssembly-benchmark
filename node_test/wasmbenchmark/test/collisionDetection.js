const path = require('path');
var Module = require(path.join(__dirname, '../src/collisionDetection'));

function Position(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function initPositions(array, n) {
    for (var i = 0; i < n; i++) {
        var x = Math.random() * 2000 - 1000;
        var y = Math.random() * 2000 - 1000;
        var z = Math.random() * 2000 - 1000;
        array[i] = new Position(x, y, z);
    }
}

function initRadiuses(array) {
    for (var i = 0, il = array.length; i < il; i++) {
        array[i] = Math.random() * 10;
    }
}

function clearArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
      array[i] = 0;
    }
}

function equalArray(array1, array2) {
    if (array1.length !== array2.length)
        return false;
    for (var i = 0, il = array1.length; i < il; i++) {
        if (array1[i] !== array2[i])
            return false;
    }
    return true;
}
  
function setPositionsToFloat64Array(positions, array, offset) {
    for (var i = 0, il = positions.length; i < il; i++) {
        var index = offset + i*3;
        array[index+0] = positions[i].x;
        array[index+1] = positions[i].y;
        array[index+2] = positions[i].z;
    }
}

function jsCollisionDetection(positions, radiuses, res, n) {
    var count = 0;
    for (var i = 0; i < n; i++) {
        var p = positions[i];
        var r = radiuses[i];
        var collision = 0;
        for (var j = i+1; j < n; j++) {
            var p2 = positions[j];
            var r2 = radiuses[j];
            var dx = p.x - p2.x;
            var dy = p.y - p2.y;
            var dz = p.z - p2.z;
            var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (r > d) {
                collision = 1;
                count++;
                break;
            }
        }
        var index = (i / 8) | 0;
        var pos = 7 - (i % 8);
        if (collision === 0) {
            res[index] &= ~(1 << pos);
        } else {
            res[index] |= (1 << pos);
        }
    }
    return count;
}

function wsCollisionDetection(positions, radiuses, res, n) {
    var pointer1 = Module._malloc(positions.length * 3 * 8);
    var pointer2 = Module._malloc(radiuses.length * 8);
    var pointer3 = Module._malloc(res.length);
    var offset1 = pointer1 / 8;
    var offset2 = pointer2 / 8;
    var offset3 = pointer3;
    setPositionsToFloat64Array(positions, Module.HEAPF64, offset1);
    Module.HEAPF64.set(radiuses, offset2);
    var result = Module._collisionDetection(
                   pointer1, pointer2, pointer3, n);
    res.set(Module.HEAPU8.subarray(offset3, offset3 + res.length));
    Module._free(pointer1);
    Module._free(pointer2);
    Module._free(pointer3);
    return result;
}
var elemNum = 0x4000;
var loop = 10;
var positions = [];
var radiuses = new Float64Array(elemNum);
var res1 = new Uint8Array(elemNum / 8); // for JavaScript
var res2 = new Uint8Array(elemNum / 8); // for WebAssembly

initPositions(positions, elemNum);
initRadiuses(radiuses);

function checkFunctionality() {
    clearArray(res1);
    clearArray(res2);
    var count1 = jsCollisionDetection(positions, radiuses, res1, elemNum);
    var count2 = wsCollisionDetection(positions, radiuses, res2, elemNum);
    return count1 === count2 && equalArray(res1, res2);
}

function run(func, positions, radiuses, res, n, loop) {
    func(positions, radiuses, res, n);  // warm-up
    var elapsedTime = 0.0;
    for (var i = 0; i < loop; i++) {
        var startTime = Date.now();
        func(positions, radiuses, res, n);
        var endTime = Date.now();
        elapsedTime += (endTime - startTime);
    }
    return (elapsedTime / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
    if (! checkFunctionality()) {
        console.log('Two functions seem not equeal');
    } else {
        const JavaScriptTime = run(jsCollisionDetection, positions, radiuses, res1, elemNum, loop);
        const WebAssemblyTime = run(wsCollisionDetection, positions, radiuses, res2, elemNum, loop);
        console.log('Result(average[ms]');
        console.log('JavaScript: ' + JavaScriptTime);
        console.log('WebAssembly: ' + WebAssemblyTime);
        console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);

    }
};