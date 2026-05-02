class BankAccount {
    #balance = 0;
    owner;

    static #kek = 0;

    static val = 33;

    static {
        this.val = 42;
        console.log('static initializer');
    }

    constructor(owner, initial) {
        this.owner = owner;
        this.#balance = initial;
    }

    deposit(amount) {
        this.#balance += amount;
    }

    getBalance() {
        return this.#balance;
    }
}

var acct = new BankAccount('Alice', 100);
acct.deposit(50);
const log = console.log;
log('owner = ' + acct.owner);
log('balance = ' + acct.getBalance());
log('has #balance = ' + (acct.balance === undefined));
log(BankAccount.val)