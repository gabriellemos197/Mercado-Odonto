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
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { Core } from '../../service/core.service';
import { PopoverController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { PopoverpagePage } from '../popoverpage/popoverpage';
import { GetallNewproductPage } from '../getall-newproduct/getall-newproduct';
import { DetailPage } from '../detail/detail';
import { DetailcategoryPage } from '../detailcategory/detailcategory';
import { OrdercategoryPage } from '../ordercategory/ordercategory';
import { SearchPage } from '../search/search';
import { ThankPage } from '../thank/thank';
import { CartPage } from '../cart/cart';
var HomePage = (function () {
    // rating:Object[];
    function HomePage(navCtrl, popoverCtrl, http, core, config, modalCtrl, translate, storageMulti, storage, alertCtrl) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.popoverCtrl = popoverCtrl;
        this.http = http;
        this.core = core;
        this.config = config;
        this.modalCtrl = modalCtrl;
        this.storageMulti = storageMulti;
        this.storage = storage;
        this.alertCtrl = alertCtrl;
        this.SearchPage = SearchPage;
        this.ThankPage = ThankPage;
        this.GetallNewproductPage = GetallNewproductPage;
        this.PopoverpagePage = PopoverpagePage;
        this.DetailPage = DetailPage;
        this.DetailcategoryPage = DetailcategoryPage;
        this.OrdercategoryPage = OrdercategoryPage;
        this.CartPage = CartPage;
        this.newProduct = [];
        this.categories = [];
        this.clientSay = [];
        this.bestsale = [];
        this.latestIndex = null;
        this.loadedProducts = false;
        this.trans = {};
        this.keyword = '';
        this.parents = [];
        this.textStatic = {};
        this.new = 'getproduct';
        this.getData();
        translate.get('home').subscribe(function (trans) {
            if (trans)
                _this.trans = trans;
        });
        this.textStatic = config['text_static'];
    }
    HomePage.prototype.ionViewDidEnter = function () {
         this.buttonCart.update();
    };
    HomePage.prototype.presentPopover = function (myEvent) {
        var popover = this.popoverCtrl.create(PopoverpagePage, {}, { cssClass: 'custom-popover' });
        popover.present({
            ev: myEvent
        });
    };
    HomePage.prototype.getData = function (isRefreshing) {
        var _this = this;
        if (isRefreshing === void 0) { isRefreshing = false; }
        this.http.get(wordpress_url + '/wp-json/wooslider/product/getslider')
            .subscribe(function (res) {
            if (isRefreshing)
                delete _this.slides;
            _this.slides = res.json();
            console.log(_this.slides);
        });
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getdealofday', {
            search: this.core.objectToURLParams({
                post_per_page: 2
            })
        }).subscribe(function (res) {
            if (isRefreshing)
                delete _this.deal;
            _this.deal = res.json();
        });
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getbestsales', {
            search: this.core.objectToURLParams({
                post_per_page: 10
            })
        }).subscribe(function (res) {
            if (isRefreshing)
                delete _this.bestsale;
            _this.bestsale = res.json();
        });
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getnewcomment')
            .subscribe(function (res) {
            if (isRefreshing)
                delete _this.clientSay;
            _this.clientSay = res.json();
            console.log(_this.clientSay);
        });
        this.loadNewProduct();
        this.loadLatest();
        this.getcategories();
    };
    HomePage.prototype.loadNewProduct = function () {
        var _this = this;
        var params = { post_per_page: 4 };
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(function (res) {
            _this.newProduct = res.json();
            console.log(_this.newProduct);
        });
    };
    HomePage.prototype.loadLatest = function () {
        var _this = this;
        this.storageMulti.get(['idCategoriesDefault', 'cateName']).then(function (val) {
            if (val['idCategoriesDefault'] && val['cateName']) {
                _this.id_catdefault = val['idCategoriesDefault'];
                _this.catName = val['cateName'];
                _this.params = { post_per_page: 4, post_category: val['idCategoriesDefault'] };
                _this.getProduct(_this.params);
            }
            else {
                _this.id_catdefault = 0;
                _this.catName = 'All';
                _this.params = { post_per_page: 4, post_category: _this.id_catdefault };
                _this.getProduct(_this.params);
            }
        });
    };
    HomePage.prototype.getProduct = function (params) {
        var _this = this;
        this.core.showLoading();
        this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(function (res) {
            _this.core.hideLoading();
            _this.products = res.json();
            _this.loadedProducts = true;
        });
    };
    HomePage.prototype.showProductCategori = function () {
        var _this = this;
        var modal = this.modalCtrl.create(OrdercategoryPage, { categoriesList: this.parents });
        modal.onDidDismiss(function (data) {
            console.log(data);
            _this.loadLatest();
        });
        modal.present();
    };
    // get categori default
    HomePage.prototype.getcategories = function () {
        var _this = this;
        var params = { parent: '0', per_page: 200, page: 1 };
        var loadCategories = function () {
            _this.http.get(wordpress_url + '/wp-json/wooconnector/product/getcategories', {
                search: _this.core.objectToURLParams(params)
            }).subscribe(function (res) {
                _this.parents = _this.parents.concat(res.json());
                if (res.json().length == 100) {
                    params.page++;
                    loadCategories();
                }
            });
        };
        loadCategories();
    };
    HomePage.prototype.doRefresh = function (refresher) {
        this.loadedProducts = false;
        this.loadedCategories = false;
        this.getData(true);
        setTimeout(function () { refresher.complete(); }, 200);
    };
    HomePage.prototype.openSlide = function (url) {
        if (url) {
            if (url.indexOf("link://") == 0) {
                url = url.replace("link://", "");
                var data = url.split("/");
                if (data[0] == "product")
                    this.navCtrl.push('Detail', { id: data[1] });
                else if (data[0] == "product-category")
                    this.navCtrl.push('Detailcategorypage', { id: data[1] });
            }
            else
                cordova["InAppBrowser"].open(url, open_target_blank ? "_blank" : "_system");
        }
    };
    HomePage.prototype.search = function () {
        this.navCtrl.push(this.SearchPage, { key: this.keyword });
    };
    HomePage.prototype.onSwipeContent = function (e) {
        if (e['deltaX'] < -150)
            this.navCtrl.push(this.CartPage);
    };
    return HomePage;
}());
__decorate([
    ViewChild('footer'),
    __metadata("design:type", Object)
], HomePage.prototype, "buttonFooter", void 0);
HomePage = __decorate([
    Component({
        selector: 'page-home',
        templateUrl: 'home.html',
        providers: [Core, StorageMulti]
    }),
    __metadata("design:paramtypes", [NavController,
        PopoverController,
        Http,
        Core,
        Config,
        ModalController,
        TranslateService,
        StorageMulti,
        Storage,
        AlertController])
], HomePage);
export { HomePage };
//# sourceMappingURL=home.js.map