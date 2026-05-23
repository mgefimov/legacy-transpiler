
function log(msg) {
    var output = document.getElementById('output');
    output.textContent += msg + '\n';
}

log('=============================||= (logical OR assignment)========================')

var a = 0;
a ||= 5;
log('0 ||= 5 -> ' + a);          // 5 (0 is falsy, assigns)

var b = 3;
b ||= 9;
log('3 ||= 9 -> ' + b);          // 3 (truthy, no assign)

log('=============================&&= (logical AND assignment)========================')

var c = 1;
c &&= 7;
log('1 &&= 7 -> ' + c);          // 7 (truthy, assigns)

var d = 0;
d &&= 7;
log('0 &&= 7 -> ' + d);          // 0 (falsy, no assign)

log('=============================??= (nullish assignment)========================')

var e = null;
e ??= 'set';
log('null ??= "set" -> ' + e);   // 'set'

var f = 0;
f ??= 'set';
log('0 ??= "set" -> ' + f);      // 0 (0 is not nullish, no assign)

var g;
g ??= 'default';
log('undefined ??= "default" -> ' + g);  // 'default'

log('=============================member target========================')

var obj = { count: 0, name: 'x' };
obj.count ||= 10;
log('obj.count (0 ||= 10) -> ' + obj.count);          // 10
obj.name ??= 'fallback';
log('obj.name ("x" ??= "fallback") -> ' + obj.name);  // 'x'

log('=============================short-circuit (RHS only when needed)========================')

var calls = 0;
function rhs() {
    calls++;
    return 'computed';
}

var h = 'present';
h ||= rhs();      // h truthy -> rhs NOT called
log('"present" ||= rhs() -> ' + h);
log('rhs calls so far -> ' + calls);   // 0

var i = '';
i ||= rhs();      // i falsy -> rhs called once
log('"" ||= rhs() -> ' + i);
log('rhs calls so far -> ' + calls);   // 1
