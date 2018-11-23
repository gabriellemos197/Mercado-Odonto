import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Keyboard } from '@ionic-native/keyboard';
import { Observable } from 'rxjs/Observable';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from 'ng2-translate';
// import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Config } from '../../service/config.service';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

//Page
import { CommentPage } from '../comment/comment';
import { SigninPage } from '../signin/signin';
import { CartPage } from '../cart/cart';
import { RatingPage } from '../rating/rating';
import { BrandPage } from '../brand/brand';
import { DetailcategoryPage } from '../detailcategory/detailcategory';

import { FADEIN_LONGER } from '../../app/loading-animation';

declare var slide_time: number;
declare var hide_sale: boolean;
declare var hide_available_stock: boolean;

@Component({
    selector: 'page-detail',
    templateUrl: 'detail.html',
    providers: [Core, ObjectToArray],
    animations: FADEIN_LONGER,
})
export class DetailPage {
    @ViewChild('slides_product_img') slides_product_img;
    CommentPage = CommentPage;
    DetailPage = DetailPage;
    RatingPage = RatingPage;
    CartPage = CartPage;
    SigninPage = SigninPage;
    BrandPage = BrandPage;
    DetailcategoryPage = DetailcategoryPage;
    wordpress_url = '';
    id: number;
    quantity: number = 1; variation: number = 0;
    brand: Object = {};
    brand_parent: Object = {};
    detail: any;
    attributes: any = {};
    favorite: Object = {}; trans: Object = {}; login: Object;
    textStatic: Object = {};
    showmore: boolean = false;
    checkFavorite: boolean = false;
    comments: Object[] = [];
    images: Object;
    groupedProduct: Object[] = [];
    count: number = 0;
    totalprice: number = 0;
    currency: any;
    show_item_des: boolean = false;
    cart_total_item: number;
    isCache: boolean = false;
    cart: Object[] = [];
    no_variation: boolean = false;
    tmp_variation: Object[] = [];
    lang: any;
    per_page = 4;
    page = 1;
    suggested_product = [];
    product_available = false;
    hide_sale = hide_sale;
    hide_available_stock = hide_available_stock;
    hide_footer = false;
    dir_mode: string;
    slide_period = slide_time;
    detail_description = [];
    detail_description_tmp = [];
    slide_img = [];
    default_product_img = null;
    loaded_data = false;
    total_comment = 0;
    full_description = "";
    short_description = "";
    page_allow_scroll = true;
    time = new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public core: Core,
        public http: Http,
        public storage: Storage,
        public translate: TranslateService,
        public config: Config,
        public modalCtrl: ModalController,
        public alertCtrl: AlertController,
        public SocialSharing: SocialSharing,
        // public photoViewer: PhotoViewer,
        public cart_provider: ShoppingCartProvider,
        public ngZone: NgZone,
        public keyboard: Keyboard
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.textStatic = config['text_static'];
        translate.get('detail').subscribe(trans => this.trans = trans);
        this.lang = config['lang']['language'];
        this.id = navParams.get("id");
        storage.get('favorite').then((val) => { if (val) this.favorite = val; });
        this.currency = config['currency']['code'];
        this.getTotal();
        this.getData(true, true);
        // this.getFirstComment();
        this.updateViewCounter();
    }

    updateViewCounter() {
        let params = {
            post_id: this.id,
            time: this.time
        };
        this.http.get(this.wordpress_url + '/wp-json/mobiconnector/post/plugin_view', {
            search: this.core.objectToURLParams(params)
        }).subscribe(() => console.log('update view'));
    }

    ngOnInit() {
        this.keyboard.onKeyboardShow().subscribe(() => {
            this.hide_footer = true;
        });
        this.keyboard.onKeyboardHide().subscribe(() => {
            this.hide_footer = false;
        });
    }

    ionViewWillLeave() {
        if(this.slides_product_img) this.slides_product_img.stopAutoplay();
    }

    ionViewDidEnter() {
        this.dir_mode = this.config['lang']['display_mode'];
        if (this.isCache) {
            this.getTotal();
            this.slides_product_img.startAutoplay();
        } else {
            this.isCache = true;
        }
    }

    getTotal() {
        this.storage.get('cart').then((object) => {
            this.cart = object;
            this.totalprice = 0;
            this.cart_total_item = 0;
            let key;
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    this.totalprice += (Number(object[key].price) * object[key].quantity);
                    this.cart_total_item += object[key].quantity;
                }
            }
        });
    }

    getData(hideLoading = false, first_loading: boolean = false) {
        let params = {};
        params['post_num_page'] = this.page;
        params['post_per_page'] = 4;
        params['woo_currency'] = this.currency;
        params['time'] = this.time;
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        if(first_loading) {
            this.detail_description = [];
            this.detail_description_tmp = [];
        }
        if (!hideLoading) this.core.showLoading();
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getproduct/'
            + this.id, {
                search: this.core.objectToURLParams(params)
            })
            .subscribe(res => {
                if (res.json()) {
                    this.detail = res.json();
                    this.full_description = this.detail.description;
                    this.short_description = this.detail.short_description;
                    this.detail.original_quantity = this.detail.stock_quantity;
                    if (this.detail['sold_individually']) this.detail.stock_quantity = 1;
                    if (this.detail['cellstore_images'] && this.detail['cellstore_images'].length > 0) {
                        this.slide_img = this.detail['cellstore_images'];
                        this.default_product_img = Object.assign({}, this.detail['cellstore_images'][0]);
                    }
                    let i;
                    // check if variation available & format variation option
                    for (i = 0; i < this.detail['variations'].length; i++) {
                        if (this.detail['variations'][i]['backorders_allowed']
                            || this.detail['variations'][i]['in_stock']) {
                            this.product_available = true;
                        }
                        let t;
                        for (t = 0; t < this.detail['variations'][i]['attributes'].length; t++) {
                            let option = "";
                            let tmp = this.detail['variations'][i]['attributes'][t]['option'];
                            if (Array.isArray(tmp) && tmp[0]) {
                                option = tmp[0];
                            } else {
                                option = tmp;
                            }
                            this.detail['variations'][i]['attributes'][t]['option'] = option;
                        }
                    }
                    this.total_comment = this.detail['rating_count'];
                    if (this.detail['wooconnector_reviews']) {
                        this.comments = this.detail['wooconnector_reviews'];     
                    }
                    if (this.detail['type'] == 'grouped') {
                        this.groupedProduct = this.detail['grouped_products'];
                        for (i = 0; i < this.groupedProduct.length; i++) {
                            this.groupedProduct[i]['quantity'] = 0;
                        }
                    }
                    if (first_loading) {
                        if (this.detail['sku']) {
                            this.detail_description.push({ 'name': this.trans['sku'], 'des': this.detail['sku'] })
                        }
                        if (this.detail['description']) {
                            this.detail_description.push({ 'name': this.trans['description'], 'des': this.detail['description'] })
                        }
                        if (this.detail['weight']) {
                            let weight_info = this.detail['weight'] + ' ' + this.trans['weight_unit'];
                            this.detail_description.push({ 'name': this.trans['weight'], 'des': weight_info })
                        }
                        if (this.detail.dimensions.length || this.detail.dimensions.width
                            || this.detail.dimensions.height) {
                            let dimensions_info = this.core.formatDimensions(this.detail['dimensions']) + ' ' + this.trans['dimensions_unit'];
                            this.detail_description.push({ 'name': this.trans['dimensions'], 'des': dimensions_info })
                        };
                    }
                    
                    let obj;
                    for (obj in this.detail.attributes) {
                        if (this.detail.attributes.hasOwnProperty(obj)) {
                            let val = this.detail.attributes[obj];
                            if (this.detail.attributes[obj].variation) {
                                this.attributes[val["name"]] = {};
                                this.attributes[val["name"]].id = val["id"];
                                this.attributes[val["name"]].name = val["name"];
                                this.attributes[val["name"]].option = val["options"][0];
                                let taxanomy = "attribute_" + val["taxanomy"];
                                this.attributes[val["name"]].taxanomy = taxanomy;
                                let i;
                                for (i = 0; i < this.detail['default_attributes'].length; i++) {
                                    if (this.detail['default_attributes'][i]['id'] == val["id"]) {
                                        this.attributes[val["name"]].option = this.detail['default_attributes'][i]['option'];
                                    }
                                }
                            }
                            if (first_loading) {
                                this.detail_description_tmp.push({ 'name': val['name'], 'des': val['options'].join(', ') });
                            }
                        }
                    }
                    if (first_loading) {
                        this.detail_description.push.apply(this.detail_description, this.detail_description_tmp);
                    }
                    for (obj in this.detail.wooconnector_brands) {
                        if (this.detail.wooconnector_brands.hasOwnProperty(obj)) {
                            if (this.detail.wooconnector_brands[obj].parent == 0) {
                                this.brand_parent = this.detail.wooconnector_brands[obj];
                            } else {
                                this.brand = this.detail.wooconnector_brands[obj];
                            }
                        }
                    }
                    if (this.detail.cellstore_look_images) {
                        this.suggested_product = this.suggested_product.concat(this.detail.cellstore_look_images);
                    }
                    if (this.detail.type == "variable") { this.checkVariation(); }
                    if (!hideLoading) this.core.hideLoading();
                } else {
                    if (!hideLoading) this.core.hideLoading();
                    let alert = this.alertCtrl.create({
                        cssClass: 'alert-no-title',
                        message: this.trans['product_removed'],
                        buttons: [
                            {
                                text: this.trans['grouped']['button'],
                                handler: () => {
                                    this.navCtrl.pop();
                                }
                            }

                        ]
                    });
                    alert.present();
                }
                if(first_loading) {
                    this.ngZone.run(() => {
                        this.loaded_data = true;
                    });
                }
            });
    }

    loadMoreSuggest(infiniteScroll) {
        setTimeout(() => {
            this.page++;
            this.getData(true);
            infiniteScroll.complete();
        }, 500);;
    }

    changeSlides(event) {
        this.slides_product_img.startAutoplay();
    }

    changeFavorite() {
        if (this.favorite[Number(this.id)]) {
            delete this.favorite[Number(this.id)];
            this.storage.set('favorite', this.favorite);
        } else {
            let data: any = this.detail;
            this.favorite[Number(this.id)] = data;
            this.storage.set('favorite', this.favorite).then(() => {
                this.core.showToastBottom(this.trans["favorite"]["add"]);
            });
        }
    }

    shareLink(url: string) {
        this.SocialSharing.share(null, null, null, url);
    }

    checkVariation() {
        let variation_id = this.cart_provider.checkVariation(this.attributes, this.detail.variations);
        if (variation_id != 0) {
            this.no_variation = false;
            this.detail = this.cart_provider
                .replaceDetailByVariation(this.detail, variation_id, this.default_product_img);
            this.detail_description = [];
            if (this.detail['cellstore_images'] && this.detail['cellstore_images'].length > 0) {
                this.slide_img = this.detail['cellstore_images'];
            }
            if (this.detail['sku']) {
                this.detail_description.push({ 'name': this.trans['sku'], 'des': this.detail['sku'] })
            }
            if (this.detail['description']) {
                this.detail_description.push({ 'name': this.trans['description'], 'des': this.detail['description'] })
            }
            if (this.detail['weight']) {
                let weight_info = this.detail['weight'] + ' ' + this.trans['weight_unit'];
                this.detail_description.push({ 'name': this.trans['weight'], 'des': weight_info })
            }
            if (this.detail.dimensions.length || this.detail.dimensions.width
                || this.detail.dimensions.height) {
                let dimensions_info = this.core.formatDimensions(this.detail['dimensions']) + ' ' + this.trans['dimensions_unit'];
                this.detail_description.push({ 'name': this.trans['dimensions'], 'des': dimensions_info })
            };
            this.detail_description.push.apply(this.detail_description, this.detail_description_tmp);
        } else {
            this.no_variation = true;
        }
    }

    popToRoot() {
        this.navCtrl.popToRoot();
    }

    showMoreInfo(data) {
        if (this.showmore) {
            this.showmore = false;
        } else {
            this.showmore = true;
        }
    }

    getComment(no_cache): Observable<Object[]> {
        return new Observable(observable => {
            let params = { 
                post_num_page: 1, 
                post_per_page: 4,
                product_id: this.id
            };
            if(no_cache) {
                let date = new Date();
                let date_gmt0 = new Date(date.toString()).toUTCString();
                params['time'] = date_gmt0;
            }
            this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getnewcomment', {
                search: this.core.objectToURLParams(params)
            }).subscribe(res => {
                observable.next(res.json());
                observable.complete();
            }, err => {
                console.log(err);
                observable.next(null);
                observable.complete();
            }
            );
        })
    }

    showRating() {
        this.page_allow_scroll = false;
        let modal = this.modalCtrl.create(RatingPage, { id: this.id }, { cssClass: 'custom-modal modal-rating' });
        modal.onDidDismiss(reload => {
            if (reload) {
                this.core.showLoading();
                this.getComment(true).subscribe(data => {
                    if (data && data.length > 0) {
                        this.comments = data;
                        this.total_comment = this.comments[0]['total_comments'];
                    } 
                    this.core.hideLoading()
                });
            }
            this.page_allow_scroll = true;
        });
        modal.present();
    }

    openLink(url: string) {
        if (!url.match(/^https?:\/\//i)) {
            url = 'http://' + url;
        }
        window.open(url, '_system', 'location=yes');
    }

    addToCart() {
        if (this.detail['type'] == 'grouped') {
            this.cart_provider.addGroupedToCart(this.detail.grouped_products).subscribe(() => {
                this.getTotal();
            })
        } else if (this.detail['type'] == 'variable') {
            let variation_id = this.cart_provider.checkVariation(this.attributes, this.detail.variations);
            if (variation_id == 0) {
                this.no_variation = true;
                this.core.showToastBottom(this.trans['product_not_available']);
                this.core.scrollToView('detail-attributes-wrapper');
            } else {
                this.cart_provider.addVariableToCart(this.detail, variation_id, this.attributes, this.quantity).subscribe(() => {
                    this.getTotal();
                })
            }
        } else if (this.detail['type'] == 'simple') {
            this.cart_provider.addSimpleToCart(this.detail, this.quantity).subscribe(() => {
                this.getTotal();
            });
        }
    }
    // end addtocart
    gotoCart() {
        if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.CartPage)
            this.navCtrl.pop();
        else this.navCtrl.push(this.CartPage);
    }

    onSwipe(e) {
        if (e['deltaX'] < -150 || e['deltaX'] > 150) {
            if (e['deltaX'] > 0 && this.detail['wooconnector_previous_product']) {
                this.navCtrl.push(this.DetailPage, { id: this.detail['wooconnector_previous_product'] }).then(() => {
                    this.navCtrl.remove(this.navCtrl.getActive().index - 1);
                });
            } else if (e['deltaX'] < 0 && this.detail['wooconnector_next_product']) {
                this.navCtrl.push(this.DetailPage, { id: this.detail['wooconnector_next_product'] }).then(() => {
                    this.navCtrl.remove(this.navCtrl.getActive().index - 1);
                });
            }
        }
    }

    quickAddCart(product, ele) {
        this.cart_provider.addSimpleToCart(product).subscribe(() => {
            this.getTotal();
        });
    }

    inCart(product_id, cart) {
        return this.cart_provider.inCart(product_id, cart);
    }
}
