export default class Aborted extends Error {
    constructor(public message: string) {
        super(message);
    }
}
