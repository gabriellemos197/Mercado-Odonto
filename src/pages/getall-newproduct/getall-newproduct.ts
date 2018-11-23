import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Core } from '../../service/core.service';
import { Observable } from 'rxjs/Observable';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';
import { Storage } from '@ionic/storage';

import { DetailPage } from '../detail/detail';
import { Http } from '@angular/http';
import { Config } from '../../service/config.service';

import { FADEIN } from '../../app/loading-animation';

declare var hide_sale: boolean;

@Component({
  selector: 'page-getall-newproduct',
  templateUrl: 'getall-newproduct.html',
    providers: [Core],
    animations: FADEIN,
})
export class GetallNewproductPage {
	page = 1; products: Object[] = [];
	enpoint:string;
	title:string;
    DetailPage = DetailPage;
    wordpress_url = "";
	@ViewChild('footer') buttonFooter;
    checkResult:boolean = false;
    cart: Object[] = [];
    currency: any;
    lang: any;
    hide_sale = hide_sale;
    loaded_data = false;
    time = new Date().getTime();
    
	constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public core: Core,
        public http: Http,
        public cart_provider: ShoppingCartProvider,
        public config: Config,
        public storage: Storage
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.currency = config['currency']['code'];
        this.lang = config['lang']['language'];
	  	this.enpoint = navParams.get('enpoint');
        this.title = navParams.get('title');
        this.getProducts(this.enpoint).subscribe(products => {
            console.log(products);
            if(products && products.length > 0) {
                this.products = products;
            }
            this.checkResult = true;
            this.loaded_data = true;
        });
    }
    
    ionViewDidEnter(){
        this.buttonFooter.update_footer();
        this.storage.get('cart').then(res => {
            this.cart = res;
        })
	}

	getProducts(enpoint:string): Observable<Object[]> {
		return new Observable(observable => {
            let params = { 
                post_num_page: this.page, post_per_page: 10,
                woo_currency: this.currency,
                time: this.time
            };
            if(this.config['language_param']) {
                params['mobile_lang'] = this.lang;
            } 
            let url = '';
           if (enpoint == "hot") {
                url = this.wordpress_url+'/wp-json/cellstore/static/getproducthots';
            } else {
                url = this.wordpress_url + '/wp-json/wooconnector/product/'+enpoint;
            }
			this.http.get(url, {
				search: this.core.objectToURLParams(params)
			}).subscribe(products => {
				observable.next(products.json());
				observable.complete();
			});
		});
	}

	doRefresh(refresher) {
        this.page = 1;
        this.core.showLoading();
        this.getProducts(this.enpoint).subscribe(products => {
            // this.products = [];
            if(products && products.length > 0) {
                this.products = products;
            }
            this.core.hideLoading();
        });
        setTimeout(() => {
           refresher.complete();
        }, 200);
    }
    
	load(infiniteScroll) {
        this.page++;
		this.getProducts(this.enpoint).subscribe(products => {
            this.products = this.products.concat(products);
			infiniteScroll.complete();
		});
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

}
