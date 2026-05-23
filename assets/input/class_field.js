class Point {
    x = 0;
    y = 0;
    label = 'origin';

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return this.label + ': (' + this.x + ', ' + this.y + ')';
    }
}
