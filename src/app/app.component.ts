import { Component, NgZone, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http, Headers } from '@angular/http';
import { Core } from '../service/core.service';
import { LoadingController } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Device } from '@ionic-native/device';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';

//custom
import { TranslateService } from 'ng2-translate';
import { Storage } from '@ionic/storage';
import { Config } from '../service/config.service';
import { Network } from '@ionic-native/network';
import { Keyboard } from '@ionic-native/keyboard';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { LinkProvider } from '../providers/link/link';
import { StorageMulti } from '../service/storage-multi.service';


//pages
import { HomePage } from '../pages/home/home';
import { DetailcategoryPage } from '../pages/detailcategory/detailcategory';
import { SigninPage } from '../pages/signin/signin';

declare var wordpress_url: string;

import { FADEIN } from './loading-animation';

@Component({
    templateUrl: 'app.html',
    providers: [AdMobFree, StorageMulti],
    animations: FADEIN,
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any;
    trans: Object;
    isLoaded: boolean = false;
    disconnect: boolean = false;
    DetailcategoryPage = DetailcategoryPage;
    parents: Object[] = [];
    childs: Object[] = [];
    id: Number;
    check_id: number[] = [];
    check: boolean = false;
    can_load_more: boolean = true;
    loaded_cate = false;
    cat_num_page = 1;
    showMenu = false;
    maintain = false;
    wordpress_url = wordpress_url;
    time = new Date().getTime();

    constructor(
        public platform: Platform,
        public translate: TranslateService,
        public storage: Storage,
        public http: Http,
        public core: Core,
        public config: Config,
        public ngZone: NgZone,
        public alertCtrl: AlertController,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        public network: Network,
        public keyboard: Keyboard,
        public loadingCtrl: LoadingController,
        public screenOrientation: ScreenOrientation,
        public menu: MenuController,
        public linkProvider: LinkProvider,
        public ga: GoogleAnalytics,
        public admobFree: AdMobFree,
        public device: Device,
        public storageMul: StorageMulti
    ) {
        translate.setDefaultLang('en');
        this.config['lang'] = { 'language': 'en', 'name': 'English' };

        platform.ready().then(() => {
            statusBar.styleDefault();
            if (this.device.platform && this.device.platform.toLowerCase() == 'android') {
                statusBar.overlaysWebView(false);
            }
            this.splashScreen.hide();

            if (this.device.platform) {
                this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            }

            this.getAllSettings();

            network.onDisconnect().subscribe(() => {
                ngZone.run(() => {
                    this.disconnect = true;
                });
            });
            network.onConnect().subscribe(() => {
                ngZone.run(() => {
                    this.disconnect = false;
                });
            });
        });
    }

    getAllSettings() {
        let url = wordpress_url + "/wp-json/mobiconnector/settings/getfirstloadapp?time=" + this.time;
        this.http.get(url).subscribe(res => {
            let settings = res.json();
            this.config['app_settings'] = settings;
            this.config['base_url'] = wordpress_url;
            console.log('setting save success');
            console.log(this.config['app_settings']);
            // change url mode to ?mobile_lang and always show language infor
            this.config['app_settings']['url_mode'] = 1;
            this.config['app_settings']['hide_default'] = false;
            
            let lang_settings = {
                language: settings['application_language'],
                name: settings['application_language_name'],
                display_mode: settings['dir']
            }
            this.config['lang'] = lang_settings;
            this.config['base_lang'] = lang_settings;
            this.translate.use(this.config['lang']['language']);
            this.translate.get('general').subscribe(trans => {
                this.trans = trans;
            });

            this.config['list_lang'] = settings['qtranslate_languages'];
            this.config['hide_default_lang'] = settings['hide_default'];
            this.maintain = settings['maintain'];
            this.initialData();

            let operating_system = '';
            let admob: Object = {};
            if (this.device.platform && this.device.platform.toLowerCase() == 'android') {
                operating_system = 'android';
                admob = {
                    banner: settings['admob_android_banner'],
                    interstitial: settings['admob_android_interstitial']
                }
            } else {
                operating_system = 'ios';
                admob = {
                    banner: settings['admob_ios_banner'],
                    interstitial: settings['admob_ios_interstitial']
                }
            }

            if (admob['banner']) {
                const bannerConfig: AdMobFreeBannerConfig = {
                    id: admob['banner'],
                    autoShow: true
                };
                this.admobFree.banner.config(bannerConfig);
                this.admobFree.banner.prepare()
                    .then(() => { console.log('banner prepare'); })
                    .catch(e => console.log(e));
            }

            if (admob['interstitial']) {
                const interstitialConfig: AdMobFreeInterstitialConfig = {
                    id: admob['interstitial'],
                    autoShow: true
                };
                this.admobFree.interstitial.config(interstitialConfig);
                this.admobFree.interstitial.prepare()
                    .then(() => {
                        console.log('interstitial prepare');
                    }).catch(e => console.log(e));
            }

            this.ga.startTrackerWithId(this.config['app_settings']['google_analytics']).then(() => {
                this.ga.trackView(operating_system);
            }).catch(e => console.log('Error starting GoogleAnalytics', e));
        }, err => {
            this.translate.get('general').subscribe(trans => {
                this.trans = trans;
            });
            this.splashScreen.hide();
            this.showNoInternet();
        }
        );
    }

    initialData() {
        let html = document.querySelector('html');
        html.setAttribute("dir", this.config['app_settings']['dir']);
        this.storage.get('text').then(res => {
            let html = document.querySelector('html');
            if (res) {
                html.classList.add(res['code']);
            } else {
                html.classList.add('normal');
            }
        });
        this.storageMul.get(['lang', 'login']).then(val => {
            if (val['lang']) {
                this.config['lang'] = val['lang'];
                this.translate.use(this.config['lang']['language']);
                this.translate.get('general').subscribe(trans => {
                    this.trans = trans;
                });
                if (this.config['lang']['display_mode'])
                    html.setAttribute("dir", this.config['lang']['display_mode']);
            }

            this.wordpress_url = this.core.initialUrl();

            let params: any = {time: this.time};
            // let headers = new Headers();
            // headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            // if (val['login']) {
            //     headers.set('Authorization', 'Bearer ' + val['login']["token"]);
            // }
            if (this.config['language_param']) {
                params['mobile_lang'] = this.config['lang']['language'];
            }
            let option = {
                search: this.core.objectToURLParams(params)
            };
            this.http.get(this.wordpress_url + '/wp-json/cellstore/static/gettextstatic', option)
                .subscribe(res => {
                    let config_tmp = res.json();
                    this.config.set('text_static', config_tmp['text_static']);
                    this.config.set('check_https', config_tmp['check_https']);
                    this.config.set('required_login', config_tmp['required_login']);
                    this.config.set('register', config_tmp['register']);
                    // if (config_tmp['login_expired']) {
                    //     this.storage.remove('login');
                    //     this.storage.remove('user');
                    // }
                    this.config['base_currency'] = config_tmp['currencies']['basecurrency'];
                    this.config['list_currency'] = config_tmp['currencies']['listcurrency'];

                    if(!this.maintain) {
                        this.rootPage = HomePage;
                    } else {
                        this.rootPage = SigninPage;
                    }
                    this.isLoaded = true;
                    this.menu.enable(false);

                    this.getActiveLocation();
                    this.getcategories();

                }, err => {
                    console.log(err);
                    // if (err.json().code == "invalid_token") {
                    //     this.storage.remove('login');
                    //     this.storage.remove('user');
                    //     this.initialData();
                    // }
                });
        })
    }

    getActiveLocation() {
        let params = {time:this.time};
        if (this.config['language_param']) {
            params['mobile_lang'] = this.config['lang']['language'];
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/settings/getactivelocaltion', {
            search: this.core.objectToURLParams(params)
        }).subscribe(location => {
            this.config.set('countries', location.json()['countries']);
            this.config.set('states', location.json()['states']);
        });
    }

    showNoInternet() {
        let alert = this.alertCtrl.create({
            message: this.trans['error_first']['message'],
            cssClass: 'alert-no-title',
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: this.trans['error_first']['button'],
                    handler: () => {
                        this.showLoading();
                    }
                }
            ]
        });
        alert.present();
    };

    showLoading() {
        let loading = this.loadingCtrl.create({
            duration: 3000
        });
        loading.onDidDismiss(() => {
            this.getAllSettings();
        });
        loading.present();
    }

    getcategories(reset: boolean = false) {
        if (reset) {
            this.ngZone.run(() => {
                this.loaded_cate = false;
            })
        }
        console.log(this.loaded_cate);
        let params = {
            parent: 0,
            menu: 1,
            time: this.time
        };
        if (this.config['language_param']) {
            params['mobile_lang'] = this.config['lang']['language'];
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getcategories', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            this.parents = res.json();
            this.ngZone.run(
                () => {
                    this.loaded_cate = true;
                })
        });
    }

    menuOpened() {
        this.storage.get('lang_previous_for_cate').then(res_lang => {
            if (res_lang && res_lang.language != this.config['lang'].language) {
                this.storage.set('lang_previous_for_cate', this.config['lang']);
                this.parents = [];
                this.getcategories(true);
            }
        })
    }

    openPage(page, idcat, name, idparent) {
        this.nav.push(this.DetailcategoryPage, { id: idcat, name: name, idparent: idparent });
    }

    checkOpen(id: number) {
        if (this.check == false) {
            this.check_id[id] = id;
            if (this.check_id[id] == id) {
                this.check = true;
            } else {
                this.check = false;
            }
        } else {
            if (this.check_id[id] == id) {
                delete this.check_id[id];
                this.check = false;
            } else {
                this.check_id[id] = id;
                this.check = true;
            }
        }
    }

    // exitApp() {
    //     this.platform.exitApp();
    // }
}
