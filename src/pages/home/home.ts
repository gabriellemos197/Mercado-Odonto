import { Component, Injectable, ViewChild, ElementRef } from '@angular/core';
import { Nav, NavController, ModalController, NavParams, AlertController, Platform } from 'ionic-angular';
import { Core } from '../../service/core.service';
import { MenuController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';
import { LinkProvider } from '../../providers/link/link';
import { OneSignal } from '@ionic-native/onesignal';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Http } from '@angular/http';
import { Device } from '@ionic-native/device';

import { ContactusPage } from '../contactus/contactus';
import { PrivacyPage } from '../privacy/privacy';
import { AboutusPage } from '../aboutus/aboutus';
import { TermPage } from '../term/term';
import { GetallNewproductPage } from '../getall-newproduct/getall-newproduct';
import { DetailPage } from '../detail/detail';
import { DetailcategoryPage } from '../detailcategory/detailcategory';
import { OrdercategoryPage } from '../ordercategory/ordercategory';
import { FavoritePage } from '../favorite/favorite';
import { SearchPage } from '../search/search';
import { CartPage } from '../cart/cart';
import { SigninPage } from '../signin/signin';

import { FADEIN } from '../../app/loading-animation';

declare var hide_sale: boolean;
declare var slide_time: number;
declare var onesignal_app_id: string;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
    providers: [Core, StorageMulti],
    animations: FADEIN,
})

@Injectable()
export class HomePage {
    SearchPage = SearchPage;
    SigninPage = SigninPage;
    GetallNewproductPage = GetallNewproductPage;
    DetailPage = DetailPage;
    DetailcategoryPage = DetailcategoryPage;
    OrdercategoryPage = OrdercategoryPage;
    CartPage = CartPage;
    AboutusPage = AboutusPage;
    ContactusPage = ContactusPage;
    PrivacyPage = PrivacyPage;
    TermPage = TermPage;
    FavoritePage = FavoritePage;
    dir_mode = "ltr";
    wordpress_url = "";
    @ViewChild('footer') buttonFooter;
    @ViewChild('slides_client') slides_client;
    @ViewChild('slides_banner') slides_banner;
    @ViewChild('menu_control') menu_control: ElementRef;

    slides: Object[] = [];
    deal: Object[] = [];
    products: Object[] = [];
    newProduct: Object[] = [];
    categories: Object[] = [];
    clientSay: Object[] = [];
    bestsale: Object[] = [];
    latesting: Number; latestIndex: Number = null;
    loadedProducts: boolean = false; loadedCategories: boolean;
    trans: Object = {};
    keyword: string = '';
    parents: Object[] = [];
    params: Object;
    textStatic: Object = {};
    id_catdefault: number;
    catName: string;
    new: string = 'getproduct'; hot: string; tren: string; sale: string; on_sale: string;
    currency: any;
    isCache = false;
    cart: Object[] = [];
    lang: any;
    show_keyboard = false;
    hide_sale = hide_sale;
    show_widget = false;
    popup_homepage: Object;
    slide_period = slide_time;
    recent_sold_width = '0px';
    menu_pos_top = "0px";
    menu_pos_right = "0px";
    page_allow_scroll = true;

    loaded_slides = false;
    loaded_deal = false;
    loaded_bestsale = false;
    loaded_commnent = false;
    loaded_newProduct = false;
    time = new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: Http,
        public core: Core,
        public config: Config,
        public modalCtrl: ModalController,
        public translate: TranslateService,
        public storageMulti: StorageMulti,
        public storage: Storage,
        public alertCtrl: AlertController,
        public screenOrientation: ScreenOrientation,
        public cart_provider: ShoppingCartProvider,
        public linkProvider: LinkProvider,
        public menu: MenuController,
        public platform: Platform,
        public oneSignal: OneSignal,
        public socialSharing: SocialSharing,
        public device: Device,
        public nav: Nav
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.lang = config['lang']['language'];
        this.storage.set('lang_previous', config['lang']);
        this.storage.set('lang_previous_for_cate', config['lang']);
        this.dir_mode = config['lang']['display_mode'];
        translate.get('home').subscribe(trans => {
            if (trans) this.trans = trans;
        });
        this.textStatic = config['text_static'];
        this.getPopupHomePage();
        storage.get('currency').then(
            res => {
                if (res) {
                    console.log('Initial currency by storage');
                    this.currency = JSON.parse(JSON.stringify(res))['code'];
                    storage.set('currency_previous', res);
                    config['currency'] = res;
                    this.getData();
                } else {
                    console.log('Initial currency by config');
                    let base = config['base_currency'];
                    storage.set('currency_previous', base);
                    storage.set('currency', base);
                    this.currency = base['code'];
                    config['currency'] = base;
                    this.getData();
                }
            },
            err => console.log(err)
        );

