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
import { Core } from '../../service/core.service';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
var GetallNewproductPage = (function () {
    function GetallNewproductPage(navCtrl, navParams, core, http) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.core = core;
        this.http = http;
        this.page = 1;
        this.products = [];
        core.showLoading();
        this.enpoint = navParams.get('enpoint');
        this.title = navParams.get('title');
        if (this.enpoint == 'hot') {
            this.getHotProduct().subscribe(function (products) {
                _this.products = products;
                core.hideLoading();
            });
        }
        else {
            this.getProducts(this.enpoint).subscribe(function (products) {
                if (products.length > 0)
                    _this.page++;
                products.forEach(function (result) {
                    if (result != null) {
                        _this.products = _this.products.concat(result);
                    }
                });
                core.hideLoading();
            });
        }
    }
    GetallNewproductPage.prototype.getProducts = function (enpoint) {
        var _this = this;
        return new Observable(function (observable) {
            var params = { post_num_page: _this.page, post_per_page: wordpress_per_page };
            _this.http.get(wordpress_url + '/wp-json/wooconnector/product/' + enpoint, {
                search: _this.core.objectToURLParams(params)
            }).subscribe(function (products) {
                observable.next(products.json());
                observable.complete();
            });
        });
    };
    GetallNewproductPage.prototype.getHotProduct = function () {
        var _this = this;
        return new Observable(function (observable) {
            _this.http.get(wordpress_url + '/wp-json/cellstore/static/getproducthots')
                .subscribe(function (products) {
                observable.next(products.json());
                observable.complete();
            });
        });
    };
    GetallNewproductPage.prototype.doRefresh = function (refresher) {
        var _this = this;
        if (this.enpoint == 'hot') {
            this.page = 1;
            this.getHotProduct().subscribe(function (products) {
                if (products.length > 0)
                    _this.page++;
                _this.products = [];
                _this.products = products;
                refresher.complete();
            });
        }
        else {
            this.page = 1;
            this.getProducts(this.enpoint).subscribe(function (products) {
                if (products.length > 0)
                    _this.page++;
                _this.products = [];
                products.forEach(function (result) {
                    if (result != null) {
                        _this.products = _this.products.concat(result);
                    }
                });
                refresher.complete();
            });
        }
    };
    GetallNewproductPage.prototype.load = function (infiniteScroll) {
        var _this = this;
        if (this.enpoint == 'hot') {
            this.getHotProduct().subscribe(function (products) {
                if (products.length > 0)
                    _this.page++;
                _this.products = [];
                _this.products = _this.products.concat(products);
                infiniteScroll.complete();
            });
        }
        else {
            this.getProducts(this.enpoint).subscribe(function (products) {
                if (products.length > 0)
                    _this.page++;
                _this.products = _this.products.concat(products);
                infiniteScroll.complete();
            });
        }
    };
    return GetallNewproductPage;
}());
GetallNewproductPage = __decorate([
    Component({
        selector: 'page-getall-newproduct',
        templateUrl: 'getall-newproduct.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Core,
        Http])
], GetallNewproductPage);
export { GetallNewproductPage };
//# sourceMappingURL=getall-newproduct.js.map