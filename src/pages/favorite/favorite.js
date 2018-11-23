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
import { AlertController, NavController } from 'ionic-angular';
// Custom
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { DetailPage } from '../detail/detail';
var FavoritePage = (function () {
    function FavoritePage(storage, alertCtrl, translate, navCtrl) {
        var _this = this;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.translate = translate;
        this.navCtrl = navCtrl;
        this.DetailPage = DetailPage;
        this.data = {};
        storage.get('favorite').then(function (val) {
            _this.data = val;
            console.log(_this.data);
        });
    }
    FavoritePage.prototype.clear = function () {
        var _this = this;
        var favoriteClearTrans;
        this.translate.get('favorite.clear').subscribe(function (val) {
            favoriteClearTrans = val;
            var confirm = _this.alertCtrl.create({
                message: favoriteClearTrans["message"],
                cssClass: 'alert-no-title alert-signout',
                buttons: [
                    {
                        text: favoriteClearTrans["no"],
                    },
                    {
                        text: favoriteClearTrans["yes"],
                        cssClass: 'dark',
                        handler: function () {
                            _this.storage.remove('favorite').then(function () { _this.data = {}; });
                        }
                    }
                ]
            });
            confirm.present();
        });
    };
    FavoritePage.prototype.shop = function () {
        this.navCtrl.popToRoot();
    };
    FavoritePage.prototype.delete = function (id) {
        var data = Object.assign({}, this.data);
        delete data[Number(id)];
        this.data = data;
        this.storage.set('favorite', this.data);
    };
    return FavoritePage;
}());
FavoritePage = __decorate([
    Component({
        selector: 'page-favorite',
        templateUrl: 'favorite.html',
    }),
    __metadata("design:paramtypes", [Storage,
        AlertController,
        TranslateService,
        NavController])
], FavoritePage);
export { FavoritePage };
//# sourceMappingURL=favorite.js.map