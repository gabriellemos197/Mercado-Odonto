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
import { Platform, NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, Validators } from '@angular/forms';
//custom
import { CoreValidator } from '../../validator/core';
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { TranslateService } from 'ng2-translate';
import { Toast } from '@ionic-native/toast';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Config } from '../../service/config.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Static } from '../../pipes/static';
var ContactusPage = (function () {
    function ContactusPage(navCtrl, formBuilder, http, storage, platform, SocialSharing, translate, Toast, config, InAppBrowser, core) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.formBuilder = formBuilder;
        this.http = http;
        this.platform = platform;
        this.SocialSharing = SocialSharing;
        this.Toast = Toast;
        this.config = config;
        this.InAppBrowser = InAppBrowser;
        this.core = core;
        this.check = true;
        this.checkselect = true;
        this.formContact = formBuilder.group({
            name: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
            subject: [''],
            message: ['', Validators.required]
        });
        translate.get('contact').subscribe(function (trans) { return _this.trans = trans; });
    }
    ContactusPage.prototype.send = function () {
        var _this = this;
        this.core.showLoading();
        this.isSend = true;
        this.http.post(wordpress_url + '/wp-json/wooconnector/contactus/sendmail', this.formContact.value)
            .subscribe(function (res) {
            _this.isSend = false;
            if (res.json()['result'] == 'success') {
                _this.core.hideLoading();
                _this.Toast.showShortTop(_this.trans["success"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            }
            else {
                _this.core.hideLoading();
                _this.Toast.showShortTop(_this.trans["error"]).subscribe(function (toast) { }, function (error) { console.log(error); });
            }
        });
    };
    ContactusPage.prototype.showtime = function () {
        if (this.check) {
            this.check = false;
        }
        else {
            this.check = true;
        }
    };
    ContactusPage.prototype.showform = function () {
        if (this.checkselect) {
            this.checkselect = false;
        }
        else {
            this.checkselect = true;
        }
    };
    ContactusPage.prototype.shareApp = function () {
        if (this.platform.is('android'))
            this.SocialSharing.share(null, null, null, new Static(this.config).transform('modern_share_android'));
        else
            this.SocialSharing.share(null, null, null, new Static(this.config).transform('modern_share_ios'));
    };
    ContactusPage.prototype.rateApp = function () {
        if (this.platform.is('android'))
            this.InAppBrowser.create(new Static(this.config).transform('modern_rate_android'), "_system");
        else
            this.InAppBrowser.create(new Static(this.config).transform('modern_rate_ios'), "_system");
    };
    return ContactusPage;
}());
ContactusPage = __decorate([
    Component({
        selector: 'page-contactus',
        templateUrl: 'contactus.html',
        providers: [Core]
    }),
    __metadata("design:paramtypes", [NavController,
        FormBuilder,
        Http,
        Storage,
        Platform,
        SocialSharing,
        TranslateService,
        Toast,
        Config,
        InAppBrowser,
        Core])
], ContactusPage);
export { ContactusPage };
//# sourceMappingURL=contactus.js.map