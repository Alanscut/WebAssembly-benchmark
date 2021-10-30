const path = require('path');
const Module = require(path.join(__dirname, '../src/sumDouble'));

function initArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
      array[i] = Math.random() * 20000 - 10000;
    }
}

var num = 0x4000000;
var loop = 10;
var array = new Float64Array(num);
initArray(array);

function jsSumDouble(array, n) {
    var s = 0;
    for (var i = 0; i < n; i++) {
      s += array[i];
    }
    return s;
}

function wsSumDouble(array, n) {
    var pointer = Module._malloc(array.length * 8);
    var offset = pointer / 8;
    Module.HEAPF64.set(array, offset);
    var result = Module._sumDouble(pointer, n);
    Module._free(pointer);
    return result;
}

function checkFunctionality(array, n) {
  console.log(jsSumDouble(array, n));
  console.log(wsSumDouble(array, n));
  return jsSumDouble(array, n) === wsSumDouble(array, n);
}

function run(func, array, loop) {
    func(array, array.length); // warm-up
    var elapsedTime = 0.0;
    for (var i = 0; i < loop; i++) {
      var startTime = Date.now();
      func(array, array.length);
      var endTime = Date.now();
      elapsedTime += (endTime - startTime);
    }
    return (elapsedTime / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
  if (! checkFunctionality(array, num)) {
    console.log('Two functions seem not equeal');
  } else {
    const JavaScriptTime = run(jsSumDouble, array, loop);
    const WebAssemblyTime = run(wsSumDouble, array, loop);
    console.log('Result(average[ms]');
    console.log('JavaScript: ' + JavaScriptTime);
    console.log('WebAssembly: ' + WebAssemblyTime);
    console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
  }
};