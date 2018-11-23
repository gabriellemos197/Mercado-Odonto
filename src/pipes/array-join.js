var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Pipe } from '@angular/core';
var ArrayJoin = (function () {
    function ArrayJoin() {
    }
    ArrayJoin.prototype.transform = function (value, args) {
        if (args === void 0) { args = ', '; }
        if (value)
            return value.join(args);
    };
    return ArrayJoin;
}());
ArrayJoin = __decorate([
    Pipe({
        name: 'ArrayJoin'
    }),
    Injectable()
], ArrayJoin);
export { ArrayJoin };
//# sourceMappingURL=array-join.js.map