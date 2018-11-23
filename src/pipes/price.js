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
var Price = (function () {
    function Price(config) {
        this.config = config;
        this.currency = config['currency'];
    }
    Price.prototype.transform = function (value) {
        var _value = Number(value);
        if (!_value)
            _value = 0;
        if (this.currency) {
            _value = Number(value).toFixed(this.currency['number_of_decimals']);
            _value = _value.split('.');
            _value.splice(1, 0, this.currency['decimal_separator']);
            _value[0] = _value[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.currency['thousand_separator']);
            var symbol = document.createElement('textarea');
            symbol.innerHTML = this.currency['currency_symbol'];
            switch (this.currency['currency_position']) {
                case 'left':
                    _value.unshift(symbol.value);
                    break;
                case 'left_space':
                    _value.unshift(symbol.value + ' ');
                    break;
                case 'right':
                    _value.push(symbol.value);
                    break;
                case 'right_space':
                    _value.push(' ' + symbol.value);
                    break;
            }
            _value = _value.join('');
        }
        return _value;
    };
    return Price;
}());
Price = __decorate([
    Pipe({
        name: 'price'
    }),
    Injectable(),
    __metadata("design:paramtypes", [Config])
], Price);
export { Price };
//# sourceMappingURL=price.js.map