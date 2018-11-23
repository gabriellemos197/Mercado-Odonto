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
import { NavController, Platform, AlertController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
// import { GoogleMap, GoogleMaps, Geocoder, ILatLng, GeocoderRequest } from '@ionic-native/google-maps';
// import {GoogleMaps, GoogleMap, GoogleMapsEvent, Geocoder, LatLng, MarkerOptions,Marker, GeocoderRequest} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
// Custom
import { CoreValidator } from '../../validator/core';
import { Storage } from '@ionic/storage';
import { Config } from '../../service/config.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Core } from '../../service/core.service';
import { TranslateService } from 'ng2-translate';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Toast } from '@ionic-native/toast';
//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
import { ThankPage } from '../thank/thank';
import { SigninPage } from '../signin/signin';
var CheckoutPage = (function () {
    function CheckoutPage(storageMul, core, formBuilder, storage, navCtrl, navParams, http, platform, InAppBrowser, Toast, config, translate, Geolocation, LocationAccuracy, alertCtrl) {
        var _this = this;
        this.storageMul = storageMul;
        this.core = core;
        this.formBuilder = formBuilder;
        this.storage = storage;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.platform = platform;
        this.InAppBrowser = InAppBrowser;
        this.Toast = Toast;
        this.Geolocation = Geolocation;
        this.LocationAccuracy = LocationAccuracy;
        this.alertCtrl = alertCtrl;
        // AddressPage = AddressPage;
        this.SigninPage = SigninPage;
        this.ThankPage = ThankPage;
        this.login = {};
        this.data = {};
        this.countries = [];
        this.states = {};
        this.checkAdd = false;
        this.checkBill = false;
        this.coupon = [];
        this.chooselocation = {};
        this.params = {};
        this.activePayment = false;
        this.activeConfirm = false;
        translate.get('states').subscribe(function (trans) {
            if (trans == 'states')
                trans = {};
            if (config['countries'])
                _this.countries = config['countries'];
            _this.states = Object.assign(trans, config['states']);
        });
        translate.get('checkout.confirm_location').subscribe(function (trans) {
            _this.chooselocation = trans;
        });
        this.total_order = navParams.get('total');
        console.log(this.total_order);
        this.chooseGetLocation();
        this.formAddress = this.formBuilder.group({
            billing_first_name: ['', Validators.required],
            billing_last_name: ['', Validators.required],
            billing_company: [''],
            billing_address_1: ['', Validators.required],
            billing_address_2: [''],
            billing_city: ['', Validators.required],
            billing_country: ['', Validators.required],
            billing_state: [''],
            billing_postcode: ['', Validators.required],
            billing_phone: ['', Validators.required],
            user_email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
            shipping_first_name: ['', Validators.required],
            shipping_last_name: ['', Validators.required],
            shipping_company: [''],
            shipping_address_1: ['', Validators.required],
            shipping_address_2: [''],
            shipping_city: ['', Validators.required],
            shipping_country: ['', Validators.required],
            shipping_state: [''],
            shipping_postcode: ['', Validators.required]
        });
        this.getData();
        translate.get('general.has_error').subscribe(function (trans) { return _this.trans = trans; });
        // core.showLoading();
    }
    CheckoutPage.prototype.getData = function () {
        var _this = this;
        this.storageMul.get(['login', 'useBilling', 'user']).then(function (val) {
            if (val['login'])
                _this.login = val['login'];
            if (val['useBilling'] == false)
                _this.useBilling = false;
            else
                _this.useBilling = true;
            if (val['user']) {
                _this.data = val['user'];
                _this.changeCountryBilling(_this.data['billing_country']);
                _this.changeCountryShipping(_this.data['shipping_country']);
            }
            _this.reset();
        });
    };
    CheckoutPage.prototype.reset = function () {
        this.formAddress.patchValue({
            billing_first_name: this.data["billing_first_name"],
            billing_last_name: this.data["billing_last_name"],
            billing_company: this.data["billing_company"],
            billing_address_1: this.data["billing_address_1"],
            billing_address_2: this.data["billing_address_2"],
            billing_city: this.data["billing_city"],
            billing_country: this.data["billing_country"],
            billing_state: this.data["billing_state"],
            billing_postcode: this.data["billing_postcode"],
            billing_phone: this.data["billing_phone"],
            user_email: this.data["user_email"],
            shipping_first_name: this.data["shipping_first_name"],
            shipping_last_name: this.data["shipping_last_name"],
            shipping_company: this.data["shipping_company"],
            shipping_address_1: this.data["shipping_address_1"],
            shipping_address_2: this.data["shipping_address_2"],
            shipping_city: this.data["shipping_city"],
            shipping_country: this.data["shipping_country"],
            shipping_state: this.data["shipping_state"],
            shipping_postcode: this.data["shipping_postcode"]
        });
        this.rawData = Object.assign({}, this.formAddress.value);
        this.updateShipping();
    };
    CheckoutPage.prototype.updateShipping = function () {
        ;
        if (this.useBilling) {
            this.formAddress.patchValue({
                shipping_first_name: this.formAddress.value["billing_first_name"],
                shipping_last_name: this.formAddress.value["billing_last_name"],
                shipping_company: this.formAddress.value["billing_company"],
                shipping_address_1: this.formAddress.value["billing_address_1"],
                shipping_address_2: this.formAddress.value["billing_address_2"],
                shipping_city: this.formAddress.value["billing_city"],
                shipping_country: this.formAddress.value["billing_country"],
                shipping_state: this.formAddress.value["billing_state"],
                shipping_postcode: this.formAddress.value["billing_postcode"]
            });
        }
        else {
            this.formAddress.patchValue({
                shipping_first_name: this.data["shipping_first_name"],
                shipping_last_name: this.data["shipping_last_name"],
                shipping_company: this.data["shipping_company"],
                shipping_address_1: this.data["shipping_address_1"],
                shipping_address_2: this.data["shipping_address_2"],
                shipping_city: this.data["shipping_city"],
                shipping_country: this.data["shipping_country"],
                shipping_state: this.data["shipping_state"],
                shipping_postcode: this.data["shipping_postcode"]
            });
            this.changeCountryShipping(this.formAddress.value["shipping_country"]);
        }
    };
    CheckoutPage.prototype.checkUseBilling = function () {
        if (this.useBilling)
            this.updateShipping();
    };
    CheckoutPage.prototype.changeCountryBilling = function (e) {
        if (this.states[e]) {
            this.statesBilling = this.states[e];
            this.formAddress.setControl('billing_state', new FormControl('', Validators.required));
        }
        else {
            this.statesBilling = null;
            this.formAddress.setControl('billing_state', new FormControl(''));
        }
        if (this.useBilling)
            this.formAddress.patchValue({
                shipping_country: this.formAddress.value["billing_country"]
            });
    };
    CheckoutPage.prototype.changeCountryShipping = function (e) {
        if (this.states[e]) {
            this.statesShipping = this.states[e];
            this.formAddress.setControl('shipping_state', new FormControl('', Validators.required));
        }
        else {
            this.statesShipping = null;
            this.formAddress.setControl('shipping_state', new FormControl(''));
        }
    };
    CheckoutPage.prototype.changeBillingState = function () {
        if (this.useBilling)
            this.formAddress.patchValue({
                shipping_state: this.formAddress.value["billing_state"]
            });
    };
    CheckoutPage.prototype.confirm = function () {
        var _this = this;
        this.storage.set('useBilling', this.useBilling);
        if (this.useBilling)
            this.updateShipping();
        if (JSON.stringify(this.rawData) != JSON.stringify(this.formAddress.value)) {
            if (this.login["token"]) {
                var params = this.core.objectToURLParams(this.formAddress.value);
                var headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + this.login["token"]);
                this.core.showLoading();
                this.http.post(wordpress_url + '/wp-json/wooconnector/user/update_profile', params, {
                    headers: headers,
                    withCredentials: true
                }).subscribe(function (res) {
                    _this.data = res.json();
                    _this.storage.set('user', _this.data).then(function () {
                        _this.gotoCheckout();
                    });
                    _this.core.hideLoading();
                });
            }
            else {
                this.data = this.formAddress.value;
                this.storage.set('user', this.data).then(function () {
                    _this.gotoCheckout();
                });
            }
        }
        else
            this.gotoCheckout();
    };
    // tab shipping and pay
    CheckoutPage.prototype.gotoCheckout = function () {
        var _this = this;
        this.activePayment = true;
        this.core.showLoading();
        this.storageMul.get(['login', 'user', 'cart', 'coupon']).then(function (val) {
            if (val["login"] && val["login"]["token"])
                _this.login = val["login"];
            if (val["user"])
                _this.user = val["user"];
            if (val["cart"]) {
                _this.cart = val["cart"];
                if (_this.user) {
                    _this.products = [];
                    new ObjectToArray().transform(_this.cart).forEach(function (product) {
                        var now = {};
                        now['product_id'] = product['id'];
                        now['quantity'] = product['quantity'];
                        if (product['variation_id'])
                            now['variation_id'] = product['variation_id'];
                        _this.products.push(now);
                    });
                    var params = {};
                    params['products'] = JSON.stringify(_this.products);
                    if (val['coupon'])
                        params['coupons'] = JSON.stringify(val['coupon']);
                    params['country'] = _this.user['shipping_country'];
                    params['postcode'] = _this.user['shipping_postcode'];
                    var option = {
                        search: _this.core.objectToURLParams(params)
                    };
                    if (_this.login && _this.login['token']) {
                        var headers = new Headers();
                        headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                        headers.set('Authorization', 'Bearer ' + _this.login["token"]);
                        option['withCredentials'] = true;
                        option['headers'] = headers;
                    }
                    _this.http.get(wordpress_url + '/wp-json/wooconnector/calculator/getall', option).subscribe(function (res) {
                        _this.data_checkout = res.json();
                        console.log(_this.data_checkout);
                        if (_this.data_checkout['total']['discount']) {
                            _this.coupon = _this.data_checkout['total']['discount'];
                        }
                        if (_this.data_checkout['shipping']) {
                            _this.data_checkout['shipping'].forEach(function (shipping) {
                                shipping['cost'] = Number(shipping['price']) + Number(shipping['tax']);
                            });
                            _this.changeShipping(_this.data_checkout['shipping'][0]);
                        }
                        if (_this.data_checkout['payment'])
                            _this.payment = _this.data_checkout['payment'][0]['id'];
                        _this.data_checkout['_total'] = 0;
                        _this.data_checkout['_tax'] = 0;
                        var product;
                        if (!_this.data_checkout['total']['discount'])
                            product = _this.data_checkout['total'];
                        else
                            product = _this.data_checkout['total']['baseitem'];
                        if (product && !product['errors']) {
                            if (!_this.data_checkout['total']['discount']) {
                                product['total'].forEach(function (val) {
                                    _this.data_checkout['_tax'] += val['tax'];
                                    _this.data_checkout['_total'] += val['subtotal'];
                                });
                            }
                            else {
                                _this.data_checkout['total']['tax'].forEach(function (tax) { return _this.data_checkout['_tax'] += tax['value']; });
                                _this.data_checkout['_total'] = _this.data_checkout['total']['subtotal'];
                            }
                        }
                        else if (_this.data_checkout['total']['errors']) {
                            var message = '';
                            for (var key in _this.data_checkout['total']['errors']) {
                                if (_this.data_checkout['total']['errors'][key])
                                    message += ' ' + _this.data_checkout['total']['errors'][key][0];
                            }
                        }
                        _this.core.hideLoading();
                    });
                }
            }
        });
    };
    CheckoutPage.prototype.ionViewDidEnter = function () {
    };
    CheckoutPage.prototype.total = function () {
        var total = this.data_checkout['_total'] + this.data_checkout['_tax'];
        if (this.data_checkout['_shipping'])
            total += this.data_checkout['_shipping'];
        if (this.data_checkout['_shipping_tax'])
            total += this.data_checkout['_shipping_tax'];
        this.coupon.forEach(function (val) {
            total = Number(total) - (val['totaldiscount'] + val['totaltaxdiscount']);
        });
        if (total < 0)
            total = 0;
        return total;
    };
    CheckoutPage.prototype.changeShipping = function (shipping) {
        var _this = this;
        this.shipping = shipping['id'];
        this.data_checkout['_shipping'] = Number(shipping['price']);
        this.data_checkout['title_shipping'] = shipping['title'];
        this.data_checkout['_shipping_tax'] = 0;
        if (shipping['tax'])
            shipping['tax'].forEach(function (tax) { return _this.data_checkout['_shipping_tax'] += tax['value']; });
        this.total_order += this.data_checkout['_shipping'] + this.data_checkout['_shipping_tax'];
        console.log(this.total_order);
    };
    CheckoutPage.prototype.confirmShippingPay = function () {
        var _this = this;
        this.core.showLoading();
        this.params['products'] = JSON.stringify(this.products);
        Object.assign(this.params, this.core.filterProfile(this.user));
        console.log(this.user);
        this.params['billing_email'] = this.user['user_email'];
        this.params['shipping_method'] = this.shipping;
        this.params['payment_method'] = this.payment;
        if (this.coupon) {
            var coupon_1 = [];
            this.coupon.forEach(function (item) { return coupon_1.push(item['code']); });
            this.params['coupons'] = JSON.stringify(coupon_1);
        }
        this.data_checkout.payment.forEach(function (item) {
            if (item['id'] == _this.payment) {
                _this.data_checkout['title_payment'] = item['title'];
                _this.data_checkout['method_title'] = item['method_title'];
            }
        });
        console.log(this.data_checkout);
        this.activePayment = false;
        this.activeConfirm = true;
        this.core.hideLoading();
    };
    CheckoutPage.prototype.editShipping = function () {
        this.activePayment = true;
        this.activeConfirm = false;
    };
    CheckoutPage.prototype.editAddress = function () {
        this.activePayment = false;
        this.activeConfirm = false;
    };
    CheckoutPage.prototype.showAddress = function () {
        if (this.checkAdd) {
            this.checkAdd = false;
        }
        else {
            this.checkAdd = true;
        }
    };
    CheckoutPage.prototype.showBilling = function () {
        if (this.checkBill) {
            this.checkBill = false;
        }
        else {
            this.checkBill = true;
        }
    };
    CheckoutPage.prototype.checkoutProcess = function () {
        var _this = this;
        this.core.showLoading();
        this.params['order_comments'] = this.note;
        this.params = this.core.objectToURLParams(this.params);
        if (this.login && this.login['token']) {
            var headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            this.http.post(wordpress_url + '/wp-json/wooconnector/checkout/processcheckout', this.params, {
                headers: headers,
                withCredentials: true
            }).subscribe(function (res) {
                _this.core.hideLoading();
                _this.checkout(res.json());
            });
        }
        else {
            this.http.post(wordpress_url + '/wp-json/wooconnector/checkout/processcheckout', this.params)
                .subscribe(function (res) {
                _this.core.hideLoading();
                _this.checkout(res.json());
            });
        }
    };
    CheckoutPage.prototype.checkout = function (res) {
        var _this = this;
        var checkoutUrl = wordpress_url + '/wooconnector-checkout?data_key=' + res;
        console.log(checkoutUrl);
        if (this.platform.is('cordova')) {
            this.platform.ready().then(function () {
                var isCheckout = false;
                var openCheckout = _this.InAppBrowser.create(checkoutUrl, '_blank', 'location=no,toolbar=no');
                openCheckout.on('loadstart').subscribe(function (res) {
                    if (res.url.indexOf(wordpress_url) == 0 && res.url.indexOf('order-received') != -1) {
                        var params = res.url.split('?');
                        if (params.length > 1 && !isCheckout) {
                            isCheckout = true;
                            params = params[1].split('&');
                            params.forEach(function (val) {
                                var now = val.split('=');
                                if (now[0] == 'key' && now['1'].indexOf('wc_order') == 0) {
                                    var id = (res.url.split('?')[0]).split('/');
                                    if (Number.isInteger(Number(id[id.length - 1])))
                                        id = id[id.length - 1];
                                    else
                                        id = id[id.length - 2];
                                    openCheckout.close();
                                    _this.navCtrl.push(_this.ThankPage, { id: id }).then(function () {
                                        _this.navCtrl.remove(1, _this.navCtrl.length() - 2);
                                        _this.storageMul.remove(['cart', 'coupon']);
                                    });
                                }
                            });
                        }
                    }
                });
                openCheckout.on('loaderror').subscribe(function (res) {
                    openCheckout.close();
                    _this.Toast.showLongBottom(_this.trans).subscribe(function (toast) { }, function (error) { console.log(error); });
                });
            });
        }
    };
    CheckoutPage.prototype.location = function () {
        var _this = this;
        if (!this.platform.is('cordova'))
            return;
        this.core.showLoading();
        this.LocationAccuracy.canRequest().then(function (can) {
            if (can) {
                _this.LocationAccuracy.request(_this.LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(function () {
                    _this.Geolocation.getCurrentPosition().then(function (resp) {
                        var latlng;
                        if (resp['coords'])
                            latlng = resp['coords']['latitude'] + ',' + resp['coords']['longitude'];
                        if (!latlng)
                            return;
                        _this.http.get('http://maps.google.com/maps/api/geocode/json?latlng=' + latlng).subscribe(function (res) {
                            if (res.json()['status'] == 'OK' && res.json()['results']) {
                                var address = res.json()['results'][0];
                                var city_1;
                                var country_1;
                                address['address_components'].forEach(function (component) {
                                    if (component['types'].indexOf('administrative_area_level_1') != -1)
                                        city_1 = component['long_name'];
                                    if (component['types'].indexOf('country') != -1)
                                        country_1 = component['short_name'];
                                });
                                _this.formAddress.patchValue({
                                    billing_address_1: address['formatted_address'],
                                    billing_city: city_1,
                                    billing_country: country_1
                                });
                            }
                        });
                        _this.core.hideLoading();
                    }).catch(function (error) {
                        _this.core.hideLoading();
                    });
                }, function (err) { return _this.core.hideLoading(); });
            }
            else
                _this.core.hideLoading();
        });
    };
    CheckoutPage.prototype.chooseGetLocation = function () {
        var _this = this;
        var alert = this.alertCtrl.create({
            message: this.chooselocation['message'],
            cssClass: 'alert-no-title alert-signout',
            buttons: [
                {
                    text: this.chooselocation['no'],
                    cssClass: 'dark',
                },
                {
                    text: this.chooselocation['yes'],
                    handler: function () {
                        _this.location();
                    }
                }
            ]
        });
        alert.present();
    };
    return CheckoutPage;
}());
CheckoutPage = __decorate([
    Component({
        selector: 'page-checkout',
        templateUrl: 'checkout.html',
        providers: [Core, StorageMulti, ObjectToArray, Geolocation, LocationAccuracy]
    }),
    __metadata("design:paramtypes", [StorageMulti,
        Core,
        FormBuilder,
        Storage,
        NavController,
        NavParams,
        Http,
        Platform,
        InAppBrowser,
        Toast,
        Config,
        TranslateService,
        Geolocation,
        LocationAccuracy,
        AlertController])
], CheckoutPage);
export { CheckoutPage };
//# sourceMappingURL=checkout.js.map