class BankAccount {
    #balance = 0;
    owner;

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
log('owner = ' + acct.owner);
log('balance = ' + acct.getBalance());
log('has #balance = ' + (acct.balance === undefined));