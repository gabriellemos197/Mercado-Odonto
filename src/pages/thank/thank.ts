import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
// import { SocialSharing } from '@ionic-native/social-sharing';
// import { Config } from '../../service/config.service';

// Page
import { OrderdetailPage } from '../orderdetail/orderdetail';

@Component({
    selector: 'page-thank',
    templateUrl: 'thank.html'
})
export class ThankPage {
    OrderdetailPage = OrderdetailPage;
    id: any;
    isLogin = false;
    bank_payment = false;
    show_widget = false;
    textStatic = {};

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public platform: Platform,
        public storage: Storage,
        public device: Device,
    ) {
        this.isLogin = navParams.get('isLogin');
        if (navParams.get('payment') == 'bacs') {
            this.bank_payment = true;
        };
        this.id = navParams.get('id');
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.platform.registerBackButtonAction(() => {
                this.navCtrl.popToRoot();
            });
        })
    }

    goHome() {
        this.navCtrl.popToRoot();
    }
}
