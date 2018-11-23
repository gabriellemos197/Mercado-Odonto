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
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Http } from '@angular/http';
import { StorageMulti } from '../../service/storage-multi.service';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
var OrdercategoryPage = (function () {
    function OrdercategoryPage(navCtrl, navParams, http, core, viewCtrl, storage, storageMulti) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.http = http;
        this.core = core;
        this.viewCtrl = viewCtrl;
        this.storage = storage;
        this.storageMulti = storageMulti;
        this.parents = [];
        this.parents = navParams.get('categoriesList');
        this.storage.get('idCategoriesDefault').then(function (value) {
            if (value) {
                _this.defaultCategories = value;
            }
            else {
                _this.defaultCategories = 0;
            }
        });
    }
    OrdercategoryPage.prototype.getData = function () {
        var _this = this;
        this.storage.set('idCategoriesDefault', this.defaultCategories).then(function () {
            if (_this.defaultCategories == 0) {
                _this.storage.set('cateName', 'All').then(function () {
                    _this.viewCtrl.dismiss({ id: _this.defaultCategories, name: _this.catName });
                });
            }
            else {
                _this.parents.forEach(function (cate) {
                    if (cate['id'] == _this.defaultCategories) {
                        console.log(cate['name']);
                        _this.catName = cate['name'];
                        _this.storage.set('cateName', cate['name']).then(function () {
                            _this.viewCtrl.dismiss({ id: _this.defaultCategories, name: _this.catName });
                        });
                    }
                });
            }
        });
    };
    OrdercategoryPage.prototype.closePopup = function () {
        this.viewCtrl.dismiss();
    };
    return OrdercategoryPage;
}());
OrdercategoryPage = __decorate([
    Component({
        selector: 'page-ordercategory',
        templateUrl: 'ordercategory.html',
        providers: [Core, StorageMulti]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        Http,
        Core,
        ViewController,
        Storage,
        StorageMulti])
], OrdercategoryPage);
export { OrdercategoryPage };
//# sourceMappingURL=ordercategory.js.map