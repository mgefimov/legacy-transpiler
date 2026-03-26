import {meta} from './app.js';

class Utils {
  static greet;
  static add;
  static {
    this.greet = function(name) {
      return 'Hello, ' + name + ' from ' + meta.name + '!';
    };
    this.add = function(a, b) {
      return a + b;
    };
  }
}

export var greet = Utils.greet;
export var add = Utils.add;
