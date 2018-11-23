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
import { NavController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Http } from '@angular/http';
//custom
import { TranslateService } from 'ng2-translate';
import { Toast } from '@ionic-native/toast';
import { SigninPage } from '../signin/signin';
import { CoreValidator } from '../../validator/core';
import { Core } from '../../service/core.service';
var SignupPage = (function () {
    function SignupPage(navCtrl, formBuilder, http, core, translate, Toast) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.formBuilder = formBuilder;
        this.http = http;
        this.core = core;
        this.Toast = Toast;
        this.SigninPage = SigninPage;
        this.type = 'password';
        this.check = false;
        translate.get('signup').subscribe(function (trans) { return _this.trans = trans; });
        this.formSignup = formBuilder.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
            password: ['', Validators.required],
            repass: ['', Validators.compose([Validators.required, CoreValidator.confirmPassword])]
        });
    }
    SignupPage.prototype.register = function () {
        var _this = this;
        var params = this.formSignup.value;
        params["display_name"] = params["first_name"] + ' ' + params["last_name"];
        params = this.core.objectToURLParams(params);
        this.core.showLoading();
        this.http.post(wordpress_url + '/wp-json/mobiconnector/user/register', params)
            .subscribe(function (res) {
            _this.core.hideLoading();
            _this.Toast.showShortBottom(_this.trans["success"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            _this.gotoLogin();
        }, function (err) {
            _this.core.hideLoading();
            _this.Toast.showShortBottom(err.json()["message"]).subscribe(function (toast) { }, function (error) { console.log(error); });
        });
    };
    SignupPage.prototype.gotoLogin = function () {
        if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.SigninPage)
            this.navCtrl.pop();
        else
            this.navCtrl.push(this.SigninPage);
    };
    SignupPage.prototype.show_hide_Pass = function () {
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
    return SignupPage;
}());
SignupPage = __decorate([
    Component({
        selector: 'page-signup',
        templateUrl: 'signup.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        FormBuilder,
        Http,
        Core,
        TranslateService,
        Toast])
], SignupPage);
export { SignupPage };
//# sourceMappingURL=signup.js.map