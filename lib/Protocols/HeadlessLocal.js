"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UnAuthenticated_1 = __importDefault(require("./../core/UnAuthenticated"));
class HeadlessLocal {
    constructor(options = { usernameField: 'username', passwordField: 'password' }) {
        this.options = options;
    }
    async resolve(context) {
        const usernameField = this.options['usernameField'] || 'username';
        const passwordField = this.options['passwordField'] || 'password';
        const username = context[usernameField];
        const password = context[passwordField];
        if (!username) {
            throw new UnAuthenticated_1.default("Username is required");
        }
        if (!password) {
            throw new UnAuthenticated_1.default("Password is required");
        }
        return { username, password };
    }
}
exports.default = HeadlessLocal;
