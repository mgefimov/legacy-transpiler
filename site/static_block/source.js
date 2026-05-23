
function log(msg) {
    var output = document.getElementById('output');
    output.textContent += msg + '\n';
}

log('=============================static block========================')

try {
    class Counter {
        static count;
        static {
            this.count = 0;
            log('static block executed, count = ' + this.count);
        }
        static increment() {
            this.count++;
            return this.count;
        }
    }
    log('Counter.count = ' + Counter.count);
    log('Counter.increment() = ' + Counter.increment());
    log('Counter.increment() = ' + Counter.increment());
    log('Counter.count = ' + Counter.count);
} catch (e) {
    log('ERROR: ' + e.message);
}
