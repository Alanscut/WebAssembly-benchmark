const path = require('path');
var Module = require(path.join(__dirname, '../src/fib'));

var num = 0x28;
var loop = 10;

function jsFib(n) {
    if (n === 1) return 1;
    if (n === 2) return 1;
    return jsFib(n-1) + jsFib(n-2);
}

function checkFunctionality(n) {
    return jsFib(n) === Module._fib(n);
}

function run(func, n, loop) {
    func(n); // warm-up
    var startTime = Date.now();
    for (var i = 0; i < loop; i++) {
      func(n);
    }
    var endTime = Date.now();
    return ((endTime - startTime) / loop).toFixed(4);
}

Module.onRuntimeInitialized = function() {
    if (! checkFunctionality(num)) {
        console.log('Two functions seem not equeal');
    } else {
        const JavaScriptTime = run(jsFib, num, loop);
        const WebAssemblyTime = run(Module._fib, num, loop);
        console.log('Result(average[ms]');
        console.log('JavaScript: ' + JavaScriptTime);
        console.log('WebAssembly: ' + WebAssemblyTime);
        console.log('JavaScript/WebAssembly: ' + JavaScriptTime / WebAssemblyTime);
    }
};
