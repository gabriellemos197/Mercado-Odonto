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
import { NavController } from 'ionic-angular';
// Custom
import { CartPage } from '../../pages/cart/cart';
import { AccountPage } from '../../pages/account/account';
import { SettingPage } from '../../pages/setting/setting';
var Footer = (function () {
    function Footer(navCtrl) {
        this.navCtrl = navCtrl;
        this.CartPage = CartPage;
        this.AccountPage = AccountPage;
        this.SettingPage = SettingPage;
        this.footer = {};
        // this.update_footer();
    }
    //  ionViewDidEnter(){
    //  	console.log(this.buttonCart);
    // 	this.buttonCart.update();
    // }
    Footer.prototype.ngOnInit = function () {
        this.active = this.navCtrl.getActive().component.name;
    };
    Footer.prototype.goto = function (page) {
        if (this.active != page) {
            if (page == "HomePage") {
                this.navCtrl.popToRoot();
            }
            else {
                var previous = this.navCtrl.getPrevious();
                if (previous && previous.component.name == page)
                    this.navCtrl.pop();
                else
                    this.navCtrl.push(this[page]);
            }
        }
    };
    Footer.prototype.update_footer = function () {
        this.buttonCart.update();
        this.cartcount = this.buttonCart['cart']['count'];
    };
    return Footer;
}());
__decorate([
    ViewChild('cart'),
    __metadata("design:type", Object)
], Footer.prototype, "buttonCart", void 0);
Footer = __decorate([
    Component({
        selector: 'footer',
        templateUrl: 'footer.html'
    }),
    __metadata("design:paramtypes", [NavController])
], Footer);
export { Footer };
//# sourceMappingURL=footer.js.map