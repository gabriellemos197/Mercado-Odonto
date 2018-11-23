import { Component, ViewChild } from '@angular/core';
import { Nav, NavController, ModalController, NavParams, AlertController } from 'ionic-angular';

// Custom
import { Storage } from '@ionic/storage';
import { CurrencyPage } from '../currency/currency';
import { LanguagePage } from '../language/language';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { OneSignal } from '@ionic-native/onesignal';
import { Http } from '@angular/http';
import { HomePage } from '../home/home';
import { AccountPage } from '../account/account';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html',
    providers: [Core]
})
export class SettingPage {
    AccountPage = AccountPage;
    CurrencyPage = CurrencyPage;
    LanguagePage = LanguagePage;
    HomePage = HomePage;
    data: any = {};
    @ViewChild('footer') buttonFooter;
    isCache: boolean;
    // total_cart:number;
    currency: Object = {};
    listCurrency: Object[] = [];
    trans: Object = {};
    listLanguage: Object[] = [];
    lang: Object = {};
    textTrans: any;
    dir_mode = "ltr";
    wordpress_url = "";
    page_allow_scroll = true;
    time = new Date().getTime();
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public storage: Storage,
        public alertCtrl: AlertController,
        public translate: TranslateService,
        public config: Config,
        public core: Core,
        public http: Http,
        public oneSignal: OneSignal,
        public modalCtrl: ModalController,
        public nav: Nav
    ) {
        this.wordpress_url = config['wordpress_url'];
        translate.get('setting.text_size').subscribe(trans => this.textTrans = trans);
        this.getData();
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        this.dir_mode = this.config['lang']['display_mode'];
        if (this.isCache) {
            this.getData();
        } else this.isCache = true;
        // this.nav.swipeBackEnabled = false;
    }

    // ionViewWillLeave() {
    //     this.nav.swipeBackEnabled = true;
    // }

    goToCurrency() {
        this.page_allow_scroll  = false;
        let modal = this.modalCtrl.create(CurrencyPage,
            { active: this.currency['code'], list: this.listCurrency }, {cssClass: 'custom-modal'});
        modal.onDidDismiss(data => {
            if (data) {
                this.currency = data;
            }
            this.page_allow_scroll = true;
        });
        modal.present();
    }

    changeStatic() {
        this.core.showLoading();
        let params = {};
        if (this.config['language_param']) {
            params['mobile_lang'] = this.config['lang']['language'];
            params['time'] = this.time;
        }
        this.http.get(this.wordpress_url + '/wp-json/cellstore/static/gettextstatic', {
            search: this.core.objectToURLParams(params)
        }).subscribe(
            res => {
                this.core.hideLoading();
                this.config.set('text_static', res.json()['text_static']);
            },
            err => this.core.hideLoading()
        )
    }

    goToLanguage() {
        this.page_allow_scroll  = false;
        let modal = this.modalCtrl.create(LanguagePage,
            { active: this.config['lang']['language'], list: this.listLanguage }, {cssClass: 'custom-modal'});
        modal.onDidDismiss(data => {
            if (data) {
                this.lang = this.config['lang'];
                this.translate.get('setting.text_size').subscribe(trans => {
                    this.textTrans = trans;
                    this.data["text"]['name'] = this.textTrans['option'][this.data["text"]['code']];
                    this.storage.set('text', this.data['text']);
                });
                let html = document.querySelector('html');
                if (this.config['lang']['display_mode']) {
                    html.setAttribute("dir", this.config['lang']['display_mode']);
                }

                this.wordpress_url = this.core.initialUrl();
                this.changeStatic();
            }
            this.page_allow_scroll = true;
        });
        modal.present();
    }

    clearCache() {
        let msg = {};
        this.translate.get('setting')
            .subscribe(trans => { msg = trans; });
        let alert = this.alertCtrl.create({
            message: msg['clear_cache_title'],
            cssClass: 'alert-clear-cache',
            buttons: [
                {
                    text: msg['no'],
                    role: 'cancel',
                    handler: () => { }
                },
                {
                    text: msg['yes'],
                    handler: () => {
                        this.storage.clear().then(() => {
                            this.storage.set('lang_previous', this.config['lang']);
                            this.storage.set('lang_previous_for_cate', this.config['lang']);
                            this.config['lang'] = this.config['base_lang'];
                            this.storage.set('lang', this.config['base_lang']);
                            this.wordpress_url = this.core.initialUrl();
                            console.log('wp_url', this.wordpress_url);
                            console.log(this.config['wordpress_url']);
                            this.translate.use(this.config['base_lang']['language']);

                            this.storage.set('currency_previous', this.config['currency']);
                            this.config['currency'] = this.config['base_currency'];
                            this.storage.set('currency', this.config['base_currency']);
                            
                            this.translate.get('setting.text_size').subscribe(trans => this.textTrans = trans);
                            this.dir_mode = this.config['base_lang']['display_mode'];
                            let html = document.querySelector('html');
                            html.setAttribute("dir", this.config['lang']['display_mode']);
                            this.getData();
                            this.buttonFooter.update_footer()
                            this.changeStatic();
                            this.translate.get('setting').subscribe(trans => { 
                                msg = trans; 
                                this.core.showToastBottom(msg['clear_success']);
                            });
                        });
                    }
                }
            ]
        });
        alert.present();
    }

    getData() {
        this.storage.get('notification').then(res => {
            if (res || res == false) {
                this.data["notification"] = res;
            } else {
                this.storage.set('notification', true);
                this.data["notification"] = true;
            }
        });
        this.storage.get('text').then(res => {
            if (res) {
                this.data["text"] = res;
            } else {
                let textsize = { 'code': 'normal', 'name': this.textTrans['option']['normal'] };
                this.storage.set('text', textsize);
                this.data["text"] = textsize;
                this.updateTextSize('normal');
            }
        });
        this.currency = this.config['currency'];
        this.listCurrency = this.config['list_currency'];
        this.lang = this.config['lang'];
        this.listLanguage = this.config['list_lang'];
    }

    notification(value) {
        this.storage.set('notification', value).then(() => {
            this.oneSignal.setSubscription(value);
        });
    }

    changeTextSize() {
        let alert = this.alertCtrl.create({
            cssClass: 'alert-text-size'
        });
        for (let size in this.textTrans["option"]) {
            let size_name = this.textTrans["option"][size];
            let style = 'alert-option';
            if (size == this.data.text['code']) {
                style += ' active';
            }
            alert.addButton({
                text: size_name,
                cssClass: style,
                handler: () => { this.updateTextSize(size) }
            });
        }
        alert.addButton({
            text: this.textTrans['cancel'],
            cssClass: 'alert-cancel',
            role: 'cancel',
            handler: () => { }
        });
        alert.present();
    }

    updateTextSize(size: string) {
        let textsize = { 'code': size, 'name': this.textTrans['option'][size] }
        this.storage.set('text', textsize);
        let html = document.querySelector('html');
        html.className = size;
        this.data["text"] = textsize;
    }

    onSwipeContent(event) {
        if (event['deltaX'] > 90 && this.dir_mode == 'ltr') {
            this.navCtrl.push(this.AccountPage, {}, { animate: true, direction: "back" });
        } else if (event['deltaX'] < -90 && this.dir_mode == 'rtl') {
            this.navCtrl.push(this.AccountPage, {}, { animate: true, direction: "forward" });
        }
    }
}
