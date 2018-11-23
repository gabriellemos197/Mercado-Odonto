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
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
// Page
import { OrderdetailPage } from '../orderdetail/orderdetail';
import { SigninPage } from '../signin/signin';
var wordpress_order = wordpress_url + '/wp-json/wooconnector/order';
var OrderPage = (function () {
    function OrderPage(http, core, storage, navCtrl, Toast, navParams) {
        this.http = http;
        this.core = core;
        this.storage = storage;
        this.navCtrl = navCtrl;
        this.Toast = Toast;
        this.navParams = navParams;
        this.OrderdetailPage = OrderdetailPage;
        this.SigninPage = SigninPage;
        this.login = {};
        this.date_format = date_format;
        this.page = 1;
        this.checkOder = false;
    }
    OrderPage.prototype.ionViewDidEnter = function () {
        var _this = this;
        this.page = 1;
        this.storage.get('login').then(function (val) {
            if (val && val['token']) {
                _this.login = val;
                _this.getData().subscribe(function (order) {
                    if (order.length > 0)
                        _this.page++;
                    _this.data = order;
                });
            }
            else
                _this.navCtrl.push(SigninPage);
        });
    };
    OrderPage.prototype.getData = function (hide) {
        var _this = this;
        if (hide === void 0) { hide = false; }
        return new Observable(function (observable) {
            if (!hide)
                _this.core.showLoading();
            var params = { post_per_page: wordpress_per_page, post_num_page: _this.page };
            var headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + _this.login["token"]);
            _this.http.get(wordpress_order + '/getorderbyterm', {
                search: _this.core.objectToURLParams(params),
                headers: headers
            }).subscribe(function (res) {
                if (!hide)
                    _this.core.hideLoading();
                observable.next(res.json());
                observable.complete();
            }, function (err) {
                if (!hide)
                    _this.core.hideLoading();
                _this.Toast.showShortBottom(err.json()["message"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        });
    };
    OrderPage.prototype.shop = function () {
        this.navCtrl.popToRoot();
    };
    OrderPage.prototype.load = function (infiniteScroll) {
        var _this = this;
        this.getData(true).subscribe(function (order) {
            if (order.length > 0)
                _this.page++;
            else
                _this.over = true;
            _this.data = _this.data.concat(order);
            infiniteScroll.complete();
        });
    };
    OrderPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        this.page = 1;
        this.getData(true).subscribe(function (order) {
            _this.over = false;
            if (order.length > 0)
                _this.page++;
            _this.data = order;
            refresher.complete();
        });
    };
    return OrderPage;
}());
OrderPage = __decorate([
    Component({
        selector: 'page-order',
        templateUrl: 'order.html'
    }),
    __metadata("design:paramtypes", [Http,
        Core,
        Storage,
        NavController,
        Toast,
        NavParams])
], OrderPage);
export { OrderPage };
//# sourceMappingURL=order.js.map