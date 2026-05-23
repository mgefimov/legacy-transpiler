'use strict';

var output = document.getElementById('output');
function log(msg) {
    output.textContent += msg + '\n';
}

function runCase(name, fn) {
    try {
        fn();
        log('[OK]   ' + name);
    } catch (e) {
        log('[FAIL] ' + name + ' — ' + e.message);
    }
}

log('UA: ' + navigator.userAgent);
log('');

runCase("const {K: as} = obj:", function () {
    var obj = { K: 1 };
    eval('const {K: as} = obj: if (as !== 1) throw new Error("bad value");');
});

runCase("const {c: is, d: ns, K: as, L: rs, F: os} = obj", function () {
    var obj = { c: 1, d: 2, K: 3, L: 4, F: 5 };
    eval('const {c: is, d: ns, K: as, L: rs, F: os} = obj;' +
         'if (is!==1||ns!==2||as!==3||rs!==4||os!==5) throw new Error("bad values");');
});

runCase("const {x: as} = obj  (single rename to as)", function () {
    var obj = { x: 42 };
    eval('var {x: as} = obj; if (as !== 42) throw new Error("bad value");');
});

runCase("const {x: is} = obj  (single rename to is)", function () {
    var obj = { x: 42 };
    eval('var {x: is} = obj; if (is !== 42) throw new Error("bad value");');
});

runCase("const {x: from} = obj  (single rename to from)", function () {
    var obj = { x: 42 };
    eval('var {x: from} = obj; if (from !== 42) throw new Error("bad value");');
});

runCase("const {x: of} = obj  (single rename to of)", function () {
    var obj = { x: 42 };
    eval('var {x: of} = obj; if (of !== 42) throw new Error("bad value");');
});

runCase("await + destructuring with as binding", function () {
    eval(
        '(async function () {' +
        '  var p = Promise.resolve({ K: 7 });' +
        '  var {K: as} = await p;' +
        '  if (as !== 7) throw new Error("bad value");' +
        '})();'
    );
});

runCase("large destructuring (200 props, one named `as`)", function () {
    var obj = {};
    var props = [];
    for (var i = 0; i < 200; i++) {
        var key = 'p' + i;
        obj[key] = i;
        var binding = (i === 100) ? 'as' : ('v' + i);
        props.push(key + ': ' + binding);
    }
    var src = 'var {' + props.join(', ') + '} = obj;';
    eval(src);
});
