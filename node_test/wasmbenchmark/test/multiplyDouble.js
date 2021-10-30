const path = require('path');
const Module = require(path.join(__dirname, '../src/multiplyDouble'));

var num = 0x10000000;
var loop = 10;

function jsMultiplyDouble(a, b, n) {
    var c = 1.0;
    for (var i = 0; i < n; i++) {
      c = c * a * b;
    }
    return c;
}

function checkFunctionality(n) {
    return jsMultiplyDouble(1.0, 1.0, n) === Module._multiplyDouble(1.0, 1.0, n);
}

function run(func, n, loop) {
    func(1.0, 1.0, n); // warm-up
    var elapsedTime = 0.0;
    for (var i = 0; i < loop; i++) {
      var startTime = Date.now();
      func(1.0, 1.0, n);
      var endTime = Date.now();
      elapsedTime += (endTime - startTime);
    }
    return (elapsedTime / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
    if (! checkFunctionality(num)) {
        console.log('Two functions seem not equeal');
    } else {
        const JavaScriptTime = run(jsMultiplyDouble, num, loop);
        const WebAssemblyTime = run(Module._multiplyDouble, num, loop);
        console.log('Result(average[ms]');
        console.log('JavaScript: ' + JavaScriptTime);
        console.log('WebAssembly: ' + WebAssemblyTime);
        console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
    }
};
