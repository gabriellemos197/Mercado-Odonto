var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// Page
import { OrderPage } from '../order/order';
import { Storage } from '@ionic/storage';
var ThankPage = (function () {
    function ThankPage(navCtrl, navParams, storage) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.OrderPage = OrderPage;
        this.id = navParams.get('id');
        storage.get('login').then(function (val) {
            if (val && val['token'])
                _this.isLogin = true;
        });
    }
    ThankPage.prototype.backtohome = function () {
        this.navCtrl.popToRoot();
    };
    return ThankPage;
}());
ThankPage = __decorate([
    Component({
        selector: 'page-thank',
        templateUrl: 'thank.html'
    }),
    __metadata("design:paramtypes", [NavController, NavParams, Storage])
], ThankPage);
export { ThankPage };
//# sourceMappingURL=thank.js.map