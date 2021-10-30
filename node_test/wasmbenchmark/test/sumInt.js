const path = require('path');
const Module = require(path.join(__dirname, '../src/sumInt'));

function jsSumInt(array, n) {
    var s = 0;
    for (var i = 0; i < n; i++) {
      s += array[i];
    }
    return s;
}

function initArray(array) {
    for (var i = 0, il = array.length; i < il; i++) {
      array[i] = ((Math.random() * 20000) | 0) - 10000;
    }
}

function wsSumInt(array, n) {
  var pointer = Module._malloc(array.length * 4);
  var offset = pointer / 4;
  Module.HEAP32.set(array, offset);
  var result = Module._sumInt(pointer, n);
  Module._free(pointer);
  return result;
}

function checkFunctionality(array, n) {
  return jsSumInt(array, n) === wsSumInt(array, n);
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

var num = 0x8000000;
var loop = 10;
var array = new Int32Array(num);
initArray(array);

Module.onRuntimeInitialized = function() {
  if (! checkFunctionality(array, num)) {
    console.log('Two functions seem not equeal');
  } else {
    const JavaScriptTime = run(jsSumInt, array, loop);
    const WebAssemblyTime = run(wsSumInt, array, loop);
    console.log('Result(average[ms]');
    console.log('JavaScript: ' + JavaScriptTime);
    console.log('WebAssembly: ' + WebAssemblyTime);
    console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
  }
};