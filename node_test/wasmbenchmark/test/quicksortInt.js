const path = require('path');
const Module = require(path.join(__dirname, '../src/quicksortInt'));

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

var num = 0x200000;
var loop = 10;
var array0 = new Int32Array(num); // master
var array1 = new Int32Array(num); // for JavaScript
var array2 = new Int32Array(num); // for WebAssembly
initArray(array0);

function jsQuicksortInt(array, start, end) {
    if (start >= end) return;
    var pivot = array[end];
    var left = 0;
    var right = 0;
    while (left + right < end - start) {
      var num = array[start+left];
      if (num < pivot) {
        left++;
      } else {
        array[start+left] = array[end-right-1];
        array[end-right-1] = pivot;
        array[end-right] = num;
        right++;
      }
    }
    jsQuicksortInt(array, start, start+left-1);
    jsQuicksortInt(array, start+left+1, end);
}

function wsQuicksortInt(array, start, end) {
    var pointer = Module._malloc(array.length * 4);
    var offset = pointer / 4;
    Module.HEAP32.set(array, offset);
    Module._quicksortInt(pointer, start, end);
    array.set(Module.HEAP32.subarray(offset, offset + end + 1));
    Module._free(pointer);
}

function equalArray(array1, array2) {
  if (array1.length !== array2.length) return false;
  for (var i = 0, il = array1.length; i < il; i++) {
    if(array1[i] !== array2[i])
      return false;
  }
  return true;
}

function orderIsOk(array) {
  for (var i = 1, il = array.length; i < il; i++) {
    if (array[i-1] > array[i])
      return false;
  }
  return true;
}

function checkFunctionality() {
  copyArray(array0, array1);
  copyArray(array0, array2);
  jsQuicksortInt(array1, 0, array1.length-1);
  wsQuicksortInt(array2, 0, array2.length-1);
  if (! orderIsOk(array1)) return false;
  return equalArray(array1, array2);
}

function run(func, array, loop) {
    copyArray(array0, array);
    func(array, 0, array.length-1); // warm-up
    var elapsedTime = 0.0;
    for (var i = 0; i < loop; i++) {
      copyArray(array0, array);
      var startTime = Date.now();
      func(array, 0, array.length-1);
      var endTime = Date.now();
      elapsedTime += (endTime - startTime);
    }
    return (elapsedTime / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
  if (! checkFunctionality()) {
    console.log('Two functions seem not equeal');
  } else {
    const JavaScriptTime = run(jsQuicksortInt, array1, loop);
    const WebAssemblyTime = run(wsQuicksortInt, array2, loop);
    console.log('Result(average[ms]');
    console.log('JavaScript: ' + JavaScriptTime);
    console.log('WebAssembly: ' + WebAssemblyTime);
    console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
  }
};