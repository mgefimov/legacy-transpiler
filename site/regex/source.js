
function log(msg) {
    var output = document.getElementById('output');
    output.textContent += msg + '\n';
}

log('=============================literal regex: lookbehind========================')

// (?<=...) positive lookbehind  - unsupported on old Safari, stripped by transform
var price = 'Total: $42 and £99';
var litPos = /(?<=\$)\d+/g;
log('/(?<=\\$)\\d+/g  on "' + price + '" -> ' + JSON.stringify(price.match(litPos)));

// (?<!...) negative lookbehind
var litNeg = /(?<!\$)\d+/g;
log('/(?<!\\$)\\d+/g  on "' + price + '" -> ' + JSON.stringify(price.match(litNeg)));

// nested parens inside the lookbehind
var litNested = /(?<=(foo|bar)-)\d+/g;
var nestedSrc = 'foo-1 bar-2 baz-3';
log('/(?<=(foo|bar)-)\\d+/g  on "' + nestedSrc + '" -> ' + JSON.stringify(nestedSrc.match(litNested)));

log('=============================RegExp(...) constructor========================')

// string-built lookbehind via RegExp constructor
var ctorPos = new RegExp('(?<=\\$)\\d+', 'g');
log('new RegExp("(?<=\\\\$)\\\\d+", "g")  on "' + price + '" -> ' + JSON.stringify(price.match(ctorPos)));

var ctorNeg = RegExp('(?<!\\$)\\d+', 'g');
log('RegExp("(?<!\\\\$)\\\\d+", "g")  on "' + price + '" -> ' + JSON.stringify(price.match(ctorNeg)));

log('=============================template-literal RegExp (real redaction ruleset)========================')

// Lookbehind in the static part of a template literal, with ${...} interpolation.
// Mirrors a secret-redaction rule: (?<![A-Za-z0-9])(key)<sep>value
var hm = '(?:password|token|secret|api[-_]?key)';
var vm = "['\"]?[^'\"\\s]+";
// built via template literal so the transform sees a TemplateLiteral argument:
var redactTpl = new RegExp(`(?<![A-Za-z0-9])(${hm})(\\s*[:=]\\s*)${vm}`, 'gi');
var secretSrc = 'api_key = abc123 plainword = hello';
log('template RegExp on "' + secretSrc + '" -> ' + secretSrc.replace(redactTpl, '$1$2<redacted>'));

// escaped lookbehind in a template literal
var redactDash = new RegExp(`(?<![\\w-])(--${hm})(\\s+)${vm}`, 'gi');
var flagSrc = '--token foo --other bar';
log('escaped template RegExp on "' + flagSrc + '" -> ' + flagSrc.replace(redactDash, '$1$2<redacted>'));

log('=============================control: regex without lookbehind========================')

var plain = /\d+/g;
log('/\\d+/g  on "' + price + '" -> ' + JSON.stringify(price.match(plain)));
