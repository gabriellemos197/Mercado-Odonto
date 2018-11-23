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
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Content } from 'ionic-angular';
import { StorageMulti } from '../../service/storage-multi.service';
// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from 'ng2-translate';
var OrderdetailPage = (function () {
    function OrderdetailPage(navCtrl, navParams, storageMul, http, storage, core, translate, Toast, alertCtrl) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.storageMul = storageMul;
        this.http = http;
        this.core = core;
        this.translate = translate;
        this.Toast = Toast;
        this.alertCtrl = alertCtrl;
        this.date_format = date_format;
        translate.get('detail').subscribe(function (trans) { return _this.trans = trans; });
        this.id = navParams.get('id');
        core.showLoading();
        storageMul.get(['login', 'user']).then(function (val) {
            console.log(val);
            if (val && val['login']['token']) {
                _this.login = val['login'];
                _this.user = val['user'];
                _this.getData();
            }
            else
                navCtrl.pop();
        });
    }
    OrderdetailPage.prototype.getData = function () {
        var _this = this;
        this.core.showLoading();
        var headers = new Headers();
        headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        headers.set('Authorization', 'Bearer ' + this.login["token"]);
        this.http.get(wordpress_url + '/wp-json/wooconnector/order/getorderbyid?order=' + this.id, {
            headers: headers,
            withCredentials: true
        }).subscribe(function (res) {
            _this.data = res.json();
            _this.data['total_cost_price'] = (Number(res.json()['total']) + Number(res.json()['discount_total']) - Number(res.json()['shipping_total']) - Number(res.json()['total_tax']));
            _this.data['_tax'] = (Number(res.json()['total_tax']) + Number(res.json()['shipping_tax']));
            _this.data['shipping_lines'].forEach(function (val) {
                _this.data['_shipping_title'] = val['method_title'];
            });
            console.log(_this.data);
            _this.core.hideLoading();
            _this.content.resize();
        });
    };
    OrderdetailPage.prototype.changeStatus = function () {
        var _this = this;
        this.translate.get('orderdetail').subscribe(function (trans) {
            var confirm = _this.alertCtrl.create({
                message: trans["message"],
                cssClass: '',
                buttons: [
                    {
                        text: trans["no"],
                    },
                    {
                        text: trans["yes"],
                        cssClass: 'dark',
                        handler: function () {
                            _this.core.showLoading();
                            var params = _this.core.objectToURLParams({ order: _this.id });
                            var headers = new Headers();
                            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                            headers.set('Authorization', 'Bearer ' + _this.login["token"]);
                            _this.http.post(wordpress_url + '/wp-json/wooconnector/order/changestatus', params, {
                                headers: headers,
                                withCredentials: true
                            }).subscribe(function (res) {
                                _this.core.hideLoading();
                                if (res.json()['result'] == 'success') {
                                    _this.Toast.showShortBottom(_this.trans["success"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                                    _this.navCtrl.pop();
                                }
                                else {
                                    _this.Toast.showShortBottom(_this.trans["fail"]).subscribe(function (toast) { }, function (error) { console.log(error); });
                                }
                            });
                        }
                    }
                ]
            });
            confirm.present();
        });
    };
    OrderdetailPage.prototype.doRefresh = function (refresher) {
        this.getData();
        refresher.complete();
    };
    return OrderdetailPage;
}());
__decorate([
    ViewChild(Content),
    __metadata("design:type", Content)
], OrderdetailPage.prototype, "content", void 0);
OrderdetailPage = __decorate([
    Component({
        selector: 'page-orderdetail',
        templateUrl: 'orderdetail.html',
        providers: [StorageMulti, Core]
    }),
    __metadata("design:paramtypes", [NavController,
        NavParams,
        StorageMulti,
        Http,
        Storage,
        Core,
        TranslateService,
        Toast,
        AlertController])
], OrderdetailPage);
export { OrderdetailPage };
//# sourceMappingURL=orderdetail.js.map