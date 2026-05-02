'use strict';
(async function () {
  (async () => {
    try {
      log('=============================static block========================');
      class Counter {
        static _static_block__0() {
          this.count = 0;
          log('static block executed, count = ' + this.count);
        }
        static increment() {
          this.count++;
          return this.count;
        }
      }
      Counter.count = undefined;
      Counter._static_block__0();
      log('Counter.count = ' + Counter.count);
      log('Counter.increment() = ' + Counter.increment());
      log('Counter.increment() = ' + Counter.increment());
      log('Counter.count = ' + Counter.count);
    } catch (e) {
      log('ERROR: ' + e.message);
    }
  })();
})();
