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
import { DetailcategoryPage } from '../detailcategory/detailcategory';
/*
  Generated class for the Sortpopup page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
var SortpopupPage = (function () {
    function SortpopupPage(navCtrl, navParams, viewCtrl) {
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.viewCtrl = viewCtrl;
        this.hidden = false;
        this.DetailcategoryPage = DetailcategoryPage;
        this.filter = { grid: true, open: null, value: {} };
        this.sort = navParams.get('sort');
        console.log(this.sort);
    }
    SortpopupPage.prototype.close = function () {
        this.viewCtrl.dismiss();
    };
    SortpopupPage.prototype.click = function () {
        this.viewCtrl.dismiss(this.sort);
    };
    return SortpopupPage;
}());
SortpopupPage = __decorate([
    Component({
        selector: 'page-sortpopup',
        templateUrl: 'sortpopup.html'
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        ViewController])
], SortpopupPage);
export { SortpopupPage };
//# sourceMappingURL=sortpopup.js.map