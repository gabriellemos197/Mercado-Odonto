var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { LoadingController, Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
// Custom
import { Network } from '@ionic-native/network';
import { Config } from './config.service';
var Core = (function () {
    function Core(loadingCtrl, platform, Network, config) {
        this.loadingCtrl = loadingCtrl;
        this.platform = platform;
        this.Network = Network;
        this.config = config;
    }
    Core.prototype.getSignature = function (method, url, params) {
        if (params === void 0) { params = null; }
        var oauth_data;
        if (this.config['check_https']) {
            oauth_data = {
                consumer_key: consumer_key,
                consumer_secret: consumer_secret
            };
            Object.assign(oauth_data, params);
        }
        else {
            var oauth = new OAuth({
                consumer: {
                    public: consumer_key,
                    secret: consumer_secret
                },
                signature_method: 'HMAC-SHA1',
                hash_function: function () { }
            });
            oauth_data = {
                oauth_consumer_key: oauth.consumer.public,
                oauth_nonce: oauth.getNonce(),
                oauth_signature_method: oauth.signature_method,
                oauth_timestamp: oauth.getTimeStamp(),
            };
            Object.assign(oauth_data, params);
            oauth_data.oauth_signature = oauthSignature.generate(method, url, oauth_data, oauth.consumer.secret);
        }
        return oauth_data;
    };
    Core.prototype.objectToURLParams = function (object) {
        var params = new URLSearchParams();
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                if (Array.isArray(object[key])) {
                    object[key].forEach(function (val) {
                        params.append(key + '[]', val);
                    });
                }
                else
                    params.set(key, object[key]);
            }
        }
        return params;
    };
    Core.prototype.showLoading = function (content) {
        var _this = this;
        if (content === void 0) { content = null; }
        if (!this.isLoading) {
            this.isLoading = true;
            this.loading = this.loadingCtrl.create({
                content: content
            });
            this.loading.onDidDismiss(function () {
                _this.isLoading = false;
            });
            this.loading.present();
            setTimeout(function () { _this.hideLoading(); }, request_timeout);
            this.platform.ready().then(function () {
                if (_this.Network.type == "none")
                    _this.hideLoading();
                _this.Network.onDisconnect().subscribe(function () { _this.hideLoading(); });
            });
        }
    };
    Core.prototype.hideLoading = function () { if (this.isLoading)
        this.loading.dismiss(); };
    Core.prototype.getVariation = function (variations, attributes) {
        return new Observable(function (observable) {
            var variation;
            var _attr = JSON.stringify(attributes).toLowerCase();
            var maxEqual = 0;
            variations.forEach(function (val) {
                var equalAttr = 0;
                val["attributes"].forEach(function (attr) {
                    if (_attr.indexOf(JSON.stringify(attr).toLowerCase()) != -1)
                        equalAttr++;
                });
                if (equalAttr > maxEqual && equalAttr == val["attributes"].length) {
                    variation = val;
                    maxEqual = equalAttr;
                }
            });
            if (!variation)
                variation = variations.filter(function (item) { return item["attributes"].length == 0; })[0];
            observable.next(variation);
            observable.complete();
        });
    };
    Core.prototype.filterProfile = function (profile) {
        if (!profile)
            profile = {};
        return {
            billing_first_name: profile['billing_first_name'],
            billing_last_name: profile['billing_last_name'],
            billing_company: profile['billing_company'],
            billing_country: profile['billing_country'],
            billing_state: profile['billing_state'],
            billing_address_1: profile['billing_address_1'],
            billing_address_2: profile['billing_address_2'],
            billing_city: profile['billing_city'],
            billing_postcode: profile['billing_postcode'],
            billing_phone: profile['billing_phone'],
            shipping_first_name: profile['shipping_first_name'],
            shipping_last_name: profile['shipping_last_name'],
            shipping_company: profile['shipping_company'],
            shipping_country: profile['shipping_country'],
            shipping_state: profile['shipping_state'],
            shipping_address_1: profile['shipping_address_1'],
            shipping_address_2: profile['shipping_address_2'],
            shipping_city: profile['shipping_city'],
            shipping_postcode: profile['shipping_postcode']
        };
    };
    return Core;
}());
Core = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [LoadingController,
        Platform,
        Network,
        Config])
], Core);
export { Core };
//# sourceMappingURL=core.service.js.map