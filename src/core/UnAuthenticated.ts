/**
 * An error that will be thrown if the authentication process
 * was failed.
 */
export default class UnAuthenticated extends Error {
    public get code() {
        return 401;
    }
}
