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
import { AlertController, Platform, NavController } from 'ionic-angular';
import { Http } from '@angular/http';
// Custom
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { StorageMulti } from '../../service/storage-multi.service';
import { Config } from '../../service/config.service';
// Page
import { SigninPage } from '../signin/signin';
import { OrderPage } from '../order/order';
import { FavoritePage } from '../favorite/favorite';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { CartPage } from '../cart/cart';
// const wordpress_order = wordpress_url+'/wp-json/wooconnector/order';
var AccountPage = (function () {
    function AccountPage(storage, navCtrl, storageMulti, alertCtrl, translate, platform, http, config) {
        this.storage = storage;
        this.navCtrl = navCtrl;
        this.storageMulti = storageMulti;
        this.alertCtrl = alertCtrl;
        this.translate = translate;
        this.platform = platform;
        this.http = http;
        this.config = config;
        this.Signin = SigninPage;
        this.Profile = ProfilePage;
        this.Order = OrderPage;
        this.Favorite = FavoritePage;
        this.CartPage = CartPage;
        this.SettingPage = SettingPage;
        this.data = {};
        this.getData();
    }
    AccountPage.prototype.ionViewDidEnter = function () {
        if (this.isCache)
            this.getData();
        else
            this.isCache = true;
    };
    AccountPage.prototype.getData = function () {
        var _this = this;
        // this.isLogin = true;
        this.storageMulti.get(['login', 'user']).then(function (val) {
            if (val) {
                if (val["login"] && val["login"]["token"]) {
                    _this.data["login"] = val["login"];
                    _this.isLogin = true;
                }
                if (val["user"])
                    _this.data["user"] = val["user"];
            }
        });
    };
    AccountPage.prototype.signOut = function () {
        var _this = this;
        this.translate.get('account.signout').subscribe(function (trans) {
            var confirm = _this.alertCtrl.create({
                message: trans["message"],
                cssClass: 'alert-no-title alert-signout',
                buttons: [
                    {
                        text: trans["no"],
                    },
                    {
                        text: trans["yes"],
                        cssClass: 'dark',
                        handler: function () {
                            _this.storage.remove('login').then(function () {
                                _this.isLogin = false;
                                _this.navCtrl.popToRoot();
                            });
                        }
                    }
                ]
            });
            confirm.present();
        });
    };
    AccountPage.prototype.onSwipeContent = function (e) {
        if (e['deltaX'] < -150 || e['deltaX'] > 150) {
            if (e['deltaX'] < 0)
                this.navCtrl.push(this.SettingPage);
            else
                this.navCtrl.push(this.CartPage);
        }
    };
    return AccountPage;
}());
AccountPage = __decorate([
    Component({
        selector: 'page-account',
        templateUrl: 'account.html',
        providers: [StorageMulti]
    }),
    __metadata("design:paramtypes", [Storage,
        NavController,
        StorageMulti,
        AlertController,
        TranslateService,
        Platform,
        Http,
        Config])
], AccountPage);
export { AccountPage };
//# sourceMappingURL=account.js.map