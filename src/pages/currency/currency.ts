import { Component } from '@angular/core';
import { NavController, NavParams, ViewController} from 'ionic-angular';
import { HomePage } from '../home/home';
import { Storage } from '@ionic/storage';
import { Config } from '../../service/config.service';



/*
  Generated class for the CurrencyPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-currency',
  templateUrl: 'currency.html'
})
export class CurrencyPage {
    currency: string;
    list: Object[] = [];
    trans: Object = {};
    HomePage = HomePage;
    currency_index = 0;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public storage: Storage,
    public config: Config ) {
        this.currency = navParams.get('active');
        this.list = navParams.get('list');
    }


    /**
     * update price of products in cart
     * @param rate number
     * @param decimal number
     * get current rate
     * price = (price / current rate * rate).toFixed(decimal)
     * set new price to cart
     */
    updateCart(rate, decimal) {
        this.storage.get('currency').then(resp => {
            let current_rate = resp['rate'];
            this.storage.get('cart').then(res => {
                let object = res;
                let obj;
                for (obj in object) { 
                    if (object.hasOwnProperty(obj)) {
                        object[obj]["price"]  = (object[obj]["price"] / current_rate * rate).toFixed(decimal);
                        object[obj]["regular_price"]  = (object[obj]["regular_price"] / current_rate * rate).toFixed(decimal);
                        object[obj]["sale_price"]  = (object[obj]["sale_price"] / current_rate * rate).toFixed(decimal);
                    }
                }
                this.storage.set('cart', object);
            });
        });
    }

    /**
     * update shipping price in storage
     * @param rate number
     * @param decimal number
     */
    updateShipping(rate, decimal) {
        this.storage.get('currency').then(resp => {
            let current_rate = resp['rate'];
            this.storage.get('shipping_method').then(res => {
                if(res) {
                    let object = res;
                    let key;
                    for (key in object['tax']) { 
                        if (object.hasOwnProperty(key)) {
                            object['tax'][key]["value"]  = Number((object['tax'][key]["value"] / current_rate * rate).toFixed(decimal));
                        }
                    }
                    object["price"]  = Number((object["price"] / current_rate * rate).toFixed(decimal));
                    object["cost"]  = Number((object["cost"] / current_rate * rate).toFixed(decimal));
                    this.storage.set('shipping_method', object);
                }
            });
        }); 
    }

    /**
     * get current currency
     *  if current currency != chose currency
     *      updateCart()
     *      set new currency to storage
     *  else 
     *     dismiss()
     */
    confirm(){
        this.storage.get('currency').then(resp => {
            if(resp['code'] != this.list[this.currency_index]['code']) {
                this.updateCart(this.list[this.currency_index]['rate'], this.list[this.currency_index]['number_of_decimals']);
                this.updateShipping(this.list[this.currency_index]['rate'], this.list[this.currency_index]['number_of_decimals']);
                this.storage.set('currency', this.list[this.currency_index]);
                this.config['currency'] = this.list[this.currency_index];
                this.viewCtrl.dismiss(this.config['currency']);
            } else {
                this.dismiss();
            }
        });
    }

    dismiss() {
        this.viewCtrl.dismiss(false);
    }

}
