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
import { ViewController, NavParams, NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from 'ng2-translate';
// Page
import { SigninPage } from '../signin/signin';
var RatingPage = (function () {
    function RatingPage(navCtrl, viewCtrl, navParams, http, core, storage, translate, Toast) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.viewCtrl = viewCtrl;
        this.navParams = navParams;
        this.http = http;
        this.core = core;
        this.storage = storage;
        this.Toast = Toast;
        this.SigninPage = SigninPage;
        this.login = {};
        translate.get('rating').subscribe(function (trans) { return _this.trans = trans; });
        this.id = navParams.get("id");
        this.login = navParams.get("login");
        this.user = navParams.get("user");
    }
    RatingPage.prototype.dismiss = function (reload) {
        if (reload === void 0) { reload = false; }
        this.viewCtrl.dismiss(reload);
    };
    RatingPage.prototype.closepopup = function () {
        this.viewCtrl.dismiss(this.id);
    };
    RatingPage.prototype.rating = function () {
        var _this = this;
        var params = {
            product: this.id,
            comment: this.comment,
            ratestar: this.ratingValue,
            namecustomer: this.user['display_name'],
            emailcustomer: this.user['user_email']
        };
        var option = {};
        if (this.login && this.login["token"]) {
            var headers = new Headers();
            headers.set('Content-Type', 'application/json; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            option['headers'] = headers,
                option['withCredentials'] = true;
        }
        this.core.showLoading();
        this.http.post(wordpress_url + '/wp-json/wooconnector/product/postreviews', params, option)
            .subscribe(function (res) {
            _this.core.hideLoading();
            if (res.json()["result"] == "success")
                _this.closepopup();
            else
                _this.Toast.showShortBottom(_this.trans["fail"]).subscribe(function (toast) { }, function (error) { console.log(error); });
        }, function (err) {
            _this.core.hideLoading();
            _this.Toast.showShortBottom(err.json()['message']).subscribe(function (toast) { }, function (error) { console.log(error); });
        });
    };
    return RatingPage;
}());
RatingPage = __decorate([
    Component({
        selector: 'page-rating',
        templateUrl: 'rating.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        ViewController,
        NavParams,
        Http,
        Core,
        Storage,
        TranslateService,
        Toast])
], RatingPage);
export { RatingPage };
//# sourceMappingURL=rating.js.map