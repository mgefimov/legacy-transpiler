(async () => {
    try {
        log('=============================static block========================')
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
})()