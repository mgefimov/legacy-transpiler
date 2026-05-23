
function log(msg) {
    var output = document.getElementById('output');
    output.textContent += msg + '\n';
}

log('=============================arrow with default========================')

const f = (x = 12) => x;
log('f() = ' + f());
log('f(5) = ' + f(5));
log('f(undefined) = ' + f(undefined));
log('f(0) = ' + f(0));

log('=============================function declaration default========================')

function add(a, b = 10) {
    return a + b;
}
log('add(1) = ' + add(1));
log('add(1, 2) = ' + add(1, 2));

log('=============================default references earlier param========================')

function rect(width, height = width) {
    return width + ' x ' + height;
}
log('rect(4) = ' + rect(4));
log('rect(4, 6) = ' + rect(4, 6));

log('=============================default is an expression========================')

var calls = 0;
function makeDefault() {
    calls++;
    return 'computed' + calls;
}
function withCall(x = makeDefault()) {
    return x;
}
log('withCall() = ' + withCall());
log('withCall("given") = ' + withCall('given'));
log('makeDefault calls = ' + calls);

log('=============================null vs undefined========================')

function greet(name = 'world') {
    return 'hello ' + name;
}
log('greet() = ' + greet());
log('greet(null) = ' + greet(null));
log('greet("there") = ' + greet('there'));

log('=============================destructuring default========================')

function config({ mode = 'auto', retries = 3 } = {}) {
    return mode + '/' + retries;
}
log('config() = ' + config());
log('config({mode: "manual"}) = ' + config({ mode: 'manual' }));
log('config({retries: 5}) = ' + config({ retries: 5 }));
