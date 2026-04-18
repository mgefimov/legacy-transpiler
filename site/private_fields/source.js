
function log(msg) {
    var output = document.getElementById('output');
    output.textContent += msg + '\n';
}

log('=============================private class fields========================')

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


// log('=============================computed field values========================')

// var counter = 0;
// class Widget {
//     id = ++counter;
//     createdAt = Date.now();
// }

// var w1 = new Widget();
// var w2 = new Widget();
// log('w1.id = ' + w1.id);
// log('w2.id = ' + w2.id);
// log('ids are unique = ' + (w1.id !== w2.id));

// log('=============================inheritance with fields========================')

// class Animal {
//     name;
//     sound = 'silence';

//     constructor(name) {
//         this.name = name;
//     }

//     speak() {
//         return this.name + ' says ' + this.sound;
//     }
// }

// class Dog extends Animal {
//     sound = 'woof';
//     tricks = [];

//     constructor(name) {
//         super(name);
//     }

//     addTrick(trick) {
//         this.tricks.push(trick);
//     }
// }

// var dog = new Dog('Rex');
// log('dog.speak() = ' + dog.speak());
// dog.addTrick('sit');
// dog.addTrick('shake');
// log('dog.tricks = ' + dog.tricks.join(', '));

// log('=============================private methods========================')

// class Validator {
//     #rules = [];

//     addRule(fn) {
//         this.#rules.push(fn);
//     }

//     #runRules(value) {
//         return this.#rules.every(function(fn) { return fn(value); });
//     }

//     validate(value) {
//         return this.#runRules(value);
//     }
// }

// var v = new Validator();
// v.addRule(function(x) { return x > 0; });
// v.addRule(function(x) { return x < 100; });
// log('validate(50) = ' + v.validate(50));
// log('validate(200) = ' + v.validate(200));