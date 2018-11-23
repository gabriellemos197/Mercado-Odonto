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
import { NavController, AlertController, NavParams, Nav } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { Toast } from '@ionic-native/toast';
//Page
import { SignupPage } from '../signup/signup';
import { ForgotPage } from '../forgot/forgot';
import { HomePage } from '../home/home';
var SigninPage = (function () {
    function SigninPage(navCtrl, formBuilder, http, core, storage, alertCtrl, translate, Toast, navParams, nav) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.formBuilder = formBuilder;
        this.http = http;
        this.core = core;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.Toast = Toast;
        this.navParams = navParams;
        this.nav = nav;
        this.wordpress_user = wordpress_url + '/wp-json/mobiconnector/user';
        this.SignupPage = SignupPage;
        this.ForgotPage = ForgotPage;
        this.HomePage = HomePage;
        this.trans = {};
        this.type = 'password';
        this.check = false;
        this.formLogin = formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
        translate.get('login').subscribe(function (trans) { if (trans)
            _this.trans = trans; });
        this.checkreturn = navParams.get('check');
    }
    SigninPage.prototype.login = function () {
        var _this = this;
        this.core.showLoading();
        this.http.post(wordpress_url + '/wp-json/jwt-auth/v1/token', this.formLogin.value)
            .subscribe(function (res) {
            var login = res.json();
            login.username = _this.formLogin.value.username;
            var params = _this.core.objectToURLParams({ 'username': login["username"] });
            _this.http.post(_this.wordpress_user + '/get_info', params)
                .subscribe(function (user) {
                _this.core.hideLoading();
                _this.Toast.showShortBottom(_this.trans["success"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                _this.storage.set('user', user.json()).then(function () {
                    _this.storage.set('login', login).then(function () {
                        if (_this.checkreturn == 'home') {
                            _this.navCtrl.popToRoot();
                        }
                        else {
                            _this.navCtrl.pop();
                        }
                    });
                });
            });
        }, function (err) {
            _this.core.hideLoading();
            _this.formLogin.patchValue({ password: null });
            _this.wrong = true;
        });
    };
    SigninPage.prototype.show_hide_Pass = function () {
        if (this.check) {
            this.check = false;
            this.type = 'password';
            console.log(this.type);
        }
        else {
            this.check = true;
            this.type = 'text';
        }
    };
    return SigninPage;
}());
SigninPage = __decorate([
    Component({
        selector: 'page-signin',
        templateUrl: 'signin.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        FormBuilder,
        Http,
        Core,
        Storage,
        AlertController,
        TranslateService,
        Toast,
        NavParams,
        Nav])
], SigninPage);
export { SigninPage };
//# sourceMappingURL=signin.js.map