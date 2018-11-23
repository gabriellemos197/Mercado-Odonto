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
import { NavController, NavParams, AlertController } from 'ionic-angular';
// Custom
import { Storage } from '@ionic/storage';
import { StorageMulti } from '../../service/storage-multi.service';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { OneSignal } from '@ionic-native/onesignal';
import { AccountPage } from '../account/account';
var SettingPage = (function () {
    function SettingPage(navCtrl, navParams, storage, storageMul, alertCtrl, translate, config, core, OneSignal) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.storage = storage;
        this.storageMul = storageMul;
        this.alertCtrl = alertCtrl;
        this.translate = translate;
        this.config = config;
        this.core = core;
        this.OneSignal = OneSignal;
        this.AccountPage = AccountPage;
        this.data = {};
        this.getData();
    }
    SettingPage.prototype.ionViewDidLoad = function () {
        if (this.isCache)
            this.getData();
        else
            this.isCache = true;
    };
    SettingPage.prototype.getData = function () {
        var _this = this;
        this.storageMul.get(['notification', 'text'])
            .then(function (val) {
            if (val) {
                if (val["notification"] != false)
                    _this.data["notification"] = true;
                else
                    _this.data["notification"] = false;
                if (val["text"])
                    _this.data["text"] = val["text"];
                else
                    _this.data["text"] = "normal";
            }
        });
    };
    SettingPage.prototype.notification = function () {
        var _this = this;
        this.storage.set('notification', this.data["notification"]).then(function () {
            _this.OneSignal.setSubscription(_this.data["notification"]);
        });
    };
    SettingPage.prototype.changeTextSize = function () {
        var _this = this;
        this.translate.get('setting.text_size').subscribe(function (trans) {
            var alert = _this.alertCtrl.create({
                title: trans["title"],
                cssClass: 'alert-text-size ' + _this.data["text"]
            });
            var _loop_1 = function (option) {
                alert.addButton({
                    text: trans["option"][option],
                    cssClass: option,
                    handler: function () { _this.updateTextSize(option); }
                });
            };
            for (var option in trans["option"]) {
                _loop_1(option);
            }
            alert.present();
        });
    };
    SettingPage.prototype.updateTextSize = function (text) {
        this.storage.set('text', text);
        var html = document.querySelector('html');
        html.className = text;
        this.data["text"] = text;
    };
    SettingPage.prototype.clearCache = function () {
    };
    SettingPage.prototype.onSwipeContent = function (e) {
        if (e['deltaX'] > 150)
            this.navCtrl.push(this.AccountPage);
    };
    return SettingPage;
}());
SettingPage = __decorate([
    Component({
        selector: 'page-setting',
        templateUrl: 'setting.html',
        providers: [StorageMulti, Core]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Storage,
        StorageMulti,
        AlertController,
        TranslateService,
        Config,
        Core,
        OneSignal])
], SettingPage);
export { SettingPage };
//# sourceMappingURL=setting.js.map