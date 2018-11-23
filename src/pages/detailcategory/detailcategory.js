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
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
// Page
import { DetailPage } from '../detail/detail';
import { SortpopupPage } from '../sortpopup/sortpopup';
import { FilterPage } from '../filter/filter';
import { SearchPage } from '../search/search';
var DetailcategoryPage = DetailcategoryPage_1 = (function () {
    function DetailcategoryPage(navCtrl, navParams, core, http, storage, modalCtrl, alertCtrl, translate) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.core = core;
        this.http = http;
        this.storage = storage;
        this.modalCtrl = modalCtrl;
        this.alertCtrl = alertCtrl;
        this.translate = translate;
        this.DetailPage = DetailPage;
        this.SortpopupPage = SortpopupPage;
        this.FilterPage = FilterPage;
        this.SearchPage = SearchPage;
        this.DetailcategoryPage = DetailcategoryPage_1;
        this.page = 1;
        this.sort = "name";
        this.range = { lower: 0, upper: 0 };
        this.checkFilter = false;
        this.data = {};
        this.products = [];
        this.attributes = [];
        this.filter = { grid: true, open: null, value: {}, valueCustom: {} };
        this.categories = [];
        this.checkFilterPopup = false;
        this.checkMenu = false;
        this.activeSearch = false;
        this.keyword = '';
        this.checkResuilt = false;
        this.id = navParams.get('id');
        console.log(this.id);
        this.name = navParams.get('name');
        this.idParent = navParams.get('idparent');
        core.showLoading();
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getcategories', {
            search: core.objectToURLParams(this.id)
        }).subscribe(function (res) {
            _this.data = res.json();
            _this.getProducts().subscribe(function (products) {
                console.log(products);
                if (products.length > 0) {
                    _this.page++;
                    _this.products = products;
                    _this.loaded = true;
                    http.get(wordpress_url + '/wp-json/wooconnector/product/getattribute')
                        .subscribe(function (res) {
                        _this.attributes = res.json();
                        console.log(_this.attributes);
                        _this.attributes['custom'] = new ObjectToArray().transform(_this.attributes['custom']);
                        console.log(_this.attributes);
                        _this.reset();
                        core.hideLoading();
                    });
                    _this.loadCategories();
                }
                else {
                    _this.checkResuilt = true;
                    console.log(_this.checkResuilt);
                }
            });
        });
    }
    DetailcategoryPage.prototype.loadCategories = function () {
        var _this = this;
        var params = { cat_num_page: 1, per_page: 100, parent: this.id };
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getcategories', {
            search: this.core.objectToURLParams(params)
        }).subscribe(function (res) {
            if (res.json() != null) {
                _this.categories = _this.categories.concat(res.json());
            }
            if (_this.categories.length == 100) {
                params.cat_num_page++;
                _this.loadCategories();
            }
        });
    };
    ;
    DetailcategoryPage.prototype.getProducts = function (isRefreshing) {
        var _this = this;
        if (isRefreshing === void 0) { isRefreshing = false; }
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
                    post_category: _this.id,
                    post_num_page: _this.page,
                    post_per_page: wordpress_per_page,
                    search: _this.keyword
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
                if (_this.keyword)
                    params['search'] = _this.keyword;
                params['post_category'] = _this.id.toString();
                if (Object.keys(_this.filter['value']).length > 0)
                    params['attribute'] = JSON.stringify(tmpFilter);
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
    DetailcategoryPage.prototype.reset = function () {
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
    DetailcategoryPage.prototype.load = function (infiniteScroll) {
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
    DetailcategoryPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        this.page = 1;
        this.getProducts().subscribe(function (products) {
            if (products.length > 0)
                _this.page++;
            _this.products = [];
            console.log(_this.products);
            products.forEach(function (result) {
                if (result != null) {
                    _this.products = _this.products.concat(result);
                }
            });
            refresher.complete();
        });
    };
    DetailcategoryPage.prototype.showSort = function (string) {
        var _this = this;
        var modal = this.modalCtrl.create(SortpopupPage, { sort: this.sort });
        modal.onDidDismiss(function (data) {
            _this.sort = data;
        });
        modal.present();
    };
    // showSort(){
    // 	this.translate.get('categories')
    // }
    DetailcategoryPage.prototype.showFilter = function () {
        if (this.checkFilter) {
            this.checkFilter = false;
        }
        else {
            this.checkFilter = true;
        }
    };
    DetailcategoryPage.prototype.showMenu = function () {
        if (this.checkMenu) {
            this.checkMenu = false;
        }
        else {
            this.checkMenu = true;
        }
    };
    DetailcategoryPage.prototype.runFilter = function () {
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
    DetailcategoryPage.prototype.click_active = function (id) {
        this.chooseCat = id;
        console.log(this.chooseCat);
    };
    DetailcategoryPage.prototype.searchclick = function () {
        if (!this.activeSearch) {
            this.activeSearch = true;
        }
        else {
            this.activeSearch = false;
        }
    };
    DetailcategoryPage.prototype.search = function () {
        var _this = this;
        if (this.keyword) {
            this.page = 1;
            this.products = [];
            this.core.showLoading();
            this.getProducts().subscribe(function (products) {
                _this.core.hideLoading();
                if (products.length > 0)
                    _this.page++;
                _this.products = products;
            });
        }
    };
    return DetailcategoryPage;
}());
DetailcategoryPage = DetailcategoryPage_1 = __decorate([
    Component({
        selector: 'page-detailcategory',
        templateUrl: 'detailcategory.html',
        providers: [ObjectToArray]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Core,
        Http,
        Storage,
        ModalController,
        AlertController,
        TranslateService])
], DetailcategoryPage);
export { DetailcategoryPage };
var DetailcategoryPage_1;
//# sourceMappingURL=detailcategory.js.map