import { Component, ViewChild } from '@angular/core';
import { Nav, AlertController, NavController, NavParams } from 'ionic-angular';

// Custom
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { StorageMulti } from '../../service/storage-multi.service';
import { Config } from '../../service/config.service';
import { Core } from '../../service/core.service';
import { FADEIN } from '../../app/loading-animation';

// Page
import { SigninPage } from '../signin/signin';
import { OrderPage } from '../order/order';
import { FavoritePage } from '../favorite/favorite';
import { ProfilePage } from '../profile/profile';
import { CartPage } from '../cart/cart';
import { SettingPage } from '../setting/setting';

@Component({
    selector: 'page-account',
    templateUrl: 'account.html',
    providers: [StorageMulti],
    animations: FADEIN,
})
export class AccountPage {
    @ViewChild('footer') buttonFooter;
    Signin = SigninPage;
    Profile = ProfilePage;
    Order = OrderPage;
    Favorite = FavoritePage;
    SettingPage = SettingPage;
    CartPage = CartPage;
    isCache: boolean = false;
    isLogin: boolean;
    data: any = {};
    dir_mode = "ltr";

    constructor(
        public storage: Storage,
        public navCtrl: NavController,
        public navParams: NavParams,
        public storageMulti: StorageMulti,
        public alertCtrl: AlertController,
        public translate: TranslateService,
        public config: Config,
        public nav: Nav,
        public core: Core
    ) {
        this.getData();
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        this.dir_mode = this.config['lang']['display_mode'];
        if (this.isCache) this.getData();
        else this.isCache = true;
        // this.nav.swipeBackEnabled = false;
    }

    // ionViewWillLeave() {
    //     this.nav.swipeBackEnabled = true;
    // }

    getData() {
        this.storageMulti.get(['login', 'user']).then(val => {
            if (val) {
                if (val["login"] && val["login"]["token"]) {
                    this.data["login"] = val["login"];
                    this.isLogin = true;
                }
                if (val["user"]) this.data["user"] = val["user"];
                console.log(val["user"]);
                console.log(this.data["login"]);
            }
        });
    }

    signOut() {
        this.translate.get('account.signout').subscribe(trans => {
            let confirm = this.alertCtrl.create({
                title: trans["app_name"],
                message: trans["message"],
                cssClass: 'alert-no-title title alert-blue-btn cancel',
                buttons: [
                    {
                        text: trans["no"]
                    },
                    {
                        text: trans["yes"],
                        handler: () => {
                            this.storage.remove('user');
                            this.storage.remove('login').then(() => {
                                this.isLogin = false;
                                // this.navCtrl.popToRoot();
                            });
                        }
                    }
                ]

            });
            confirm.present();
        });
    }

    onSwipeContent(event) {
        if (event['deltaX'] < -90 && this.dir_mode == 'ltr'){
            this.navCtrl.push(this.SettingPage, {}, {animate: true, direction: "forward"});    
        } else if (event['deltaX'] > 90 && this.dir_mode == 'rtl') {
 			this.navCtrl.push(this.SettingPage, {}, {animate: true, direction: "back"});     
        } else if (this.dir_mode == 'ltr') {
        	this.navCtrl.push(this.CartPage, {}, {animate: true, direction: "back"});  
        } else {
        	this.navCtrl.push(this.CartPage, {}, {animate: true, direction: "forward"});  
        }  
    }
}