        // initialize onesignal 
        this.platform.ready().then(() => {
            if (this.platform.is('cordova')) {
                this.oneSignal.startInit(onesignal_app_id);
                this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
                this.oneSignal.handleNotificationOpened().subscribe(res => {
                    let payload = res.notification.payload;
                    console.log(payload);
                    if (payload && payload['launchURL']) {
                        this.openLink(payload['launchURL']);
                    }
                });
                this.oneSignal.endInit();
                this.oneSignal.getIds().then(data => {
                    storage.set('userID', data['userId']).then(() => {
                        console.log('UserID has set!')
                    });
                });
            }
            storage.get('login').then(val => {
                if (val && val['token']) {
                    this.core.checkTokenLogin(val['token']).subscribe(data => {
                        if (data['code'] == 'jwt_auth_valid_token') console.log('token valid');
                        else {
                            this.core.removeToken();
                        }
                    });
                }
            });
        })
    }

    ngOnInit() {
        let remaining_time = setInterval(() => {
            if (this.navCtrl.getActive().component == HomePage) {
                if(this.config['deals']) {
                    this.deal = this.countingTime(this.config['deals']);
                }
            }
        }, 60000);
        if(remaining_time) console.log(remaining_time);

        // detect orientation changes
        this.screenOrientation.onChange().subscribe(
            () => {
                this.slides_banner.update();
                this.slides_client.update();
            }
        );

        let gg_api_key = "AIzaSyA9HMlbSa5Tq-VXMQU1MeKF3Pc6ePYOnyM";
        if(this.config['app_settings']['google_api_key']) {
            gg_api_key = this.config['app_settings']['google_api_key'];
        }
        let gmap_api = document.createElement('script');
        gmap_api.src = 'http://maps.google.com/maps/api/js?key='+ gg_api_key +'&libraries=geometry';
        document.head.appendChild(gmap_api);
    }

    ionViewDidEnter() {
        this.menu.enable(true);
        this.buttonFooter.updateRoot();
        this.buttonFooter.update_footer();
        this.storage.get('cart').then(res => {
            this.cart = res;
        })
        if (!this.isCache) {
            this.isCache = true;
            this.getcategories();
            this.menu_pos_top = this.menu_control.nativeElement.getBoundingClientRect().top - 6 + "px";
            this.menu_pos_right = document.body.offsetWidth - this.menu_control.nativeElement.getBoundingClientRect().left + 6 + "px";
        } else {
            if(this.slides_banner) this.slides_banner.startAutoplay();
            this.checkCurrencyLanguageChange();
        }
    }

    checkCurrencyLanguageChange() {
        this.storageMulti.get(['currency_previous', 'lang_previous']).then(data=>{
            let tmp_currency = data['currency_previous'];
            let tmp_lang = data['lang_previous'];
            let currency_change = false;
            let lang_change = false;
            if (tmp_currency.code != this.config['currency']['code']) {
                this.currency = this.config['currency']['code'];
                this.storage.set('currency_previous', this.config['currency']);
                currency_change = true;
            }
            if (tmp_lang.language != this.config['lang'].language ) {
                this.storage.set('lang_previous', this.config['lang']);
                this.lang = this.config['lang'].language;
                this.dir_mode = this.config['lang']['display_mode'];
                this.textStatic = this.config['text_static'];
                this.wordpress_url = this.config['wordpress_url'];
                lang_change = true;
            }
            if(currency_change || lang_change) {
                this.core.showLoading();
                this.getData(true);
                this.getcategories();
            }
        })
    }

    ionViewWillLeave() {
        this.menu.enable(false);
        this.keyword = null;
        this.popup_homepage = null;
        // this.nav.swipeBackEnabled = true;
        if(this.slides_banner) {
            this.slides_banner.stopAutoplay();

        }
    }

    getPopupHomePage() {
        let url = this.wordpress_url + "/wp-json/wooconnector/popup/getpopuphomepage";
        let date = new Date();
        let date_gmt0 = new Date(date.toString()).toUTCString();
        let params = {
            datetime: date_gmt0,
            time: this.time
        }
        this.http.get(url, {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            if (res.json()) {
                this.popup_homepage = res.json();
                this.page_allow_scroll = false;
            }
        })
    }

    closePopupHome() {
        this.page_allow_scroll = true;
        this.popup_homepage = null;
    }

    quickAddCart(product, ele) {
        this.cart_provider.addSimpleToCart(product).subscribe(() => {
            this.storage.get('cart').then(res => {
                this.cart = res;
            });
            this.buttonFooter.update_footer();
        });
    }

    inCart(product_id, cart) {
        return this.cart_provider.inCart(product_id, cart);
    }

    /**
     * compute time difference
     */
    countingTime(element) {
        var i;
        for (i = 0; i < element.length; i++) {
            element[i]["due_date"] = true;
            if (element[i]["date_on_sale_to_gmt"] != null) {
                let end = new Date(element[i]["date_on_sale_to_gmt"]);
                let today = new Date();
                if (end.getTime() - today.getTime() < 0) {
                    element[i]["due_date"] = true;
                } else {
                    element[i]["upcomming"] = false;
                    element[i]["due_date"] = false;
                    let start;
                    if (element[i]["date_on_sale_from"] != null) {
                        start = new Date(element[i]["date_on_sale_from"] + "Z");
                        if ((today.getTime() - start.getTime()) < 0) {
                            let tmp = start;
                            start = today;
                            end = tmp;
                            element[i]["upcomming"] = true;
                        } else start = today;
                    } else {
                        start = today;
                    }
                    let diff = (end.getTime() - start.getTime()) / 1000;
                    element[i]['time_diff'] = Math.floor(diff);
                }
            } else if (element[i]["date_on_sale_to_gmt"] == null && element[i]["date_on_sale_from"] != null) {
                let today = new Date();
                let start = new Date(element[i]["date_on_sale_from"] + "Z");
                if ((today.getTime() - start.getTime()) < 0) {
                    element[i]["upcomming"] = true;
                    element[i]["due_date"] = false;
                    let diff = (start.getTime() - today.getTime()) / 1000;
                    element[i]['time_diff'] = Math.floor(diff);
                } else {
                    element[i]["upcomming"] = false;
                }

            }
        }
        return element;
    }

    changeSlides(event) {
        this.slides_banner.startAutoplay();
    }

    /**
     * check if deal product is sale off or due date for saling
     * @param deal Object[]
     */
    checkTopInfo(deal) {
        let key;
        let show = false;
        for (key in deal) {
            if (deal.hasOwnProperty(key)) {
                if (deal[key]['due_date'] == false || deal[key]['price'] < deal[key]['regular_price'])
                    show = true;
                break;
            }
        }
        return show;
    }

    getData(isRefreshing: boolean = false) {
        let params_slider = {};
        if (this.config['language_param']) {
            params_slider['mobile_lang'] = this.config['lang']['language'];
            params_slider['time'] = this.time;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooslider/product/getslider', {
            search: this.core.objectToURLParams(params_slider)
        }).subscribe(res => {
            if (res.json()) {
                this.slides = res.json();
            }
            this.loaded_slides = true;
        });
        let params = {
            woo_currency: this.currency,
            post_per_page: 2,
            time: this.time
        };
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getdealofday', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            if (res.json()) {
                this.config['deals'] = res.json();
                // this.storage.set('deals', res.json());
                this.deal = this.countingTime(res.json());
            }
            this.loaded_deal = true;
        });
        params['post_per_page'] = 10;
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getbestsales', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            if (res.json()) {
                this.bestsale = res.json();
                if (this.bestsale) {
                    this.recent_sold_width = this.bestsale.length * 170 + 'px';
                }
            }
            this.loaded_bestsale = true;
        });
        let params_cmt = {
            post_per_page: 3,
            time: this.time
        };
        if (this.config['language_param']) {
            params_cmt['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getnewcomment', {
            search: this.core.objectToURLParams(params_cmt)
        }).subscribe(res => {
            if (res.json()) {
                this.clientSay = res.json();
                if (this.clientSay.length > 0) {
                    this.slides_client.paginationBulletRender = (index, defaultClass) => {
                        return '<button class="custom ' + defaultClass + '"><img class="avatar-user" src="'
                            + this.clientSay[index]["link_avatar"] + '"></button>';
                    };
                }
            }
            this.loaded_commnent = true;
        });
        this.loadNewProduct();
        this.loadLatest(isRefreshing);
    }

    loadNewProduct() {
        let params: any = { post_per_page: 4, woo_currency: this.currency, time: this.time };
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            if (res.json()) {
                this.newProduct = res.json();
                this.loaded_newProduct = true;
            }
        });
    }

    loadLatest(isRefreshing: boolean = false) {
        if (isRefreshing) this.core.showLoading();
        this.storageMulti.get(['idCategoriesDefault', 'cateName']).then((val) => {
            if (val['idCategoriesDefault'] && val['cateName']) {
                this.id_catdefault = val['idCategoriesDefault'];
                this.catName = val['cateName'];
                this.params = { post_per_page: 4, post_category: val['idCategoriesDefault'] }
                this.getProduct(this.params, isRefreshing);
            } else {
                this.id_catdefault = 0;
                this.catName = this.trans["allProducts"];
                this.params = { post_per_page: 4, post_category: this.id_catdefault }
                this.getProduct(this.params, isRefreshing);
            }
        });
    }

    getProduct(params: any, isRefreshing: boolean = false) {
        params['woo_currency'] = this.currency;
        params['time'] = this.time;
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getproduct', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            this.products = res.json();
            this.loadedProducts = true;
            if (isRefreshing) this.core.hideLoading();
        });
    }

    showProductCategori() {
        this.page_allow_scroll = false;
        let modal = this.modalCtrl.create(OrdercategoryPage, { categoriesList: this.parents }, {cssClass: 'custom-modal  cate-modal'});
        modal.onDidDismiss(data => {
            if (data) {
                console.log(data);
                this.loadLatest(true);
            }
            this.page_allow_scroll = true;
        });
        modal.present();
    }

    // get categori default
    getcategories() {
        let params = { parent: '0', per_page: 100, page: 1, time: this.time };
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        let loadCategories = () => {
            this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getcategories', {
                search: this.core.objectToURLParams(params)
            }).subscribe(res => {
                this.parents = res.json();
            });
        };

        loadCategories();
    }

    doRefresh(refresher) {
        // this.loadedProducts = false;
        this.core.showLoading();
        this.loadedCategories = false;
        this.getData(true);
        this.getcategories();
        setTimeout(() => {
            refresher.complete();
        }, 200);
    }

    openLink(url: string) {
        let tmp = this.linkProvider.openComplexLink(url);
        let page = tmp['page'];
        if (Object.keys(tmp).length > 0) {
            if (page == "DetailPage") {
                this.navCtrl.push(DetailPage, { id: tmp['id'] });
            } else if (page == "DetailcategoryPage") {
                this.navCtrl.push(DetailcategoryPage, { id: tmp['id'] });
            } else if (page == "AboutusPage") {
                this.navCtrl.push(AboutusPage);
            } else if (page == "PrivacyPage") {
                this.navCtrl.push(PrivacyPage);
            } else if (page == "BookmarkPage") {
                this.navCtrl.push(FavoritePage);
            } else if (page == "TermPage") {
                this.navCtrl.push(TermPage);
            }
        } else {
            this.linkProvider.openExternal(url);
        }
    }

    search() {
        console.log('search-home');
        this.navCtrl.push(this.SearchPage, { key: this.keyword });
    }

    onSwipeContent(event) {
        if (event['deltaX'] < -90 && this.dir_mode == 'ltr') {
            this.navCtrl.push(this.CartPage, {}, { animate: true, direction: "forward" });
        } else if (event['deltaX'] > 90 && this.dir_mode == 'rtl') {
            this.navCtrl.push(this.CartPage, {}, { animate: true, direction: "back" });
        }
    }

    shareApp() {
        if (this.device.platform && this.device.platform.toLowerCase() == 'android')
            this.socialSharing.share(this.textStatic['cellstore_message_share_app'],
                this.textStatic['cellstore_subject_share_app'], null, this.textStatic['cellstore_google_app_link']);
        else this.socialSharing.share(this.textStatic['cellstore_message_share_app'],
            this.textStatic['cellstore_subject_share_app'], null, this.textStatic['cellstore_itunes_app_link']);
    }

    rateApp() {
        if (this.device.platform && this.device.platform.toLowerCase() == 'android') window.open(this.textStatic['cellstore_google_app_link'], "_system", 'location=no');
        else window.open(this.textStatic['cellstore_itunes_app_link'], "_system", 'location=no');
    }

    showWidget() {
        this.show_widget = !this.show_widget;
    }
}
