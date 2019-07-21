import {Protocol} from "../core";
import UnAuthenticated from "./../core/UnAuthenticated";

export default class HeadlessLocal implements Protocol {

    constructor(private options = {usernameField: 'username', passwordField: 'password'}) {
    }

    public async resolve(context: any) {
        const usernameField = this.options['usernameField'] || 'username';
        const passwordField = this.options['passwordField'] || 'password';

        const username = context[usernameField];
        const password = context[passwordField];

        if (!username) {
            throw new UnAuthenticated("Username is required");
        }

        if (!password) {
            throw new UnAuthenticated("Password is required");
        }

        return {username, password};
    }
}
