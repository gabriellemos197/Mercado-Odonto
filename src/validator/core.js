var CoreValidator = (function () {
    function CoreValidator() {
    }
    CoreValidator.isEmail = function (control) {
        var regExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (!regExp.test(control.value)) {
            return { "invalidEmail": true };
        }
        return null;
    };
    CoreValidator.confirmPassword = function (control) {
        var e = control.root.value["password"];
        if (e && control.value != e) {
            return { "invalidEqual": true };
        }
        return null;
    };
    return CoreValidator;
}());
export { CoreValidator };
//# sourceMappingURL=core.js.map