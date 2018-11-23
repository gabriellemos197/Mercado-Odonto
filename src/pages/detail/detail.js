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
import { NavController, NavParams, ModalController, AlertController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from 'ng2-translate';
import { PhotoViewer } from '@ionic-native/photo-viewer';
//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
//Page
import { CommentPage } from '../comment/comment';
import { SigninPage } from '../signin/signin';
//Page
import { CartPage } from '../cart/cart';
import { RatingPage } from '../rating/rating';
var DetailPage = DetailPage_1 = (function () {
    function DetailPage(navParams, core, http, storage, translate, modalCtrl, navCtrl, alertCtrl, Toast, SocialSharing, photoViewer, platform) {
        var _this = this;
        this.core = core;
        this.http = http;
        this.storage = storage;
        this.modalCtrl = modalCtrl;
        this.navCtrl = navCtrl;
        this.alertCtrl = alertCtrl;
        this.Toast = Toast;
        this.SocialSharing = SocialSharing;
        this.photoViewer = photoViewer;
        this.platform = platform;
        this.CommentPage = CommentPage;
        this.DetailPage = DetailPage_1;
        this.RatingPage = RatingPage;
        this.CartPage = CartPage;
        this.SigninPage = SigninPage;
        this.slides = 1;
        this.quantity = 1;
        this.detail = { wooconnector_crop_images: [] };
        this.attributes = {};
        this.favorite = {};
        this.trans = {};
        this.viewMore = false;
        this.showmore = false;
        this.checkFavorite = false;
        this.count = 0;
        translate.get('detail').subscribe(function (trans) { return _this.trans = trans; });
        this.id = navParams.get("id");
        this.storage.get('favorite').then(function (val) { if (val)
            _this.favorite = val; });
        this.getData();
        this.getCommnentProduct(this.id);
    }
    DetailPage.prototype.getData = function () {
        var _this = this;
        var params = { product_id: this.id };
        this.core.showLoading();
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(function (res) {
            _this.detail = res.json();
            if (!_this.detail['wooconnector_crop_images']) {
                var noImages = { wooconnector_large: 'assets/images/no-image.png' };
                _this.detail['wooconnector_crop_images'] = [];
                _this.detail['wooconnector_crop_images'].push(noImages);
            }
            if (_this.detail['type'] == 'grouped') {
                _this.groupedProduct = _this.detail['grouped_products'].slice();
                _this.groupedProduct.forEach(function (product) {
                    product['quantity'] = 1;
                });
            }
            if (_this.detail['type'] == 'variable')
                _this.images = _this.detail['wooconnector_crop_images'].slice();
            //create attributes
            _this.detail.attributes.forEach(function (val) {
                if (val["variation"]) {
                    _this.attributes[val["name"]] = {};
                    _this.attributes[val["name"]].id = val["id"];
                    _this.attributes[val["name"]].name = val["name"];
                    _this.attributes[val["name"]].option = val["options"][0].toLowerCase();
                }
            });
            //default_attributes
            if (_this.detail.default_attributes.length > 0) {
                _this.detail.default_attributes.forEach(function (val) {
                    _this.attributes[val["name"]].option = val["option"].toLowerCase();
                });
            }
            console.log(_this.detail);
            _this.getVariation();
            _this.http.get(wordpress_url + '/wp-json/mobiconnector/post/counter_view?post_id=' + _this.id)
                .subscribe(function () { _this.core.hideLoading(); });
        });
    };
    DetailPage.prototype.changeSlides = function (event) {
        this.slides = event.realIndex + 1;
    };
    DetailPage.prototype.changeFavorite = function () {
        var _this = this;
        if (this.favorite[Number(this.id)]) {
            delete this.favorite[Number(this.id)];
            this.storage.set('favorite', this.favorite).then(function () {
                _this.Toast.showShortBottom(_this.trans["favorite"]["remove"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        }
        else {
            var data = {
                id: this.id,
                name: this.detail["name"],
                on_sale: this.detail["on_sale"],
                price_html: this.detail["price_html"],
                regular_price: this.detail["regular_price"],
                sale_price: this.detail["sale_price"],
                price: this.detail["price"],
                type: this.detail["type"],
                rating_count: this.detail['rating_count'],
                total_sales: this.detail['total_sales']
            };
            if (this.detail["wooconnector_crop_images"])
                data['images'] = this.detail["wooconnector_crop_images"][0].wooconnector_medium;
            this.favorite[Number(this.id)] = data;
            this.storage.set('favorite', this.favorite).then(function () {
                _this.Toast.showShortBottom(_this.trans["favorite"]["add"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            });
        }
    };
    DetailPage.prototype.share = function () {
        this.SocialSharing.share(null, null, null, this.detail["permalink"]);
    };
    DetailPage.prototype.showViewer = function (url, title, option) {
        if (!this.platform.is('cordova'))
            return;
        this.photoViewer.show(url, title, option);
    };
    DetailPage.prototype.getVariation = function () {
        var _this = this;
        if (this.detail["type"] == "variable" && this.detail["variations"].length > 0) {
            var attr = new ObjectToArray().transform(this.attributes);
            this.core.getVariation(this.detail["variations"], attr).subscribe(function (res) {
                if (res) {
                    _this.variation = res["id"];
                    var _res = Object.assign({}, res);
                    delete _res["id"];
                    delete _res["attributes"];
                    _res['wooconnector_crop_images'] = _res['wooconnector_crop_images'].concat(_this.images);
                    _this.detail = Object.assign(_this.detail, _res);
                }
                else {
                    _this.variation = 0;
                    _this.noVariation();
                }
            });
        }
    };
    DetailPage.prototype.noVariation = function () {
        this.Toast.showShortBottom(this.trans["have_not_variation"]).subscribe(function (toast) { }, function (error) { console.log(error); });
    };
    DetailPage.prototype.popToRoot = function () {
        this.navCtrl.popToRoot();
    };
    DetailPage.prototype.showMoreInfo = function () {
        if (this.showmore) {
            this.showmore = false;
            console.log(this.showmore);
        }
        else {
            this.showmore = true;
        }
    };
    DetailPage.prototype.getCommnentProduct = function (id) {
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
            console.log(_this.comments["reviews"]);
        });
    };
    DetailPage.prototype.showRating = function () {
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
    DetailPage.prototype.grouped = function () {
        var _this = this;
        if (this.groupedProduct) {
            this.storage.get('cart').then(function (val) {
                if (!val)
                    val = {};
                var alertContent = '';
                _this.groupedProduct.forEach(function (product) {
                    if (product['type'] == 'simple' && product['quantity'] > 0) {
                        if (product['manage_stock'] && product['quantity'] >= product['stock_quantity'] && !product['backorders_allowed']) {
                            alertContent += product['title'] + ' ' + _this.trans['out_of_quantity'] + product['stock_quantity'] + '<br/>';
                        }
                        else {
                            if (!val[product['id']]) {
                                var now = {};
                                now['idCart'] = product['id'];
                                now['id'] = product['id'];
                                now['name'] = product['title'];
                                if (product['wooconnector_crop_images'])
                                    now['images'] = product['wooconnector_crop_images'].wooconnector_medium;
                                now['regular_price'] = product['regular_price'];
                                now['sale_price'] = product['sale_price'];
                                now['price'] = product['price'];
                                now['quantity'] = Number(product['quantity']);
                                now['sold_individually'] = product['sold_individually'];
                                val[product['id']] = now;
                            }
                            else {
                                if (!product['sold_individually'])
                                    val[product['id']]['quantity'] += product['quantity'];
                                else
                                    alertContent += _this.trans['individually']['before'] + product['title'] + _this.trans['individually']['after'] + '<br/>';
                            }
                            product['quantity'] = 1;
                        }
                    }
                });
                _this.storage.set('cart', val).then(function () {
                    _this.buttonCart.update();
                    // this.buttonCartFooter.updatecartfooter();
                    if (alertContent != '') {
                        var alert_1 = _this.alertCtrl.create({
                            cssClass: 'alert-no-title',
                            message: alertContent,
                            buttons: [_this.trans['grouped']['button']]
                        });
                        alert_1.present();
                    }
                    else {
                        _this.Toast.showShortBottom(_this.trans["add"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                    }
                });
            });
        }
    };
    DetailPage.prototype.addToCart = function () {
        var _this = this;
        if (!this.detail['in_stock']) {
            this.Toast.showShortBottom(this.trans["outStock"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            return;
        }
        if (this.detail['type'] == 'external')
            this.external(this.detail['external_url']);
        else if (this.detail['type'] == 'grouped')
            this.grouped();
        else {
            if (this.detail["manage_stock"] && this.quantity > this.detail["stock_quantity"] && !this.detail['backorders_allowed']) {
                this.Toast.showShortBottom(this.trans["out_of_quantity"] + this.detail["stock_quantity"])
                    .subscribe(function (toast) { }, function (error) { console.log(error); });
                return;
            }
            var data_1 = {};
            var idCart_1 = this.id.toString();
            if (this.detail["type"] == "variable") {
                if (this.variation != 0) {
                    data_1.variation_id = this.variation;
                    idCart_1 += '_' + this.variation;
                }
                else {
                    this.noVariation();
                    return;
                }
            }
            data_1.idCart = idCart_1;
            data_1.id = this.detail["id"];
            data_1.name = this.detail["name"];
            if (this.detail["wooconnector_crop_images"])
                data_1.images = this.detail["wooconnector_crop_images"][0].wooconnector_medium;
            data_1.attributes = this.attributes;
            data_1.regular_price = this.detail["regular_price"];
            data_1.sale_price = this.detail["sale_price"];
            data_1.price = this.detail["price"];
            data_1.quantity = this.quantity;
            data_1.sold_individually = this.detail['sold_individually'];
            this.storage.get('cart').then(function (val) {
                var individually = false;
                if (!val)
                    val = {};
                if (!val[idCart_1])
                    val[idCart_1] = data_1;
                else {
                    if (!_this.detail['sold_individually'])
                        val[idCart_1].quantity += data_1.quantity;
                    else
                        individually = true;
                }
                if (individually) {
                    _this.Toast.showShortBottom(_this.trans['individually']['before'] + _this.detail['name'] + _this.trans['individually']['after']).subscribe(function (toast) { }, function (error) { console.log(error); });
                }
                else
                    _this.storage.set('cart', val).then(function () {
                        _this.buttonCart.update();
                        // this.buttonCartFooter.updatecartfooter();
                        if (!_this.detail['in_stock'] && _this.detail['backorders'] == 'notify') {
                            _this.Toast.showShortBottom(_this.trans["addOut"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                        }
                        else {
                            _this.Toast.showShortBottom(_this.trans["add"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                        }
                    });
            });
        }
    };
    // end addtocart
    DetailPage.prototype.gotoCart = function () {
        if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.CartPage)
            this.navCtrl.pop();
        else
            this.navCtrl.push(this.CartPage);
    };
    DetailPage.prototype.external = function (link) {
        cordova["InAppBrowser"].open(link, '_system');
    };
    DetailPage.prototype.onSwipe = function (e) {
        var _this = this;
        if (e['deltaX'] < -150 || e['deltaX'] > 150) {
            if (e['deltaX'] > 0 && this.detail['wooconnector_previous_product']) {
                this.navCtrl.push(this.DetailPage, { id: this.detail['wooconnector_previous_product'] }).then(function () {
                    _this.navCtrl.remove(_this.navCtrl.getActive().index - 1);
                });
            }
            else if (e['deltaX'] < 0 && this.detail['wooconnector_next_product']) {
                this.navCtrl.push(this.DetailPage, { id: this.detail['wooconnector_next_product'] }).then(function () {
                    _this.navCtrl.remove(_this.navCtrl.getActive().index - 1);
                });
            }
        }
    };
    return DetailPage;
}());
__decorate([
    ViewChild('cart'),
    __metadata("design:type", Object)
], DetailPage.prototype, "buttonCart", void 0);
DetailPage = DetailPage_1 = __decorate([
    Component({
        selector: 'page-detail',
        templateUrl: 'detail.html',
        providers: [Core, ObjectToArray, PhotoViewer]
    }),
    __metadata("design:paramtypes", [NavParams,
        Core,
        Http,
        Storage,
        TranslateService,
        ModalController,
        NavController,
        AlertController,
        Toast,
        SocialSharing,
        PhotoViewer,
        Platform])
], DetailPage);
export { DetailPage };
var DetailPage_1;
//# sourceMappingURL=detail.js.map