import { Component,ViewChild } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';

// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { TranslateService } from 'ng2-translate';
import { ShoppingCartProvider } from '../../providers/shopping-cart/shopping-cart';
import { DetailPage } from '../detail/detail';

import { FADEIN_LONGER } from '../../app/loading-animation';

declare var hide_sale: boolean;

@Component({
  selector: 'page-favorite',
  templateUrl: 'favorite.html',
  animations: FADEIN_LONGER,
})
export class FavoritePage {
	DetailPage = DetailPage;
    data:Object;
    cart: Object[]=[];
    @ViewChild('footer') buttonFooter;
    isCache = false;
    loaded = false;
    hide_sale = hide_sale;
    
	constructor(
	  	public storage: Storage,
		public alertCtrl: AlertController,
		public translate: TranslateService,
        public navCtrl: NavController,
        public cart_provider: ShoppingCartProvider,
        public core: Core
	  	) {
	  	this.getData();
	}
	ionViewDidEnter(){
      	this.buttonFooter.update_footer();
        if(this.isCache) {
        	this.getData();
        } else {
        	this.isCache = true;
        }
    }

    getData(){
		this.storage.get('favorite').then(val => {
			if(val) {
				this.data = val;
			}
            this.loaded = true;
        });
        this.storage.get('cart').then(res => {
            this.cart = res;
        })
    }

	clear(){
	  	let favoriteClearTrans:Object;
	  	this.translate.get('favorite.clear').subscribe(val => {
	  		favoriteClearTrans = val;
	  		let confirm = this.alertCtrl.create({
	  			message: favoriteClearTrans["message"],
	  			cssClass: 'alert-no-title alert-blue-btn',
	  			buttons: [
					{
						text: favoriteClearTrans["no"],
					},
					{
						text: favoriteClearTrans["yes"],
						cssClass: 'dark',
						handler: () => {
							this.storage.remove('favorite').then(() => { this.data = {}; });
						}
					}
				]
	  		});
	  		confirm.present();
	  	})
	}
	shop(){
		this.navCtrl.popToRoot();
	}
	delete(id:Number){
		let data = Object.assign({}, this.data);
		delete data[Number(id)];
		this.data = data;
		this.storage.set('favorite', this.data);
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

}
