'use strict';
(async function () {
  class Point {
    constructor(x, y) {
      this.x = 0;
      this.y = 0;
      this.label = 'origin';
      this.x = x;
      this.y = y;
    }
    toString() {
      return this.label + ': (' + this.x + ', ' + this.y + ')';
    }
  }
})();
