const path = require('path');
const Module = require(path.join(__dirname, '../src/multiplyIntVec'));

var num = 0x2000000;
var loop = 10;

function initArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
        array[i] = ((Math.random() * 20000) | 0) - 10000;
    }
}

var src1 = new Int32Array(num);
var src2 = new Int32Array(num);
var res1 = new Int32Array(num); // for JavaScript
var res2 = new Int32Array(num); // for WebAssembly
initArray(src1);
initArray(src2);

function jsMultiplyIntVec(src1, src2, res, n) {
    for (var i = 0; i < n; i++) {
        res[i] = src1[i] * src2[i];
    }
}

function wsMultiplyIntVec(src1, src2, res, n) {
    var pointer1 = Module._malloc(src1.length * 4);
    var pointer2 = Module._malloc(src2.length * 4);
    var pointer3 = Module._malloc(res.length * 4);
    var offset1 = pointer1 / 4;
    var offset2 = pointer2 / 4;
    var offset3 = pointer3 / 4;
    Module.HEAP32.set(src1, offset1);
    Module.HEAP32.set(src2, offset2);
    var result = Module._multiplyIntVec(pointer1, pointer2, pointer3, n);
    res.set(Module.HEAP32.subarray(offset3, offset3 + n));
    Module._free(pointer1);
    Module._free(pointer2);
    Module._free(pointer3);
}

function equalArray(array1, array2) {
    if (array1.length !== array2.length) return false;
    for (var i = 0, il = array1.length; i < il; i++) {
      if (array1[i] !== array2[i])
        return false;
    }
    return true;
}

function checkFunctionality() {
    jsMultiplyIntVec(src1, src2, res1, src1.length);
    wsMultiplyIntVec(src1, src2, res2, src1.length);
    return equalArray(res1, res2);
}

function run(func, src1, src2, res, loop) {
    func(src1, src2, res, src1.length);
    var elapsedTime = 0.0;
    for (var i = 0; i < loop; i++) {
        var startTime = Date.now();
        func(src1, src2, res, src1.length);
        var endTime = Date.now();
        elapsedTime += (endTime - startTime);
    }
    return (elapsedTime / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
    if (! checkFunctionality()) {
        console.log('Two functions seem not equeal');
    } else {
        const JavaScriptTime = run(jsMultiplyIntVec, src1, src2, res1, loop);
        const WebAssemblyTime = run(wsMultiplyIntVec, src1, src2, res2, loop);
        console.log('Result(average[ms]');
        console.log('JavaScript: ' + JavaScriptTime);
        console.log('WebAssembly: ' + WebAssemblyTime);
        console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
    }
};
