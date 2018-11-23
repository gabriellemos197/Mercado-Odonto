var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Pipe } from '@angular/core';
var Filter = (function () {
    function Filter() {
    }
    Filter.prototype.transform = function (items, args) {
        if (args) {
            for (var key in args) {
                if (args.hasOwnProperty(key)) {
                    items = items.filter(function (item) { return item[key] == args[key]; });
                }
            }
        }
        return items;
    };
    return Filter;
}());
Filter = __decorate([
    Pipe({
        name: 'filter'
    }),
    Injectable()
], Filter);
export { Filter };
//# sourceMappingURL=filter.js.map