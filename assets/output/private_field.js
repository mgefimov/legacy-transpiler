'use strict';
(async function () {
  class BankAccount {
    static _static_block__0() {
      this.val = 42;
      console.log('static initializer');
    }
    constructor(owner, initial) {
      this._private_field__balance = 0;
      this.owner = undefined;
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
  BankAccount._private_field__kek = 0;
  BankAccount.val = 33;
  BankAccount._static_block__0();
  var acct = new BankAccount('Alice', 100);
  acct.deposit(50);
  const log = console.log;
  log('owner = ' + acct.owner);
  log('balance = ' + acct.getBalance());
  log('has #balance = ' + (acct.balance === undefined));
  log(BankAccount.val);
})();
