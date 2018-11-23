var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
// Custom
import { Storage } from '@ionic/storage';
var StorageMulti = (function () {
    function StorageMulti(storage) {
        this.storage = storage;
    }
    StorageMulti.prototype.get = function (keys) {
        var _this = this;
        var promises = [];
        keys.forEach(function (key) { return promises.push(_this.storage.get(key)); });
        return Promise.all(promises).then(function (values) {
            var result = {};
            values.map(function (value, index) {
                result[keys[index]] = value;
            });
            return result;
        });
    };
    StorageMulti.prototype.remove = function (keys) {
        var _this = this;
        var promises = [];
        keys.forEach(function (key) { return promises.push(_this.storage.remove(key)); });
        return Promise.all(promises);
    };
    return StorageMulti;
}());
StorageMulti = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Storage])
], StorageMulti);
export { StorageMulti };
//# sourceMappingURL=storage-multi.service.js.map