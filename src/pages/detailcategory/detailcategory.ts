import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { Nav, NavController, NavParams, ModalController, Content } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';
import { Storage } from '@ionic/storage';


// Custom
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { TranslateService } from 'ng2-translate';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
// Page
import { DetailPage } from '../detail/detail';
import { SortpopupPage } from '../sortpopup/sortpopup';
import { SearchPage } from '../search/search';

import { FADEIN } from '../../app/loading-animation';

declare var hide_sale: boolean;

@Component({
    selector: 'page-detailcategory',
    templateUrl: 'detailcategory.html',
    providers: [ObjectToArray],
    animations: FADEIN,
})
export class DetailcategoryPage {
    DetailPage = DetailPage;
    SortpopupPage = SortpopupPage;
    SearchPage = SearchPage;
    wordpress_url = "";
    @ViewChild('search_input') search_input;
    @ViewChild(Content) content: Content;
    @ViewChild('footer') buttonFooter;
    @ViewChild('header') header:ElementRef;
    DetailcategoryPage = DetailcategoryPage;
    id: number = -1;
    name: String; attr: String; page = 1; sort: string = 'date'; range: Object = { lower: 0, upper: 0 };
    checkFilter: boolean = false;
    data: Object = {}; products: Object[] = []; attributes: Object[] = [];
    filter: Object = { grid: true, open: null, value: {}, valueCustom: {} }; filtering: boolean;
    categories: Object[] = []; loaded: boolean; checkFilterPopup: boolean = false;
    checkMenu: boolean = false;
    checkSort: boolean = false;
    chooseCat: Number;
    activeSearch: boolean = false;
    keyword: string = '';
    checkResuilt: boolean = false;
    filter_sale: boolean = false;
    filter_stock: boolean = false;
    filter_new: boolean = false;
    cart: Object[] = [];
    currency: any;
    lang: any;
    show_keyboard = false;
    parent_cate = {};
    hide_sale = hide_sale;
    dir_mode: string;
    loaded_data = false;
    fillers_popup_top = "0px";
    isCache: boolean = false;
    time = new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public core: Core,
        public http: Http,
        public config: Config,
        public modalCtrl: ModalController,
        public translate: TranslateService,
        public cart_provider: ShoppingCartProvider,
        public storage: Storage,
        public nav: Nav,
        public ngZone: NgZone
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.currency = config['currency']['code'];
        this.id = navParams.get('id');
        this.lang = config['lang']['language'];
        this.search(false, true);
        this.loadCategories();
        this.loadAttributes();

    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        this.dir_mode = this.config['lang']['display_mode'];
        this.storage.get('cart').then(res => {
            this.cart = res;
        })
        if(!this.isCache) {
            this.fillers_popup_top = this.header.nativeElement.offsetHeight + "px";
        } else {
            this.isCache = true;
        }
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
        if (this.id != 0) {
            let params = {time: this.time};
            if (this.config['language_param']) {
                params['mobile_lang'] = this.lang;
            }
            this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getcategories/' + this.id, {
                search: this.core.objectToURLParams(params)
            }).subscribe(
                res => {
                    if (JSON.stringify(res.json()) != '[]') {
                        this.parent_cate = res.json();
                    }
                }, err => console.log(err)
                )
        } else {
            this.translate.get('categories.all_product').subscribe(res => {
                this.parent_cate['name'] = res;
            });
        }

        let params = { cat_num_page: 1, cate_per_page: 200, parent: this.id, time: this.time };
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
            params['post_category'] = this.id.toString();
            params['status'] = 'publish';
            params['time'] = this.time;
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

    doRefresh(refresher) {
        this.search(true);
        setTimeout(() => { refresher.complete(); }, 200);
    }

    showSort(string: string) {
        this.checkFilter = false;
        this.checkMenu = false;
        this.checkSort = true;
        let modal = this.modalCtrl.create(SortpopupPage, { sort: this.sort }, {cssClass: "custom-modal modal-sort"});
        modal.onDidDismiss(data => {
            if (data && this.sort != data) {
                this.sort = data;
                // this.content.scrollToTop();
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

    searchclick() {
        if (!this.activeSearch) {
            this.activeSearch = true;
            setTimeout(() => {
                this.search_input.setFocus();
            }, 150);
        } else {
            this.activeSearch = false;
        }
    }

    search(has_filter: boolean = false, first_loading: boolean = false) {
        this.page = 1;
        this.checkResuilt = false;
        if (!has_filter) {
            this.reset();
        }
        this.checkFilter = false;
        if(!first_loading) this.core.showLoading();
        this.getProducts().subscribe(products => {
            this.activeSearch = false;
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
        // }
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
