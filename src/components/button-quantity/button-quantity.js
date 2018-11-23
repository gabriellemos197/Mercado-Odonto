var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, forwardRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
var noop = function () { };
export var CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return ButtonQuantityComponent; }),
    multi: true
};
var ButtonQuantityComponent = (function () {
    function ButtonQuantityComponent() {
        this.update = new EventEmitter();
        this.innerValue = 1;
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
    }
    ButtonQuantityComponent.prototype.ngOnInit = function () {
        if (this.min)
            this.min = Number(this.min);
        else
            this.min = 1;
        if (this.max)
            this.max = Number(this.max);
        else
            this.max = 2147483647;
    };
    Object.defineProperty(ButtonQuantityComponent.prototype, "value", {
        get: function () {
            return Number(this.innerValue);
        },
        set: function (v) {
            if (v == null)
                return;
            if (v < this.min)
                v = this.min;
            if (v > this.max)
                v = this.max;
            if (Number.isInteger(Number(v)) && v !== this.innerValue) {
                this.innerValue = Number(v);
                this.onChangeCallback(Number(v));
                this.inputBlur();
            }
            else if (v)
                this.inputBlur();
        },
        enumerable: true,
        configurable: true
    });
    ;
    ButtonQuantityComponent.prototype.onBlur = function () {
        this.onTouchedCallback();
    };
    ButtonQuantityComponent.prototype.writeValue = function (value) {
        if (value !== this.innerValue) {
            this.innerValue = Number(value);
        }
    };
    ButtonQuantityComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    ButtonQuantityComponent.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    ButtonQuantityComponent.prototype.minus = function () {
        if (this.innerValue > this.min)
            this.value = Number(this.innerValue) - 1;
        this.update.emit(Number(this.value));
    };
    ButtonQuantityComponent.prototype.plus = function () {
        if (this.innerValue < this.max)
            this.value = Number(this.innerValue) + 1;
        this.update.emit(Number(this.value));
    };
    ButtonQuantityComponent.prototype.inputBlur = function (update) {
        if (update === void 0) { update = false; }
        this.input['nativeElement'].value = Number(this.value);
        if (update)
            this.update.emit(Number(this.value));
    };
    return ButtonQuantityComponent;
}());
__decorate([
    ViewChild('input'),
    __metadata("design:type", Object)
], ButtonQuantityComponent.prototype, "input", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], ButtonQuantityComponent.prototype, "min", void 0);
__decorate([
    Input(),
    __metadata("design:type", Number)
], ButtonQuantityComponent.prototype, "max", void 0);
__decorate([
    Output(),
    __metadata("design:type", EventEmitter)
], ButtonQuantityComponent.prototype, "update", void 0);
ButtonQuantityComponent = __decorate([
    Component({
        selector: 'button-quantity',
        templateUrl: 'button-quantity.html',
        providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
    })
], ButtonQuantityComponent);
export { ButtonQuantityComponent };
//# sourceMappingURL=button-quantity.js.map