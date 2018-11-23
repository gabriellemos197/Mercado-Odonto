import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AlertController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import {Observable} from 'rxjs/Observable';

/*
  Generated class for the ShoppingCartProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
      */
  @Injectable()
  export class ShoppingCartProvider {
      trans: Object;

      constructor(
          public http: Http,
          private core: Core, 
          private storage: Storage, 
          private translate: TranslateService,
          private alertCtrl: AlertController
          ) {
          translate.get('detail').subscribe(trans => this.trans = trans);
      }

    /**
     * add simple product to cart
     * @param detail Object product details
     * @param quantity = 1
     * if detail type = simple && in_stock || type = simple && backordered
     *     if attributes !empty 
     *      tmp_attributes = attributes
     *  initialize data from detail
     *  storage get cart => val
     *     if !val val = {}
     *     exist = false
     *     for each object in val 
     *      if object.id == data.id
     *         exist = true
     *         if data sold indivisual
     *          show msg
     *         else
     *          object.quantity += data.quantity
     *          set cart and show added msg
     *     if !exist
     *      val[data.id] = data
     *      set cart and show added msg
     * else if detaul type = simple && !in_stock && !backordered
     *  show msg
     *  return Observable
     */
     addSimpleToCart(detail, quantity: number = 1): Observable<any> {
         return new Observable(observable => {
             if((detail.in_stock && detail.stock_quantity == null) 
                 ||(detail.in_stock && detail.stock_quantity > 0) 
                 || detail.backordered) {
                 let data:any = {};
                 data.idCart = detail.id;
                 data.id = detail["id"];
                 data.name = detail["name"];
                 if(detail['title']) {
                     data.name = detail['title'];
                 }
                 data.images = "";
                 if(detail["cellstore_images"] && detail["cellstore_images"][0]['cellstore_square']) 
                     data.images = detail["cellstore_images"][0]['cellstore_square'];
                 data.attributes = {};
                 data.regular_price = detail["regular_price"];
                 data.sale_price = detail["sale_price"];
                 data.price_html = detail["price_html"];
                 data.price = detail["price"];
                 data.quantity = quantity;
                 if(detail['sold_individually']) {
                    data.max_quantity = 1;
                 } else {
                    data.max_quantity = detail['stock_quantity'];
                 }
                 data.sold_individually = detail['sold_individually'];
                 this.storage.get('cart').then((val) => {
                     if(!val) val = {};
                     let key;
                     let exist = false;
                     for (key in val) { 
                         if (val.hasOwnProperty(key)) {
                             if(val[key]['id'] == data.id) {
                                 exist = true;
                                 if(detail['sold_individually']) {
                                     let alert = this.alertCtrl.create({
                                         cssClass: 'alert-no-title',
                                         message: this.trans['add_indivisual_only'],
                                         buttons: [this.trans['grouped']['button']]
                                     });
                                     alert.present();
                                     break;
                                 } else {
                                     val[key].quantity += data.quantity;
                                     this.storage.set('cart', val).then(() => {
                                         observable.next(null);
                                         observable.complete();
                                         this.core.showToastBottom(this.trans['add']);
                                     });
                                     break;
                                 } 
                             }
                         }
                     }
                     if(!exist) {
                         val[data.idCart] = data;
                         this.storage.set('cart', val).then(() => {
                             observable.next(null);
                             observable.complete();
                             this.core.showToastBottom(this.trans['add']);
                         });
                     }
                 });        
             } else {
                 this.core.showToastBottom(this.trans['out_stock_2']);
             }
         });
     }


    /**
     * check if product in cart
     * @param product_id number
     * @param cart Object[]
     * foreach product in cart
     *  if product id == product_id
     *      return true
     * return false
     * @return boolean
     */
     inCart(product_id, cart) {
         let key;
         for (key in cart) { 
             if (cart.hasOwnProperty(key)) {
                 if(cart[key]['id']==product_id) {
                     return true;
                 }
             }
         }
         return false;
     }

    /**
     * reduce quatity of simple product in cart
     * @param product Object product detail
     * for each object in cart
     *  if object id == product id && object quantity > 1
     *     object quantity +- 1
     *     del = true
     *  else if object id == product id && object quantity <= 1
     *     remove object
     *     del = true
     *  if del 
     *     set new cart
     *     show msg  
     * @return Observable
     */
     reduceQuantity(product): Observable<any> {
         return new Observable(observable => {
             this.storage.get('cart').then(object => {
                 let key;
                 let del = false;
                 for(key in object) {
                     if(object.hasOwnProperty(key)) {
                         if(object[key]['id'] == product['id'] && object[key]['quantity'] > 1) {
                             object['key']['quantity'] -= 1;
                             del = true;
                             break;
                         } else if(object[key]['id'] == product['id'] && object[key]['quantity'] <= 1) {
                             delete object[key];
                             del = true;
                             break;
                         }
                     } 
                 }
                 if(del) {
                     this.storage.set('cart', object).then(() => {
                         observable.next(null);
                         observable.complete();
                         this.core.showToastBottom(this.trans['remove']);
                     });
                 }
             })
         })
     }

    /**
     * check selected product has variation
     * @param select Object selected attributes
     * @param variations Object[] variations of product
     * variation_id = 0
     * for each object in select
     *  tmp.push object
     * sort variations by length
     * for each object in variations
     *  if tmp == object.attributes
     *      variation_id = object.id
     *  else if tmp.length > object.attributes.length
     *      same = true
     *      for each obj in object.attributes
     *          exist = false
     *          for each temp in tmp
     *              if temp == obj && object.in_stock || temp == obj && object.backordered
     *                  exist = true
     *           if !exist 
     *              same = false
     *      if same 
     *         variation_id =  object.id
     * return variation_id
     * @return number
     */
     checkVariation(select, variations) {
         let i;
         let tmp = [];
         let key;
         let variation_id = 0;
         for (key in select) { 
             if (select.hasOwnProperty(key)) {
                 tmp.push(select[key]);
             }
         }

         variations.sort(function(a, b){
            // ASC  -> a.length - b.length
            // DESC -> b.length - a.length
            return b.attributes.length - a.attributes.length;
        });

         for(i=0; i<variations.length; i++) {
            // remove slug of variation 
            let k;
            for(k=0; k<variations[i]['attributes'].length; k++) {
                delete variations[i]['attributes'][k].slug;
                delete variations[i]['attributes'][k].options_slug;
            }
            if(JSON.stringify(tmp) == JSON.stringify(variations[i]['attributes']) && (variations[i]['in_stock'] || variations[i]['backordered'])) {
                variation_id = variations[i]['id'];
            } else if (tmp.length > variations[i]['attributes'].length) {
                let t;
                let same = true;
                for(t=0; t<variations[i]['attributes'].length; t++) { // check if attributes not in tmp
                    let k;
                    let exist = false;
                    for(k=0; k<tmp.length; k++) {
                        if((JSON.stringify(tmp[k]) == JSON.stringify(variations[i]['attributes'][t])
                            && variations[i]['in_stock']) || (JSON.stringify(tmp[k]) == JSON.stringify(variations[i]['attributes'][t])
                            && variations[i]['backordered'])) {
                            exist = true;
                        break;
                    }
                }
                if(!exist) same = false;
            }
            if(same) variation_id = variations[i]['id'];
        }
    } 
    return variation_id;
}

    /**
     * get information of variation
     * @param list: array - list of variation
     * @param variaton_id: number
     * for each variation in list
     *    if variation.id = variation_id
     *      return variation
     *  return {}
     * @return object
     */
     getVariationInfo(list, variation_id) {
         let i;
         for(i=0; i<list.length; i++) {
             if (list[i].id == variation_id) {
                 return list[i];
             }
         }
         return {};
     }

    /**
     * replace information of product detail by variation detail
     * @param product_detail: Object
     * @param variation_id: number
     * @param default_product_img: Object
     * tmp_product = getVariationInfo(product_detail.variations, variation_id)
     * remove id, attributes, type from tmp_product
     * if default_product_img & tmp_product has image
     *     product_detail images[0] = image
     * else if default_product_img & tmp_product has not image
     *     if images[0] != default_product_img
     *         product_detail images[0] = default_product_img
     * remove image of tmp_product
     * product_update = product_detail assign with tmp_product
     * @return product_update: Object
     */
     replaceDetailByVariation(product_detail, variation_id, default_product_img) {
         let product = Object.assign({}, product_detail);
         let tmp_product = Object.assign({}, this.getVariationInfo(product.variations, variation_id));
         delete tmp_product["id"];
         delete tmp_product["attributes"];
         delete tmp_product["type"];
         if (default_product_img && tmp_product['cellstore_images'][0]['cellstore_square']) {
             product.cellstore_images[0] = tmp_product['cellstore_images'][0];
         } else if (default_product_img 
             && !tmp_product['cellstore_images'][0]['cellstore_square']) {
             if(JSON.stringify(product.cellstore_images[0]) != JSON.stringify(default_product_img)) {
                 product.cellstore_images[0] = default_product_img; 
             }     
         }
         delete tmp_product["cellstore_images"];
         // check quantity
         if(tmp_product['stock_quantity'] == null || tmp_product['stock_quantity'] == 0) {
            tmp_product['stock_quantity'] = product['original_quantity'];
         }
         let product_update = Object.assign(product, tmp_product);
         return product_update;
     }

    /**
     * add variation of variable product to cart
     * @param detail Object
     * @param variation_id number
     * @param attributes Object
     * @param quantity number
     * for each variation in detail.variations
     *  if variation.id = variation_id
     *      variation_product = variation
     *      variation_product.image = detail.image
     *      variation_product.variation_id = variation_product.id
     *      variation_product.id = detail.id
     *      addVariationToCart(variation_product, attributes, quantity)
     * @return Observable
     */
     addVariableToCart(detail, variation_id, attributes, quantity: number = 1): Observable<any> {
         return new Observable(observable => {
             let i;
             for(i=0; i<detail['variations'].length; i++) {
                 if(detail['variations'][i]['id']==variation_id) {
                     let variation_product = detail['variations'][i];
                     variation_product.variation_id = variation_product.id;
                     variation_product.base_id = detail.id;
                     if(detail['cellstore_images'][0]['cellstore_square']) {
                         variation_product['cellstore_images'][0]['cellstore_square'] = detail['cellstore_images'][0]['cellstore_square'];
                     }
                     if(variation_product['stock_quantity'] == null || variation_product['stock_quantity'] == 0) {
                        variation_product.stock_quantity = detail.original_quantity;
                     }
                     this.addVariationToCart(variation_product, attributes, quantity).subscribe(() => {
                         observable.next(null);
                         observable.complete();
                     });
                     break;
                 }
             }
         }) 
     }

    /**
     * add variation of  product to cart
     * @param detail Object product details
     * @param attributes Object = {}
     * @param quantity = 1
     * if detail type = variation 
     *     if attributes !empty && attributes type == variation
     *      tmp_attributes = attributes
     *  initialize data from detail
     *  storage get cart => val
     *     if !val val = {}
     *     same = 0
     *     tmp_key = 0
     *     for each object in val 
     *      if object.id == data.id
     *          same++
     *          if data sold indivisual
     *              show error msg
     *              break
     *          else if !sold indivisual && object.attributes = data.attributes
     *             tmp_key = key of object
     *     if same>0 && !sold indivisual && tmp_key != 0
     *        object[tmp_key].quantity += data.quantity
     *        set cart and show added msg
     *     else if same > 0 && !sold indivisual && tmp_key == 0
     *         data.idCart append same
     *         set cart and show added msg
     *     else if  same == 0
     *         val[data.idCart] = data
     *         set cart and show added msg
     *  return Observable
     */
     addVariationToCart(detail, attributes: Object = {}, quantity: number = 1): Observable<any> {
         return new Observable(observable => {
             if ((detail.type == 'variation' && detail.in_stock) 
                 || (detail.type == 'variation' && detail.backordered)) {
                 let tmp_attributes: any = {};
             if(Object.keys(attributes).length != 0 && detail.type == 'variation'){
                 tmp_attributes = attributes;
             }
             let data:any = {};
             data.idCart = Number(detail.id.toString() + detail.variation_id.toString());   
             data.id = detail["base_id"];
             data.name = detail["name"];
             if(detail['title']) {
                 data.name = detail['title'];
             }
             if(detail["cellstore_images"] && detail["cellstore_images"][0]['cellstore_square']) 
                 data.images = detail["cellstore_images"][0]['cellstore_square'];
                // if(!detail["cellstore_images"] && detail['images']['cellstore_square']) {
                //     data.images = detail['images']['cellstore_square'];
                // }
                data.variation_id = detail['variation_id'];
                data.attributes = tmp_attributes;
                data.regular_price = detail["regular_price"];
                data.sale_price = detail["sale_price"];
                data.price_html = detail["price_html"];
                data.price = detail["price"];
                data.quantity = quantity;
                data.sold_individually = detail['sold_individually'];
                if(detail['sold_individually']) {
                    data.max_quantity = 1;
                 } else {
                    data.max_quantity = detail['stock_quantity'];
                 }
                this.storage.get('cart').then((val) => {
                    if(!val) val = {};
                    let key;
                    let same = 0;
                    let tmp_key = 0;
                    for (key in val) { 
                        if (val.hasOwnProperty(key)) {
                            if(val[key]['id'] == data.id) {
                                same++;
                                if(detail['sold_individually']) {
                                    let alert = this.alertCtrl.create({
                                        cssClass: 'alert-no-title',
                                        message: this.trans['add_indivisual_only'],
                                        buttons: [this.trans['grouped']['button']]
                                    });
                                    alert.present();
                                    break;
                                } else if (!detail['sold_individually'] && JSON.stringify(val[key]['attributes']) == JSON.stringify(data['attributes'])) {
                                    tmp_key = key; 
                                }  
                            }
                        }
                    }
                    if(same>0 && !detail['sold_individually'] && tmp_key!=0) {
                        val[tmp_key].quantity += data.quantity;
                        this.storage.set('cart', val).then(() => {
                            observable.next(null);
                            observable.complete();
                            this.core.showToastBottom(this.trans['add']);
                        });
                    } else if(same>0 && !detail['sold_individually'] && tmp_key==0) {
                        data.idCart = Number(data.idCart.toString() + same.toString());
                        val[data.idCart] = data;
                        this.storage.set('cart', val).then(() => {
                            observable.next(null);
                            observable.complete();
                            this.core.showToastBottom(this.trans['add']);
                        });
                    } else if(same == 0) {
                        val[data.idCart] = data;
                        this.storage.set('cart', val).then(() => {
                            observable.next(null);
                            observable.complete();
                            this.core.showToastBottom(this.trans['add']);
                        });
                    }
                });		
            } else if(detail.type == 'variation' && !detail.in_stock && !detail.backordered) {
                this.core.showToastBottom(this.trans['out_stock_2']);
            }
        });
}


    /**
     * add grouped product to cart
     * @param product Object product detail
     * simple_list = []
     * foreach pro in grouped product
     *  if pro.type == simple && in_stock || allow backordered
     *      if pro.quantity != 0
     *          if pro sold indivisual 
     *              pro.quantity = 1
     *          simple_list push pro
     *      
     * if length of simple_list == 0
     *          show err msg
     * else 
     *  get cart from storage
     *      foreach pro in grouped product
     *          if pro.type == simple && in_stock
     *              initial data from pro
     *              if inCart(pro, cart) && !sold indivisual
     *                  cart[data.idCart] += data.quantity
     *              if !inCart(pro, cart) || !sold indivisual
     *                  cart[data.idCart] = data
     *      add new cart and show msg
     * @return Observable
     */
     addGroupedToCart(product): Observable<any> {
         return new Observable(observable => {
             let simple_list = [];
             let key;
             for (key in product) { 
                 if (product.hasOwnProperty(key)) {
                     if((product[key].type=="simple" && product[key].in_stock) 
                         || (product[key].type=="simple" && product[key].backordered)) {
                         if(product[key].quantity != 0) {
                             if(product[key].sold_individually) {
                                 product[key].quantity = 1;
                             }
                             simple_list.push(product[key]);
                         } 
                     } 
                 }
             }
             if(simple_list.length == 0) {
                 this.core.showToastBottom(this.trans['empty_quantity']);
             } else {
                 this.storage.get('cart').then(cart => {
                     if(!cart) cart = {};
                     for (key in product) { 
                         if (product.hasOwnProperty(key) && product[key].type=="simple") {
                             if((product[key].in_stock && product[key].stock_quantity == null) 
                             ||(product[key].in_stock && product[key].stock_quantity > 0) 
                             || product[key].backordered) {
                                 let data:any = {};

                             data.idCart = product[key].id;
                             data.id = product[key]["id"];
                             data.name = product[key]["name"];
                             if(product[key]['title']) {
                                 data.name = product[key]['title'];
                             }
                             data.images = "";
                             if(product[key]["cellstore_images"] && product[key]["cellstore_images"][0]['cellstore_square']) 
                                 data.images = product[key]["cellstore_images"][0]['cellstore_square'];
                             data.attributes = {};
                             data.regular_price = product[key]["regular_price"];
                             data.sale_price = product[key]["sale_price"];
                             data.price_html = product[key]["price_html"];
                             data.price = product[key]["price"];
                             data.quantity = product[key].quantity;
                             data.sold_individually = product[key]['sold_individually'];
                             if(product[key]['sold_individually']) {
                                data.max_quantity = 1;
                             } else {
                                data.max_quantity = product[key]['stock_quantity'];
                             }
                             if(this.inCart(product[key]['id'], cart) && !product[key].sold_individually) {
                                 cart[data.idCart].quantity += data.quantity;
                             } else if (!this.inCart(product[key]['id'], cart))  {
                                 cart[data.idCart] = data;
                             }
                         }     
                     }
                 }

                 this.storage.set('cart', cart).then(() => {
                     observable.next(null);
                     observable.complete();
                     this.core.showToastBottom(this.trans['add']);
                 })
             })
             }
         })
     }

    /**
     * convert product list to new type list for check out
     * @param product_list Object[]
     * products = []
     * for each product in product_list
     *  tmp = {}
     *  tmp.product_id = product.id
     *  tmp.quantity = product.quantity
     *  if product.variation_id
     *      tmp.variation_id = product.variation_id
     *  tmp.attributes = {}
     *  for each attr in product.attributes
     *     tmp.attr.taxanomy = attr.name
     *  products.push(tmp)
     * @return products
     */
     convertProductCheckout(product_list) {
         let products: Object[] = [];
         let key;
         for(key in product_list) {
             if(product_list.hasOwnProperty(key)) {
                 let product = product_list[key];
                 let tmp = {};
                 tmp['product_id'] = product['id'];
                 tmp['quantity'] = product['quantity'];
                 if (product['variation_id']) tmp['variation_id'] = product['variation_id'];
                 tmp['attributes'] = {}
                 let key_child;
                 for(key_child in product['attributes']) {
                     if(product['attributes'].hasOwnProperty(key_child)) {
                         let slug = product['attributes'][key_child]['taxanomy'];
                         tmp['attributes'][slug] = product['attributes'][key_child].option;
                     }
                 }
                 products.push(tmp);
             }
         }
         return products;
     }

    /**
      * remove out stock product from cart
      * @param string[] err_product list of out-of-stock product id
      * @param data[] list of product in cart
      * @return Object[]
      */
      removeErrProduct(err_product, data) {
          let product_list = Object.assign({}, data);
          for (let key in data) {
              let key_tmp = Number(key);
              if(err_product.includes(key_tmp)) {
                  delete product_list[key]; 
              }
          }
          return product_list;
      }

    /**
     * translate default error message to new one
     * @param message string
     */
     translateErrorMsg(message: string) {
         console.log(message);
         if(message) {
            this.translate.get('cart').subscribe(
                 tmp_trans =>{
                     if(message.indexOf('Sorry, Coupon not exist .') !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_invalid']);
                     } else if (message.indexOf("Sorry, Coupon already applied! .") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_exist']);
                     } else if (message.indexOf("Sorry, Coupon has expired.") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_expired']);
                     } else if (message.indexOf("Sorry, Coupon usage limit has been reached .") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_limit']);
                     } else if (message.indexOf("Sorry, Amount not suitable for Coupon") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_amount']);
                     } else if (message.indexOf("Sorry, Coupon usage limit per user has been reached .") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_limit_per']);
                     } else if(message.indexOf("Sorry, Coupon only one") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_only']);
                     } else if(message.indexOf("Sorry, Coupon not for sale products") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_not_sale']);
                     } else if(message.indexOf("Sorry, Coupon not supported with these products.") !== -1) {
                         this.core.showToastBottom(tmp_trans['counpon_not_products']);
                     }  else if(message.indexOf("Sorry, Coupon not supported with these categories.") !== -1) {
                         this.core.showToastBottom(tmp_trans['counpon_not_categories']);
                     } else if(message.indexOf("Sorry, It looks like this coupon code is not yours.") !== -1) {
                         this.core.showToastBottom(tmp_trans['coupon_not_yours']);
                     } else if(message.indexOf('Sorry, Product only sells quantity 1 .') !== -1) {
                        this.core.showToastBottom(tmp_trans['sold_indivisual']);
                     }  else {
                         this.core.showToastBottom(message);
                     }
                 }
             );
         }
         
     }
 }
