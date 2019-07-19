class Aborted extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}

module.exports = Aborted;
