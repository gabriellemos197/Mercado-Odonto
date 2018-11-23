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
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Core } from '../../service/core.service';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { RatingPage } from '../rating/rating';
import { SigninPage } from '../signin/signin';
var CommentPage = (function () {
    function CommentPage(navCtrl, navParams, core, http, storage, modalCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.core = core;
        this.http = http;
        this.storage = storage;
        this.modalCtrl = modalCtrl;
        this.RatingPage = RatingPage;
        this.SigninPage = SigninPage;
        this.id = navParams.get('id');
        this.getCommnentProduct(this.id);
    }
    CommentPage.prototype.getCommnentProduct = function (id) {
        var _this = this;
        this.comments = { total: 0, details: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        var params = { product_id: this.id };
        this.core.showLoading();
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(function (res) {
            _this.comments["reviews"] = res.json()['wooconnector_reviews'];
            if (!_this.comments["reviews"])
                _this.comments["reviews"] = [];
            _this.core.hideLoading();
        });
    };
    CommentPage.prototype.showRating = function () {
        var _this = this;
        this.storage.get('login').then(function (login) {
            if (login) {
                _this.login = login;
                _this.storage.get('user').then(function (user) {
                    _this.user = user;
                    console.log(_this.user);
                    var modal = _this.modalCtrl.create(RatingPage, { id: _this.id, login: _this.login, user: _this.user });
                    modal.onDidDismiss(function (reload) {
                        // console.log(reload);
                        _this.getCommnentProduct(reload);
                    });
                    modal.present();
                });
            }
            else {
                _this.navCtrl.push(_this.SigninPage);
            }
        });
    };
    return CommentPage;
}());
CommentPage = __decorate([
    Component({
        selector: 'page-comment',
        templateUrl: 'comment.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Core,
        Http,
        Storage,
        ModalController])
], CommentPage);
export { CommentPage };
//# sourceMappingURL=comment.js.map