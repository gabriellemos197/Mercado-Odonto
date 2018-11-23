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
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { Toast } from '@ionic-native/toast';
import { Core } from '../../service/core.service';
import { SigninPage } from '../signin/signin';
import { AccountPage } from '../account/account';
var ForgotPage = (function () {
    function ForgotPage(formBuilder, http, core, storage, navCtrl, alertCtrl, translate, Toast, navParams) {
        var _this = this;
        this.formBuilder = formBuilder;
        this.http = http;
        this.core = core;
        this.storage = storage;
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.Toast = Toast;
        this.navParams = navParams;
        this.wordpress_user = wordpress_url + '/wp-json/mobiconnector/user/forgot_password';
        this.SigninPage = SigninPage;
        this.AccountPage = AccountPage;
        this.trans = {};
        this.formForgot = formBuilder.group({
            email: ['', Validators.required],
        });
        translate.get('login').subscribe(function (trans) { if (trans)
            _this.trans = trans; });
    }
    ForgotPage.prototype.forgot = function () {
        var _this = this;
        this.core.showLoading();
        this.http.post(wordpress_url + '/wp-json/mobiconnector/user/forgot_password', this.core.objectToURLParams({ username: this.formForgot.value.email })).subscribe(function (res) {
            _this.core.hideLoading();
            _this.Toast.showShortBottom(_this.trans["forgot_success"]).subscribe(function (toast) { }, function (error) { console.log(error); });
        }, function (err) {
            _this.core.hideLoading();
            _this.Toast.showShortBottom(err.json()["message"]).subscribe(function (toast) { }, function (error) { console.log(error); });
        });
    };
    return ForgotPage;
}());
ForgotPage = __decorate([
    Component({
        selector: 'page-forgot',
        templateUrl: 'forgot.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [FormBuilder,
        Http,
        Core,
        Storage,
        NavController,
        AlertController,
        TranslateService,
        Toast,
        NavParams])
], ForgotPage);
export { ForgotPage };
//# sourceMappingURL=forgot.js.map