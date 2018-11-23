var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
// Custom
import { Storage } from '@ionic/storage';
import { StorageMulti } from '../../service/storage-multi.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
// Page
import { AddressPage } from '../address/address';
import { SigninPage } from '../signin/signin';
import { DetailPage } from '../detail/detail';
import { CheckoutPage } from '../checkout/checkout';
import { AccountPage } from '../account/account';
var CartPage = (function () {
    function CartPage(storage, storageMul, navCtrl, http, alertCtrl, core, translate, Toast) {
        var _this = this;
        this.storage = storage;
        this.storageMul = storageMul;
        this.navCtrl = navCtrl;
        this.http = http;
        this.alertCtrl = alertCtrl;
        this.core = core;
        this.translate = translate;
        this.Toast = Toast;
        this.AddressPage = AddressPage;
        this.SigninPage = SigninPage;
        this.DetailPage = DetailPage;
        this.CheckoutPage = CheckoutPage;
        this.AccountPage = AccountPage;
        this.tax = 0;
        this.coupon = [];
        this.trans = {};
        translate.get('cart').subscribe(function (trans) { return _this.trans = trans; });
        this.getData();
    }
    CartPage.prototype.ionViewDidEnter = function () {
        if (this.isCache)
            this.getData();
        else
            this.isCache = true;
    };
    CartPage.prototype.getData = function () {
        var _this = this;
        this.storageMul.get(['cart', 'coupon', 'login']).then(function (val) {
            if (val && val['cart'])
                _this.data = val['cart'];
            if (val && val['coupon'])
                _this.coupon = val['coupon'];
            _this.login = val['login'];
            if (_this.data && Object.keys(_this.data).length > 0)
                _this.validate();
        });
    };
    CartPage.prototype.shop = function () {
        this.navCtrl.popToRoot();
    };
    CartPage.prototype.delete = function (id) {
        var _this = this;
        var data = Object.assign({}, this.data);
        var cartTrans;
        this.translate.get('cart.clear').subscribe(function (val) {
            cartTrans = val;
            var confirm = _this.alertCtrl.create({
                message: cartTrans["message"],
                cssClass: 'alert-no-title alert-signout',
                buttons: [
                    {
                        text: cartTrans["no"],
                    },
                    {
                        text: cartTrans["yes"],
                        cssClass: 'dark',
                        handler: function () {
                            delete data[id];
                            _this.data = data;
                            // if (this.buttonFooter){
                            // }
                            _this.update();
                        }
                    }
                ]
            });
            confirm.present();
        });
    };
    CartPage.prototype.update = function () {
        var _this = this;
        this.storage.set('cart', this.data).then(function () {
            if (Object.keys(_this.data).length > 0)
                _this.validate();
            _ this.buttonCart.update();
        });
    };
    CartPage.prototype.validate = function () {
        var _this = this;
        this.core.showLoading();
        var params = {};
        var products = [];
        new ObjectToArray().transform(this.data).forEach(function (product) {
            var now = {};
            now['product_id'] = product['id'];
            now['quantity'] = product['quantity'];
            if (product['variation_id'])
                now['variation_id'] = product['variation_id'];
            products.push(now);
        });
        params['products'] = JSON.stringify(products);
        params['coupons'] = JSON.stringify(this.coupon);
        var option = {};
        if (this.login && this.login['token']) {
            var headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            option['withCredentials'] = true;
            option['headers'] = headers;
        }
        this.http.post(wordpress_url + '/wp-json/wooconnector/calculator/addcoupons', this.core.objectToURLParams(params), option)
            .subscribe(function (res) {
            console.log('aaa');
            var resp = res.json();
            _this.core.hideLoading();
            _this.tax = 0;
            if (resp['errors']) {
                var message_1 = '';
                for (var key in resp['errors']) {
                    if (resp['errors'][key] && resp['errors'][key]['errors']) {
                        for (var key1 in resp['errors'][key]['errors']) {
                            if (resp['errors'][key]['errors'][key1]) {
                                message_1 += resp['errors'][key]['errors'][key1][0];
                            }
                        }
                    }
                }
                if (resp['discount']) {
                    var coupon_1 = [];
                    resp['discount'].forEach(function (item) {
                        coupon_1.push(item['code']);
                    });
                    _this.storage.set('coupon', coupon_1).then(function () {
                        _this.coupon = coupon_1;
                        _this.showAlert(message_1);
                    });
                }
                else {
                    _this.showAlert(message_1);
                    _this.deletecoupon(key);
                }
            }
            else
                _this.invalid = false;
            if (resp['discount']) {
                if (Array.isArray(resp['tax']))
                    resp['tax'].forEach(function (tax) { return _this.tax += tax['value']; });
                _this.couponData = resp['discount'];
                _this.totalPayment = resp['total'];
            }
            else {
                resp['total'].forEach(function (product) { return _this.tax += product['tax']; });
                _this.totalPayment = _this.total() + _this.tax;
            }
        }, function (error) {
            if (error.json()['message']) {
                _this.couponData = [];
                _this.coupon.forEach(function (item) {
                    _this.couponData.push({ code: item });
                });
                _this.invalid = true;
                _this.core.hideLoading();
                _this.showAlert(error.json()['message']);
            }
        });
    };
    CartPage.prototype.deletecoupon = function (key) {
        var _this = this;
        var coupon = Object.assign([], this.coupon);
        var newcoupon = [];
        coupon.forEach(function (coupon) {
            if (coupon != key) {
                newcoupon.push(coupon);
            }
        });
        this.storage.set('coupon', newcoupon).then(function () {
            _this.coupon = newcoupon;
        });
    };
    CartPage.prototype.showAlert = function (message) {
        var alert = this.alertCtrl.create({
            message: message,
            cssClass: 'alert-no-title',
            buttons: [this.trans['validate']]
        });
        alert.present();
    };
    CartPage.prototype.apply = function () {
        var _this = this;
        if (this.couponCode && this.coupon.indexOf(this.couponCode) != -1) {
            this.Toast.showShortBottom(this.trans["already_applied"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            return;
        }
        this.core.showLoading();
        var params = {};
        var products = [];
        new ObjectToArray().transform(this.data).forEach(function (product) {
            var now = {};
            now['product_id'] = product['id'];
            now['quantity'] = product['quantity'];
            if (product['variation_id'])
                now['variation_id'] = product['variation_id'];
            products.push(now);
        });
        params['products'] = JSON.stringify(products);
        var coupon;
        if (this.couponCode && this.coupon.indexOf(this.couponCode) == -1)
            coupon = this.coupon.concat(this.couponCode);
        else
            coupon = this.coupon.slice();
        params['coupons'] = JSON.stringify(coupon);
        var option = {};
        if (this.login && this.login['token']) {
            var headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            option['withCredentials'] = true;
            option['headers'] = headers;
        }
        this.http.post(wordpress_url + '/wp-json/wooconnector/calculator/addcoupons', this.core.objectToURLParams(params), option)
            .subscribe(function (res) {
            var resp = res.json();
            // this.totalPayment = res.json()['total'];
            // console.log(this.totalPayment);
            _this.core.hideLoading();
            _this.tax = 0;
            if (resp['errors']) {
                var message = '';
                for (var key in resp['errors']) {
                    if (resp['errors'][key] && resp['errors'][key]['errors']) {
                        for (var key1 in resp['errors'][key]['errors']) {
                            if (resp['errors'][key]['errors'][key1]) {
                                message += resp['errors'][key]['errors'][key1][0];
                            }
                        }
                    }
                }
                if (resp['discount']) {
                    var coupon_2 = [];
                    resp['discount'].forEach(function (item) {
                        coupon_2.push(item['code']);
                    });
                    _this.storage.set('coupon', coupon_2).then(function () {
                        _this.coupon = coupon_2;
                        resp['tax'].forEach(function (product) { return _this.tax += product['value']; });
                    });
                }
                else {
                    resp['total'].forEach(function (product) { return _this.tax += product['tax']; });
                }
                _this.showAlert(message);
                // this.totalPayment = this.total() + this.tax ;
            }
            else {
                if (resp['discount']) {
                    if (Array.isArray(resp['tax']))
                        resp['tax'].forEach(function (tax) { return _this.tax += tax['value']; });
                    _this.totalPayment = resp['total'];
                    console.log(resp['total']);
                    _this.storage.set('coupon', coupon).then(function () {
                        _this.coupon = coupon;
                        _this.couponData = resp['discount'];
                        _this.couponCode = null;
                        _this.Toast.showShortBottom(_this.trans["add"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                    });
                    // this.totalPayment = this.total() + this.tax ;
                }
                else {
                    resp['total'].forEach(function (product) { return _this.tax += product['tax']; });
                    _this.totalPayment = _this.total() + _this.tax;
                }
            }
        }, function (error) {
            if (error.json()['message']) {
                _this.core.hideLoading();
                var alert_1 = _this.alertCtrl.create({
                    message: error.json()['message'],
                    cssClass: 'alert-no-title',
                    buttons: [_this.trans['validate']]
                });
                alert_1.present();
            }
        });
    };
    CartPage.prototype.remove = function (index) {
        var _this = this;
        if (this.coupon.length == 1) {
            this.storage.remove('coupon').then(function () {
                _this.coupon = [];
                _this.couponData = [];
                _this.validate();
                _this.Toast.showShortBottom(_this.trans["remove"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        }
        else {
            var coupon = this.coupon.slice(0);
            coupon.splice(Number(index), 1);
            this.storage.set('coupon', coupon).then(function () {
                _this.coupon.splice(Number(index), 1);
                _this.couponData.splice(Number(index), 1);
                _this.validate();
                _this.Toast.showShortBottom(_this.trans["remove"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        }
    };
    CartPage.prototype.total = function () {
        var total = 0;
        for (var key in this.data) {
            var product = this.data[key];
            if (Number(product.sale_price) > 0) {
                total += Number(product.sale_price) * product.quantity;
            }
            else {
                total += Number(product.regular_price) * product.quantity;
            }
        }
        return total;
    };
    CartPage.prototype.gotoAddress = function () {
        var _this = this;
        if (this.login)
            this.navCtrl.push(this.CheckoutPage, { total: this.totalPayment });
        else {
            var alert_2 = this.alertCtrl.create({
                message: this.trans['confirm']['message'],
                cssClass: 'alert-no-title alert-signout',
                buttons: [
                    {
                        text: this.trans['confirm']["no"],
                        cssClass: 'dark',
                        handler: function () {
                            _this.navCtrl.push(_this.CheckoutPage, { total: _this.totalPayment });
                        }
                    },
                    {
                        text: this.trans['confirm']["yes"],
                        handler: function () {
                            _this.navCtrl.push(_this.SigninPage);
                        }
                    }
                ]
            });
            alert_2.present();
        }
    };
    CartPage.prototype.onSwipeContent = function (e) {
        if (e['deltaX'] < -150 || e['deltaX'] > 150) {
            if (e['deltaX'] < 0)
                this.navCtrl.push(this.AccountPage);
            else
                this.navCtrl.popToRoot();
        }
    };
    return CartPage;
}());
__decorate([
    ViewChild('cart'),
    __metadata("design:type", Object)
], CartPage.prototype, "buttonCart", void 0);
__decorate([
    ViewChild('footer'),
    __metadata("design:type", Object)
], CartPage.prototype, "buttonFooter", void 0);
CartPage = __decorate([
    Component({
        selector: 'page-cart',
        templateUrl: 'cart.html',
        providers: [StorageMulti, Core, ObjectToArray]
    }),
    __metadata("design:paramtypes", [Storage,
        StorageMulti,
        NavController,
        Http,
        AlertController,
        Core,
        TranslateService,
        Toast])
], CartPage);
export { CartPage };
//# sourceMappingURL=cart.js.map