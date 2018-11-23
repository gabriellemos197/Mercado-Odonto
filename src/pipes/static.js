var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Pipe } from '@angular/core';
import { Config } from '../service/config.service';
var Static = (function () {
    function Static(config) {
        this.config = config;
        this.textStatic = {};
        if (this.textStatic["text_static"])
            this.textStatic = config['text_static'];
    }
    Static.prototype.transform = function (value) {
        if (this.textStatic[value])
            return this.textStatic[value];
        else
            return null;
    };
    return Static;
}());
Static = __decorate([
    Pipe({
        name: 'static',
    }),
    Injectable(),
    __metadata("design:paramtypes", [Config])
], Static);
export { Static };
//# sourceMappingURL=static.js.map