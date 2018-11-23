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
import { Http } from '@angular/http';
// Custom
import { Core } from '../../service/core.service';
// Page
import { DetailcategoryPage } from '../../pages/detailcategory/detailcategory';
var Categories = (function () {
    function Categories(http, core) {
        var _this = this;
        this.http = http;
        this.core = core;
        this.DetailcategoryPage = DetailcategoryPage;
        this.parents = [];
        this.childs = [];
        this.check_id = [];
        this.check = false;
        var params = { parent: '0', per_page: 100, page: 1 };
        var signCategories = core.getSignature('get', wordpress_woo + '/products/categories', params);
        var loadCategories = function () {
            _this.http.get(wordpress_woo + '/products/categories', {
                search: core.objectToURLParams(signCategories)
            }).subscribe(function (res) {
                _this.parents = _this.parents.concat(res.json());
                console.log(_this.parents);
                _this.parents.forEach(function (item, index) {
                    var params1 = { page: 1, per_page: 100, parent: item['id'] };
                    var signChildCategories = core.getSignature('get', wordpress_woo + '/products/categories', params1);
                    _this.http.get(wordpress_woo + '/products/categories', {
                        search: core.objectToURLParams(signChildCategories)
                    }).subscribe(function (res) {
                        _this.childs = _this.childs.concat(res.json());
                    });
                });
                if (res.json().length == 100) {
                    params.page++;
                    signCategories = core.getSignature('get', wordpress_woo + '/products/categories', params);
                    loadCategories();
                }
            });
        };
        loadCategories();
    }
    Categories.prototype.checkOpen = function (id) {
        if (this.check == false) {
            this.check_id[id] = id;
            if (this.check_id[id] == id) {
                this.check = true;
            }
            else {
                this.check = false;
            }
        }
        else {
            if (this.check_id[id] == id) {
                delete this.check_id[id];
                this.check = false;
            }
            else {
                this.check_id[id] = id;
                this.check = true;
            }
        }
    };
    return Categories;
}());
Categories = __decorate([
    Component({
        selector: 'categories',
        templateUrl: 'categories.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [Http,
        Core])
], Categories);
export { Categories };
//# sourceMappingURL=categories.js.map