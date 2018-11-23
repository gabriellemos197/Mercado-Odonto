import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { Nav, NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';
import { TranslateService } from 'ng2-translate';

// Custom
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { Storage } from '@ionic/storage';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { DetailPage } from '../detail/detail';
import { AccountPage } from '../account/account';
import { SortpopupPage } from '../sortpopup/sortpopup';
import { DetailcategoryPage } from '../detailcategory/detailcategory';

import { FADEIN } from '../../app/loading-animation';

declare var hide_sale: boolean;

@Component({
    selector: 'page-search',
    templateUrl: 'search.html',
    providers: [Core],
    animations: FADEIN,
})
export class SearchPage {
    @ViewChild(Content) content: Content;
    @ViewChild('footer') buttonFooter;
    @ViewChild('header') header:ElementRef;
    DetailPage = DetailPage;
    AccountPage = AccountPage;
    SortpopupPage = SortpopupPage;
    DetailcategoryPage = DetailcategoryPage;
    wordpress_url = "";
    keyword: string = '';
    products: Object[] = []; attr: String; range: Object = { lower: 0, upper: 0 }; attributes: Object[] = [];
    filter: Object = { grid: true, open: null, value: {} }; filtering: boolean; tmpFilter: Object[];
    page = 1;
    sort: string = 'date';
    checkMenu: boolean = false;
    checkFilter: boolean = false;
    checkResuilt = false;
    checkSort = false;
    grid: boolean = true;
    favorite: Object = {};
    categories: Object[] = [];
    filter_sale: boolean = false;
    filter_stock: boolean = false;
    filter_new: boolean = false;
    cart: Object[] = [];
    currency: any;
    lang: any;
    show_keyboard = false;
    hide_sale = hide_sale;
    dir_mode: string;
    selected_cate = {};
    trans = {};
    search_all_cate = true;
    loaded_data = false;
    fillers_popup_top = "0px";
    isCache: boolean = false;
    time = new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: Http,
        public core: Core,
        public modalCtrl: ModalController,
        public config: Config,
        public translate: TranslateService,
        public cart_provider: ShoppingCartProvider,
        public storage: Storage,
        public ngZone: NgZone,
        public nav: Nav
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.lang = config['lang']['language'];
        this.currency = config['currency']['code'];
        this.dir_mode = config['lang']['display_mode'];
        translate.get('search').subscribe(trans => { this.trans = trans });
        let key = navParams.get('key');
        this.keyword = key;
        this.search(false, true);
        this.loadCategories();
        this.loadAttributes();
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        this.storage.get('cart').then(res => {
            this.cart = res;
        });
        if(!this.isCache) {
            this.fillers_popup_top = this.header.nativeElement.offsetHeight + "px";
        } else {
            this.isCache = true;
        }
    }

    backPage() {
        this.navCtrl.pop();
    }

    load(infiniteScroll) {
        setTimeout(() => {
            this.getProducts().subscribe(products => {
                if (products.length > 0) {
                    this.page++;
                    this.products = this.products.concat(products);
                } 
                infiniteScroll.complete();
            });
        }, 500);
    }

    updateCategory(category_id, $event) {
        if (!$event.checked && category_id == 0) {
            this.search_all_cate = true;
        } else if ($event.checked && category_id == 0) {
            this.search_all_cate = false;
        }
        if (!$event.checked && category_id != 0) {
            delete this.selected_cate[category_id];
        } else if ($event.checked && category_id != 0) {
            this.selected_cate[category_id] = category_id;
        }
    }

    loadAttributes() {
        let params = { post_num_page: 1, post_per_page: 200, time: this.time };
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getattribute', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            this.attributes = res.json();
            this.attributes['custom'] = new ObjectToArray().transform(this.attributes['custom']);
            this.reset();
        });
    }

    loadCategories() {
        let params = { cat_num_page: 1, cate_per_page: 200, time: this.time};
        if (this.config['language_param']) {
            params['mobile_lang'] = this.lang;
        }
        this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getcategories', {
            search: this.core.objectToURLParams(params)
        }).subscribe(res => {
            if (res.json()) {
                this.categories = res.json();
            }
        });
    };

    reset(resetFilter: boolean = false) {
        this.filter_sale = false;
        this.filter_stock = false;
        this.filter_new = false;
        this.range = { lower: 0, upper: 0 };
        if (resetFilter) {
            for (var key1 in this.filter['value']) {
                if (!this.filter['value'].hasOwnProperty(key1)) continue;
                let attr = this.filter['value'][key1];
                attr['select'] = [];
                for (var key2 in attr) {
                    if (!attr.hasOwnProperty(key2)) continue;
                    if (key2 != 'select') {
                        attr[key2] = false;
                    }
                }
            }
        } else {
            this.filter['value'] = {};
            if (this.attributes['attributes']) {
                this.attributes['attributes'].forEach(attr => {
                    this.filter['value'][attr['slug']] = {};
                    this.filter['value'][attr['slug']]['select'] = [];
                });
            }
            if (this.attributes['custom']) {
                this.attributes['custom'].forEach(attr => {
                    this.filter['value'][attr['slug']] = {};
                    this.filter['value'][attr['slug']]['select'] = [];
                });
            }
        }
    }

    search(has_filter: boolean = false, first_loading: boolean = false) {
        if (this.keyword) {
            this.page = 1;
            this.checkResuilt = false;
            this.checkFilter = false;
            this.checkMenu = false;
            if (!has_filter) {
                this.reset();
            }
            if(!first_loading) this.core.showLoading();
            this.getProducts().subscribe(products => {
                if(!first_loading) this.core.hideLoading();
                if (products.length > 0) {
                    this.page++;
                    this.products = products;
                } else {
                    this.products = [];
                    this.checkResuilt = true;
                }
                if(first_loading) this.loaded_data = true;
                this.content.scrollToTop();
            });
        }
    }

    getProducts(): Observable<Object[]> {
        return new Observable(observable => {
            let tmpFilter = [];
            for (var filter in this.filter['value']) {
                let attr = this.filter['value'][filter];
                if (Object.keys(attr).length > 0) for (var option in attr) {
                    if (option != 'select' && attr[option]) {
                        let now = {};
                        now['keyattr'] = filter;
                        now['valattr'] = option;
                        now['type'] = 'attributes';
                        tmpFilter.push(now);
                    }
                };
            }
            for (var filter_custom in this.filter['valueCustom']) {
                let attr = this.filter['value'][filter_custom];
                if (attr && Object.keys(attr).length > 0) for (var option_custom in attr) {
                    if (option_custom != 'select' && attr[option_custom]) {
                        let now = {};
                        now['keyattr'] = filter_custom;
                        now['valattr'] = option_custom;
                        now['type'] = 'attributes';
                        tmpFilter.push(now);
                    }
                };
            }
            
            let params = {};
            params['post_num_page'] = this.page;
            params['post_per_page'] = 10;
            params['time'] = this.time;
            params['status'] = 'publish';
            if (this.keyword) params['search'] = this.keyword;
            if (this.range['lower'] != 0) params['min_price'] = this.range['lower'];
            if (this.range['upper'] != 0) params['max_price'] = this.range['upper'];
            if (tmpFilter.length > 0) {
                params['attribute'] = JSON.stringify(tmpFilter);
            }
            if (this.filter_sale) {
                params['on_sale'] = 1;
            }
            if (this.filter_stock) {
                params['in_stock'] = 1;
            }
            if (this.filter_new) {
                params['arrival'] = 1;
            }
            params = this.core.addSortToSearchParams(params, this.sort);
            let cate = [];
            let obj;
            for (obj in this.selected_cate) {
                if (this.selected_cate.hasOwnProperty(obj)) {
                    cate.push(this.selected_cate[obj]);
                }
            }

            if (cate.length > 0 && !this.search_all_cate) {
                params['array_cat'] = '[' + cate.join() + ']';
            }
            params['woo_currency'] = this.currency;
            if (this.config['language_param']) {
                params['mobile_lang'] = this.lang;
            }
            this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getproductbyattribute', {
                search: this.core.objectToURLParams(params)
            }).subscribe(products => {
                var results = products.json();
                if (results) {
                    observable.next(results);
                }
                observable.complete();
            });
        });
    }

    doRefresh(refresher) {
        this.search(true);
        setTimeout(() => { refresher.complete(); }, 200);
    }

    showSort() {
        this.checkFilter = false;
        this.checkMenu = false;
        this.checkSort = true;
        let modal = this.modalCtrl.create(SortpopupPage, { sort: this.sort });
        modal.onDidDismiss(data => {
            if (data && this.sort != data) {
                this.sort = data;
                this.search();
            };
            this.checkSort = false;
        });
        modal.present();
    }

    showFilter() {
        this.checkFilter = !this.checkFilter;
        this.checkMenu = false;
    }

    showMenu() {
        this.checkMenu = !this.checkMenu;
        this.checkFilter = false;
    }

    quickAddCart(product, ele) {
        this.cart_provider.addSimpleToCart(product).subscribe(() => {
            // ele.target.nextSibling.nextElementSibling.classList.add("active");
            this.storage.get('cart').then(res => {
                this.cart = res;
            });
            this.buttonFooter.update_footer();
        });
    }

    inCart(product_id, cart) {
        return this.cart_provider.inCart(product_id, cart);
    }

    checkFilterValue(attr_slug, term_name, check_value) {
        if (check_value) {
            this.filter['value'][attr_slug]['select'].push(term_name);
        } else {
            var index = this.filter['value'][attr_slug]['select'].indexOf(term_name);
            this.filter['value'][attr_slug]['select'].splice(index, 1);
        }
    }

    swipe(event) {
        if (event.distance >= 90) {
            if ((event.direction == 2 && this.dir_mode == "ltr")
                || (event.direction == 4 && this.dir_mode == "rtl")) {
                this.showFilter();
            }
            else if ((event.direction == 4 && this.dir_mode == "ltr")
                || (event.direction == 2 && this.dir_mode == "rtl")) {
                this.showMenu();
            }
        }

    }

    swipeActiveHandler(event) {
        if (event.distance >= 90) {
            if ((event.direction == 4 && this.dir_mode == "ltr")
                || (event.direction == 2 && this.dir_mode == "rtl")) {
                this.showFilter();
            } else if ((event.direction == 2 && this.dir_mode == "ltr")
                || (event.direction == 4 && this.dir_mode == "rtl")) {
                this.showMenu();
            }
        }
    }
}
