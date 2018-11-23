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
import { TranslateService } from 'ng2-translate';
import { DatePipe } from '@angular/common';
var TimeAgo = (function () {
    function TimeAgo(translate, datePipe) {
        var _this = this;
        this.datePipe = datePipe;
        translate.get('general.timeAgo').subscribe(function (trans) { return _this.trans = trans; });
    }
    TimeAgo.prototype.transform = function (value) {
        var _value;
        var ago = (new Date().getTime() - new Date(value).getTime()) / 1000;
        if (ago < 0)
            _value = this.datePipe.transform(value, date_format);
        else if (ago < 3600) {
            _value = Math.floor(ago / 60);
            if (_value < 2)
                _value += this.trans['minute'];
            else
                _value += this.trans['minutes'];
        }
        else if (ago < 86400) {
            _value = Math.floor(ago / 3600);
            if (_value < 2)
                _value += this.trans['hour'];
            else
                _value += this.trans['hours'];
        }
        else if (ago < 2592000) {
            _value = Math.floor(ago / 86400);
            if (_value < 2)
                _value += this.trans['day'];
            else
                _value += this.trans['days'];
        }
        else
            _value = this.datePipe.transform(value, date_format);
        return _value;
    };
    return TimeAgo;
}());
TimeAgo = __decorate([
    Pipe({
        name: 'timeAgo'
    }),
    Injectable(),
    __metadata("design:paramtypes", [TranslateService, DatePipe])
], TimeAgo);
export { TimeAgo };
//# sourceMappingURL=time-ago.js.map