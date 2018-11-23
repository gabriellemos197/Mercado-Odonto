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
import { Http, Headers } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from 'ng2-translate';
var ChangepasswordPage = (function () {
    function ChangepasswordPage(navCtrl, storage, http, core, formBuilder, translate, Toast) {
        var _this = this;
        this.storage = storage;
        this.http = http;
        this.core = core;
        this.formBuilder = formBuilder;
        this.translate = translate;
        this.Toast = Toast;
        this.wordpress_user = wordpress_url + '/wp-json/mobiconnector/user/';
        this.type = 'password';
        this.check = false;
        storage.get('login').then(function (val) {
            if (val && val["token"]) {
                _this.login = val;
                core.showLoading();
                storage.get('user').then(function (user) {
                    core.hideLoading();
                    if (user && user["ID"]) {
                        _this.data = user;
                        _this.formChange = formBuilder.group({
                            user_pass: ['', Validators.required],
                            re_password: ['', Validators.required],
                        });
                    }
                    else
                        navCtrl.pop();
                });
            }
            else
                navCtrl.pop();
        });
    }
    ChangepasswordPage.prototype.save = function () {
        var _this = this;
        this.core.showLoading();
        var params = this.formChange.value;
        if (params["user_pass"] == params["re_password"]) {
            params = this.core.objectToURLParams(params);
            var headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            this.http.post(this.wordpress_user + 'update_profile', params, {
                headers: headers,
                withCredentials: true
            }).subscribe(function (res) {
                _this.core.hideLoading();
                _this.storage.set('user', res.json());
                _this.translate.get('profile.update_successfully').subscribe(function (trans) {
                    _this.Toast.showShortBottom(trans).subscribe(function (toast) { }, function (error) { console.log(error); });
                });
            }), function (err) {
                _this.core.hideLoading();
                _this.Toast.showShortBottom(err.json()["message"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            };
        }
        else {
            this.core.hideLoading();
            this.translate.get('profile.error').subscribe(function (trans) {
                _this.Toast.showShortBottom(trans).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        }
    };
    ChangepasswordPage.prototype.show_hide_Pass = function () {
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
    return ChangepasswordPage;
}());
ChangepasswordPage = __decorate([
    Component({
        selector: 'page-changepassword',
        templateUrl: 'changepassword.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        Storage,
        Http,
        Core,
        FormBuilder,
        TranslateService,
        Toast])
], ChangepasswordPage);
export { ChangepasswordPage };
//# sourceMappingURL=changepassword.js.map