var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Pipe } from '@angular/core';
var ObjectToArray = (function () {
    function ObjectToArray() {
    }
    ObjectToArray.prototype.transform = function (object, args) {
        if (args === void 0) { args = null; }
        var array = [];
        if (object) {
            Object.keys(object).forEach(function (key) {
                if (args)
                    array.push(key);
                else
                    array.push(object[key]);
            });
        }
        return array;
    };
    return ObjectToArray;
}());
ObjectToArray = __decorate([
    Pipe({
        name: 'ObjectToArray'
    }),
    Injectable()
], ObjectToArray);
export { ObjectToArray };
//# sourceMappingURL=object-to-array.js.map