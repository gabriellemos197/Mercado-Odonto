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
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TextInput } from 'ionic-angular';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
// Page
import { DetailPage } from '../detail/detail';
import { AccountPage } from '../account/account';
import { SortpopupPage } from '../sortpopup/sortpopup';
var SearchPage = (function () {
    function SearchPage(navCtrl, navParams, http, core, modalCtrl, storage) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.core = core;
        this.modalCtrl = modalCtrl;
        this.storage = storage;
        this.DetailPage = DetailPage;
        this.AccountPage = AccountPage;
        this.SortpopupPage = SortpopupPage;
        this.keyword = '';
        this.products = [];
        this.range = { lower: 0, upper: 0 };
        this.attributes = [];
        this.filter = { grid: true, open: null, value: {} };
        this.page = 1;
        this.checkFilter = false;
        this.checkResuilt = false;
        this.grid = true;
        this.favorite = {};
        var key = navParams.get('key');
        if (key)
            this.keyword = key;
        this.search();
        http.get(wordpress_url + '/wp-json/wooconnector/product/getattribute')
            .subscribe(function (res) {
            _this.attributes = res.json();
            _this.attributes['custom'] = new ObjectToArray().transform(_this.attributes['custom']);
            console.log(_this.attributes);
            _this.reset();
            core.hideLoading();
        });
    }
    SearchPage.prototype.reset = function () {
        var _this = this;
        this.filter['value'] = {};
        this.attributes['attributes'].forEach(function (attr) {
            _this.filter['value'][attr['slug']] = {};
        });
        this.attributes['custom'].forEach(function (attr) {
            _this.filter['value'][attr['slug']] = {};
        });
        this.range = { lower: 0, upper: 0 };
    };
    SearchPage.prototype.ngOnInit = function () {
        var _this = this;
        if (this.inputSearch) {
            this.inputSearch["clearTextInput"] = function () {
                (void 0);
                _this.inputSearch._value = '';
                _this.inputSearch.onChange(_this.inputSearch._value);
                _this.inputSearch.writeValue(_this.inputSearch._value);
                setTimeout(function () { _this.inputSearch.setFocus(); }, 0);
            };
        }
    };
    SearchPage.prototype.search = function () {
        var _this = this;
        if (this.keyword) {
            this.page = 1;
            this.core.showLoading();
            this.getProducts().subscribe(function (products) {
                _this.core.hideLoading();
                if (products.length > 0) {
                    _this.page++;
                    _this.products = products;
                }
                else {
                    _this.checkResuilt = true;
                }
            });
        }
    };
    SearchPage.prototype.getProducts = function () {
        var _this = this;
        return new Observable(function (observable) {
            var tmpFilter = [];
            for (var filter in _this.filter['value']) {
                var attr = _this.filter['value'][filter];
                if (Object.keys(attr).length > 0)
                    for (var option in attr) {
                        if (attr[option]) {
                            var now = {};
                            now['keyattr'] = filter;
                            now['valattr'] = option;
                            now['type'] = 'attributes';
                            tmpFilter.push(now);
                        }
                    }
                ;
            }
            for (var filter in _this.filter['valueCustom']) {
                var attr = _this.filter['value'][filter];
                if (attr && Object.keys(attr).length > 0)
                    for (var option in attr) {
                        if (attr[option]) {
                            var now = {};
                            now['keyattr'] = filter;
                            now['valattr'] = option;
                            now['type'] = 'custom';
                            tmpFilter.push(now);
                        }
                    }
                ;
            }
            if (tmpFilter.length == 0 && !_this.range['lower'] && !_this.range['upper']) {
                var params = {
                    status: 'publish',
                    search: _this.keyword,
                    post_num_page: _this.page,
                    post_per_page: wordpress_per_page
                };
                _this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
                    search: _this.core.objectToURLParams(params)
                }).subscribe(function (products) {
                    observable.next(products.json());
                    observable.complete();
                });
            }
            else {
                var params = {};
                if (Object.keys(_this.filter['value']).length > 0)
                    params['attribute'] = JSON.stringify(_this.tmpFilter);
                if (_this.keyword)
                    params['search'] = _this.keyword;
                params['post_num_page'] = _this.page;
                params['post_per_page'] = wordpress_per_page;
                if (_this.range['lower'] != 0)
                    params['min_price'] = _this.range['lower'];
                if (_this.range['upper'] != 0)
                    params['max_price'] = _this.range['upper'];
                _this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproductbyattribute', {
                    search: _this.core.objectToURLParams(params)
                }).subscribe(function (products) {
                    observable.next(products.json());
                    observable.complete();
                });
            }
        });
    };
    SearchPage.prototype.load = function (infiniteScroll) {
        var _this = this;
        this.getProducts().subscribe(function (products) {
            if (products != null)
                _this.page++;
            if (products != null) {
                _this.products = _this.products.concat(products);
            }
            infiniteScroll.complete();
        });
    };
    SearchPage.prototype.showSort = function (string) {
        var _this = this;
        var modal = this.modalCtrl.create(SortpopupPage, { id: string });
        modal.onDidDismiss(function (data) {
            _this.sort = data;
        });
        modal.present();
    };
    SearchPage.prototype.showFilter = function () {
        if (this.checkFilter) {
            this.checkFilter = false;
        }
        else {
            this.checkFilter = true;
            console.log('aaa');
        }
    };
    SearchPage.prototype.runFilter = function () {
        var _this = this;
        this.page = 1;
        this.products = [];
        this.core.showLoading();
        this.getProducts().subscribe(function (products) {
            if (products && products.length > 0) {
                _this.page++;
                _this.products = products;
                _this.core.hideLoading();
            }
            else {
                _this.checkResuilt = true;
            }
        });
        this.checkFilter = false;
    };
    return SearchPage;
}());
__decorate([
    ViewChild(TextInput),
    __metadata("design:type", TextInput)
], SearchPage.prototype, "inputSearch", void 0);
SearchPage = __decorate([
    Component({
        selector: 'page-search',
        templateUrl: 'search.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Http,
        Core,
        ModalController,
        Storage])
], SearchPage);
export { SearchPage };
//# sourceMappingURL=search.js.map