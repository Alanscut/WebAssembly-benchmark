const path = require('path');
const Module = require(path.join(__dirname, '../src/multiplyDoubleVec'));

function initArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
        array[i] = ((Math.random() * 20000) | 0) - 10000;
    }
}

function copyArray(src, res) {
    for (var i = 0, il = src.length; i < il; i++) {
        res[i] = src[i];
    }
}

var num = 0x2000000;
var loop = 10;
var src1 = new Float64Array(num);
var src2 = new Float64Array(num);
var res1 = new Float64Array(num); // for JavaScript
var res2 = new Float64Array(num); // for WebAssembly
initArray(src1);
initArray(src2);

var src3 = new Float64Array(num);
var src4 = new Float64Array(num);

copyArray(src1, src3);
copyArray(src2, src4);
var setDataTimeStart = Date.now();
copyArray(src1, src3);
copyArray(src2, src4);
var setDataTimeEnd = Date.now();
console.log('Set Data Time: ' + (setDataTimeEnd - setDataTimeStart).toFixed(4));

function jsMultiplyDoubleVec(src1, src2, res, n) {
    for (var i = 0; i < n; i++) {
      res[i] = src1[i] * src2[i];
    }
}

function wsMultiplyDoubleVec(src1, src2, res, n) {
    
    var pointer1 = Module._malloc(src1.length * 8);
    var pointer2 = Module._malloc(src2.length * 8);
    var pointer3 = Module._malloc(res.length * 8);
    var offset1 = pointer1 / 8;
    var offset2 = pointer2 / 8;
    var offset3 = pointer3 / 8;
    var startAll = Date.now();
    Module.HEAPF64.set(src1, offset1);
    Module.HEAPF64.set(src2, offset2);
    var endAll = Date.now();
    console.log('All: ' + (endAll - startAll).toFixed(4));
    var start = Date.now();
    Module._multiplyDoubleVec(pointer1, pointer2, pointer3, n);
    var end = Date.now();
    console.log((end - start).toFixed(4));
    res.set(Module.HEAPF64.subarray(offset3, offset3 + n));
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
    jsMultiplyDoubleVec(src1, src2, res1, src1.length);
    wsMultiplyDoubleVec(src1, src2, res2, src1.length);
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
        const JavaScriptTime = run(jsMultiplyDoubleVec, src1, src2, res1, loop);
        const WebAssemblyTime = run(wsMultiplyDoubleVec, src1, src2, res2, loop);
        console.log('Result(average[ms]');
        console.log('JavaScript: ' + JavaScriptTime);
        console.log('WebAssembly: ' + WebAssemblyTime);
        console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
    }
};