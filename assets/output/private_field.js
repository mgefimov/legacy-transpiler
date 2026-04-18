'use strict';
(async function () {
  class BankAccount {
    _private_field__balance = 0;
    owner;
    constructor(owner, initial) {
      this.owner = owner;
      this._private_field__balance = initial;
    }
    deposit(amount) {
      this._private_field__balance += amount;
    }
    getBalance() {
      return this._private_field__balance;
    }
  }
  var acct = new BankAccount('Alice', 100);
  acct.deposit(50);
  log('owner = ' + acct.owner);
  log('balance = ' + acct.getBalance());
  log('has #balance = ' + (acct.balance === undefined));
})();
