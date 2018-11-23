import { Component, ViewChild } from '@angular/core';
import { NavController, Platform, AlertController, NavParams, Content } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { TranslateService } from 'ng2-translate';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Storage } from '@ionic/storage';
import { DetailPage } from '../detail/detail';
import { Keyboard } from '@ionic-native/keyboard';
import { Device } from '@ionic-native/device';

// Custom
import { CoreValidator } from '../../validator/core';
import { Config } from '../../service/config.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Core } from '../../service/core.service';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { ThankPage } from '../thank/thank';
import { SigninPage } from '../signin/signin';
import { PrivacyPage } from '../privacy/privacy';

import { FADEIN } from '../../app/loading-animation';

@Component({
    selector: 'page-checkout',
    templateUrl: 'checkout.html',
    providers: [Core, StorageMulti, ObjectToArray, Geolocation, LocationAccuracy, Diagnostic],
    animations: FADEIN,
})
export class CheckoutPage {
    // AddressPage = AddressPage;
    PrivacyPage = PrivacyPage;
    DetailPage = DetailPage;
    SigninPage = SigninPage;
    wordpress_url = '';
    @ViewChild(Content) content: Content;
    @ViewChild('footer') buttonFooter;
    @ViewChild('note_input') note_input;
    formAddress: FormGroup;
    login: Object = {}; data: Object = {}; rawData: Object;
    isCache: boolean = false; useShipping: boolean;
    statesBilling = "input"; statesShipping = "input";
    countries: Object[] = []; states: Object = {};
    checkAdd: boolean = false;
    checkBill: boolean = false;
    // @ViewChild('cart') buttonCart;
    login_checkout: Object; user: Object; cart: Object; coupon: Object[] = [];
    data_checkout: any = {};
    total_order: number;
    shipping: string; payment: string; products: Object[];
    trans: string;
    chooselocation: Object = {};
    params: Object = {};
    note: string;
    activePayment: boolean = false;
    activeConfirm: boolean = false;
    checklist: boolean = false;
    submitAddress = false;
    submitShipping = false;
    payment_method_empty = false;
    trans_items: any;
    check_privacy: any;
    check_privacy_empty = false;
    submitAll = false;
    selectCountryOptions: any;
    selectStateOptions: any;
    country_no_post: any;
    billing_post_required = "input_required";
    shipping_post_required = "input_required";
    email_exist = false;
    keyboard_show = false;
    loading_ship = false;
    loading_payment = false;
    available_ship_payment = false;
    activeNote = false;
    playerID: string;

    constructor(
        public storageMul: StorageMulti,
        public core: Core,
        public formBuilder: FormBuilder,
        public storage: Storage,
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: Http,
        public platform: Platform,
        public InAppBrowser: InAppBrowser,
        public config: Config,
        public translate: TranslateService,
        public geolocation: Geolocation,
        public locationAccuracy: LocationAccuracy,
        public alertCtrl: AlertController,
        public diagnostic: Diagnostic,
        public keyboard: Keyboard,
        public device: Device
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.total_order = navParams.get('total');
        this.countries = config['countries'];

        translate.get('states').subscribe(trans => {
            this.states = Object.assign(trans, config['states']);
        });
        translate.get('no_postcode').subscribe(trans => {
            this.country_no_post = trans;
        });
        translate.get('checkout.confirm_location').subscribe(trans => {
            this.chooselocation = trans;
        });
        translate.get('checkout').subscribe(trans => this.trans = trans);

        this.formAddress = this.formBuilder.group({
            billing_first_name: ['', CoreValidator.required],
            billing_last_name: ['', CoreValidator.required],
            billing_company: [''],
            billing_address_1: ['', CoreValidator.required],
            billing_address_2: [''],
            billing_city: ['', CoreValidator.required],
            billing_country: ['', CoreValidator.required],
            billing_state: [''],
            billing_postcode: [''],
            billing_phone: ['', CoreValidator.required],
            user_email: ['', Validators.compose([CoreValidator.required, CoreValidator.isEmail])],
            shipping_first_name: ['', CoreValidator.required],
            shipping_last_name: ['', CoreValidator.required],
            shipping_company: [''],
            shipping_address_1: ['', CoreValidator.required],
            shipping_address_2: [''],
            shipping_city: ['', CoreValidator.required],
            shipping_country: ['', CoreValidator.required],
            shipping_state: [''],
            shipping_postcode: ['', CoreValidator.required]
        });
        this.getData();
        this.chooseGetLocation();
    }

    ngOnInit() {
        this.keyboard.onKeyboardShow().subscribe(() => {
            this.keyboard_show = true;
        });

        this.keyboard.onKeyboardHide().subscribe(() => {
            this.keyboard_show = false;
        });

        this.selectCountryOptions = {
            cssClass: "select-address",
            title: this.trans['selectCountry']
        };
        this.selectStateOptions = {
            cssClass: "select-address",
            title: this.trans['selectState']
        };
        this.platform.registerBackButtonAction(() => {
            let active = this.navCtrl.getActive().component.name;;
            if (this.activeConfirm && active == "CheckoutPage") {
                this.editShipping();
            } else if (this.activePayment && active == "CheckoutPage") {
                this.editAddress();
            } else {
                this.navCtrl.pop();
            }
        });
    }

    ionViewDidEnter() {
        this.buttonFooter.update_footer();
        if (this.isCache) {
            this.getData();
        }
        else this.isCache = true;
    }

    getData() {
        this.storageMul.get(['login', 'useShipping', 'user', 'coupon', 'userID']).then(val => {
            if (val['login']) this.login = val['login'];
            if (!val['useShipping']) this.useShipping = false;
            if (val["userID"]) this.playerID = val["userID"];
            if (val['coupon']) this.coupon = val['coupon'];
            else this.useShipping = true;
            if (val['user']) {
                this.data = val['user'];
                this.changeCountryBilling(this.data['billing_country']);
                this.changeCountryShipping(this.data['shipping_country']);
            }
            this.initialData();
        });
    }

    initialData() {
        this.formAddress.patchValue({
            billing_phone: this.data["billing_phone"],
            user_email: this.data["user_email"],
            billing_first_name: this.data["billing_first_name"],
            billing_last_name: this.data["billing_last_name"],
            billing_company: this.data["billing_company"],
            billing_address_1: this.data["billing_address_1"],
            billing_address_2: this.data["billing_address_2"],
            billing_city: this.data["billing_city"],
            billing_country: this.data["billing_country"],
            billing_state: this.data["billing_state"],
            billing_postcode: this.data["billing_postcode"],
            shipping_first_name: this.data["shipping_first_name"],
            shipping_last_name: this.data["shipping_last_name"],
            shipping_company: this.data["shipping_company"],
            shipping_address_1: this.data["shipping_address_1"],
            shipping_address_2: this.data["shipping_address_2"],
            shipping_city: this.data["shipping_city"],
            shipping_country: this.data["shipping_country"],
            shipping_state: this.data["shipping_state"],
            shipping_postcode: this.data["shipping_postcode"]
        });
        this.rawData = Object.assign({}, this.formAddress.value);
        // this.updateShipping();
    }

    updateShipping() {
        if (this.useShipping) {
            this.formAddress.patchValue({
                shipping_first_name: this.formAddress.value["billing_first_name"],
                shipping_last_name: this.formAddress.value["billing_last_name"],
                shipping_company: this.formAddress.value["billing_company"],
                shipping_address_1: this.formAddress.value["billing_address_1"],
                shipping_address_2: this.formAddress.value["billing_address_2"],
                shipping_city: this.formAddress.value["billing_city"],
                shipping_country: this.formAddress.value["billing_country"],
                shipping_state: this.formAddress.value["billing_state"],
                shipping_postcode: this.formAddress.value["billing_postcode"]
            });
            this.changeCountryShipping(this.formAddress.value["billing_country"]);
            this.formAddress.patchValue({
                shipping_state: this.formAddress.value["billing_state"],
                shipping_postcode: this.formAddress.value["billing_postcode"]
            });
        } else {
            this.formAddress.patchValue({
                shipping_first_name: this.formAddress.value["shipping_first_name"],
                shipping_last_name: this.formAddress.value["shipping_last_name"],
                shipping_company: this.formAddress.value["shipping_company"],
                shipping_address_1: this.formAddress.value["shipping_address_1"],
                shipping_address_2: this.formAddress.value["shipping_address_2"],
                shipping_city: this.formAddress.value["shipping_city"],
                shipping_country: this.formAddress.value["shipping_country"],
                shipping_state: this.formAddress.value["shipping_state"],
                shipping_postcode: this.formAddress.value["shipping_postcode"]
            });
        }
    }

    changeCountryBilling(e) {
        if (this.states[e] && this.states[e] != 'input' && this.states[e] != "no") {
            this.statesBilling = this.states[e];

            // this.formAddress.setControl('billing_state', new FormControl('', CoreValidator.required));
        } else if (this.states[e] && this.states[e] == 'input') {
            this.statesBilling = 'input';
            // this.formAddress.setControl('billing_state', new FormControl(''));
        } else if (this.states[e] && this.states[e] == 'no') {
            this.statesBilling = 'no';
            // this.formAddress.setControl('billing_state', new FormControl(''));
        } else {
            this.statesBilling = 'input_required';
            // this.formAddress.setControl('billing_state', new FormControl('', CoreValidator.required));
        }

        if (this.country_no_post[e] && this.country_no_post[e] == "input") {
            this.billing_post_required = "input";
            // this.formAddress.setControl('billing_postcode', new FormControl(''));
        } else if (this.country_no_post[e] && this.country_no_post[e] == "no") {
            this.billing_post_required = "no";
            // this.formAddress.setControl('billing_postcode', new FormControl(''));
        } else {
            this.billing_post_required = "input_required";
            // this.formAddress.setControl('billing_postcode', new FormControl('', CoreValidator.required));
        }
        this.formAddress.patchValue({
            billing_state: "",
            billing_postcode: ""
        });
        if(this.useShipping) this.updateShipping();
    }
    checkUseBilling() {
        if (this.useShipping) this.updateShipping();
    }
    changeCountryShipping(e) {
        if (this.states[e] && this.states[e] != 'input' && this.states[e] != "no") {
            this.statesShipping = this.states[e];
            // this.formAddress.setControl('shipping_state', new FormControl('', CoreValidator.required));
        } else if (this.states[e] && this.states[e] == 'input') {
            this.statesShipping = 'input';
            // this.formAddress.setControl('shipping_state', new FormControl(''));
        } else if (this.states[e] && this.states[e] == 'no') {
            this.statesShipping = 'no';
            // this.formAddress.setControl('shipping_state', new FormControl(''));
        } else {
            this.statesShipping = 'input_required';
            // this.formAddress.setControl('shipping_state', new FormControl('', CoreValidator.required));
        }
        if (this.country_no_post[e] && this.country_no_post[e] == "input") {
            this.shipping_post_required = "input";
            this.formAddress.setControl('shipping_postcode', new FormControl(''));
        } else if (this.country_no_post[e] && this.country_no_post[e] == "no") {
            this.shipping_post_required = "no";
            this.formAddress.setControl('shipping_postcode', new FormControl(''));
        } else {
            this.shipping_post_required = "input_required";
            this.formAddress.setControl('shipping_postcode', new FormControl('', CoreValidator.required));
        }
        this.formAddress.patchValue({
            shipping_state: "",
            shipping_postcode: ""
        });
    }

    confirm() {
        this.submitAddress = true;
        if(this.useShipping) this.updateShipping();
        if ((this.billing_post_required == "input_required"
            && this.formAddress.controls.billing_postcode.value)
            || this.billing_post_required != "input_required") {
            if ((this.statesBilling == "input_required"
                && this.formAddress.controls.billing_postcode.value)
                || (this.billing_post_required != "input" && this.billing_post_required != 'no'
                    && this.formAddress.controls.billing_postcode.value)
                || this.billing_post_required == "input" || this.billing_post_required == 'no') {
                if (this.formAddress.valid) {
                    this.storage.set('useShipping', this.useShipping);
                    
                    this.content.scrollToTop();
                    this.storage.get('payment_method').then(
                        res => {
                            if (res) {
                                this.payment = res;
                            }
                        }
                    )
                    if (JSON.stringify(this.rawData) != JSON.stringify(this.formAddress.value)) {
                        this.data = this.formAddress.value;
                        this.rawData = this.formAddress.value;
                        // this.storage.set('user', this.formAddress.value);     
                        this.core.showLoading();   
                        if (this.login["token"]) {
                            let params = this.formAddress.value;
                            let url = this.wordpress_url + '/wp-json/wooconnector/user/update_profile';
                            let send_params = this.core.objectToURLParams(params);
                            let headers = new Headers();
                            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                            headers.set('Authorization', 'Bearer ' + this.login["token"]);
                            this.http.post(url, send_params, {
                                headers: headers
                            }).subscribe(res => {
                                this.storage.set('user', res.json());
                                console.log(res.json());
                                this.core.hideLoading();
                                this.available_ship_payment = false;
                                this.gotoCheckout();
                            }, err => {
                                console.log(err);
                                if (err.json().code == 'rest_user_invalid_email') {
                                    this.core.showToastBottom(this.trans['err_input']);
                                    this.email_exist = true;
                                } else if (err.json().code == 'jwt_auth_invalid_token') {
                                    this.core.removeToken();
                                };
                                this.core.hideLoading();
                            });
                        } else {
                            this.core.hideLoading();
                            this.storage.set('user', this.data).then(() => {
                                this.gotoCheckout();
                            });
                        }
                    } else this.gotoCheckout();
                } 
                else {
                    this.core.showToastBottom(this.trans['err_input']);
                }
            } else {
                this.core.showToastBottom(this.trans['err_input']);
            }
        } else {
            this.core.showToastBottom(this.trans['err_input']);
        }
    }

    gotoCheckout() {
        this.activePayment = true;
        if(!this.available_ship_payment) {
            this.loading_ship = true;
            this.loading_payment = true;
        }
        // this.core.showLoading();
        this.storageMul.get(['login', 'cart', 'coupon', 'user']).then(val => {
            if (val["login"]) this.login = val["login"];
            if (val['user']) this.user = val['user'];
            if (val["cart"]) {
                this.cart = val["cart"];
                this.products = [];
                let obj;
                for (obj in this.cart) {
                    if (this.cart.hasOwnProperty(obj)) {
                        let now = {};
                        now['product_id'] = this.cart[obj]['id'];
                        now['quantity'] = this.cart[obj]['quantity'];
                        if (this.cart[obj]['variation_id']) now['variation_id'] = this.cart[obj]['variation_id'];
                        this.products.push(now);
                    }
                }

                let params = {};
                params['products'] = JSON.stringify(this.products);
                if (val['coupon']) params['coupons'] = JSON.stringify(val['coupon']);
                if (this.user['shipping_country']) params['country'] = this.user['shipping_country'];
                if (this.user['shipping_postcode']) {
                    params['postcode'] = this.user['shipping_postcode'];
                }
                if (this.user['shipping_state']) {
                    params['states'] = this.user['shipping_state'];
                }
                params['woo_currency'] = this.config['currency']['code'];
                let option = {
                    search: this.core.objectToURLParams(params)
                };
                if (this.login && this.login['token']) {
                    let headers = new Headers();
                    headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    headers.set('Authorization', 'Bearer ' + this.login["token"]);
                    option['headers'] = headers;
                }
                this.http.get(this.wordpress_url + '/wp-json/wooconnector/calculator/getall', option)
                    .subscribe(res => {
                        this.data_checkout = res.json();
                        if (this.data_checkout['total']['tax']) {
                            this.data_checkout['_subtotal'] = Number(this.data_checkout['total']['subtotal']);
                            this.data_checkout['_tax'] = 0;
                            this.data_checkout['total']['tax'].forEach(item => {
                                this.data_checkout['_tax'] += Number(item['value']);
                            })
                            this.data_checkout['_total_no_ship'] = Number(this.data_checkout['total']['total']);
                        } else if (this.data_checkout['total']['total']) { // no discount
                            this.data_checkout['_tax'] = 0;
                            this.data_checkout['_subtotal'] = 0;
                            this.data_checkout['total']['total'].forEach(item => {
                                this.data_checkout['_tax'] += Number(item['tax']);
                                this.data_checkout['_subtotal'] += Number(item['subtotal']);
                            })
                            this.data_checkout['_total_no_ship'] = this.data_checkout['_tax'] + this.data_checkout['_subtotal'];
                        }
                        if (this.data_checkout['shipping'] && this.data_checkout['shipping'].length > 0) {
                            this.storage.get('shipping_method').then(
                                res => {
                                    let shipping_method_exist = false;
                                    this.data_checkout['shipping'].forEach(shipping => {
                                        shipping['cost'] = Number(shipping['price']) + Number(shipping['tax'][0]['value']);
                                        if (res && res['id'] == shipping['id']) {
                                            shipping_method_exist = true;
                                        }
                                    });

                                    if (res && shipping_method_exist) {
                                        this.changeShipping(res);
                                    } else {
                                        this.changeShipping(this.data_checkout['shipping'][0]);
                                    }
                                }, err => console.log(err)
                            );
                        }
                        // this.core.hideLoading();
                        if(!this.available_ship_payment) {
                            this.available_ship_payment = true;
                            this.loading_ship = false;
                            this.loading_payment = false;
                        }
                    },
                        err => {
                            // this.core.hideLoading();
                            if (err.json()["message"] == 'Expired token') {
                                this.translate.get('errorMessage.expiredToken').subscribe(trans => {
                                    this.core.showToastBottom(trans);
                                });
                            } else if(err.json()["code"] == "rest_postcode_error") {
                                this.core.showToastBottom(this.trans['incorrect_zip']);
                            } else this.core.showToastBottom(err.json()["message"]);
                        }
                    );
            }
        });
    }

    // tab shipping and pay
    changeShipping(shipping) {
        this.shipping = shipping['id'];
        this.data_checkout['_shipping'] = Number(shipping['cost']);
        this.data_checkout['title_shipping'] = shipping['title'];
        this.total_order = this.data_checkout['_total_no_ship'] + shipping['cost'];
        this.storage.set('shipping_method', shipping);
    }

    confirmShippingPay() {
        this.submitShipping = true;
        if (!this.payment) {
            this.payment_method_empty = true;
        } else {
            // this.core.showLoading();
            this.content.scrollToTop();;
            this.storage.set('payment_method', this.payment);
            this.payment_method_empty = false;

            this.params['products'] = JSON.stringify(this.products);
            Object.assign(this.params, this.core.filterProfile(this.user));
            this.params['billing_email'] = this.user['user_email'];
            if (this.shipping) this.params['shipping_method'] = this.shipping;
            this.params['payment_method'] = this.payment;
            if (this.coupon) {
                this.params['coupons'] = JSON.stringify(this.coupon);
            }
            this.data_checkout.payment.forEach(item => {
                if (item['id'] == this.payment) {
                    this.data_checkout['title_payment'] = item['title'];
                }
            });
            this.activePayment = false;
            this.activeConfirm = true;
            // this.core.hideLoading();
        }
    }

    editShipping() {
        this.activePayment = true;
        this.activeConfirm = false;
        this.content.scrollToTop();
    }
    editAddress() {
        this.activePayment = false;
        this.activeConfirm = false;
        this.content.scrollToTop();
    }
    showAddress() {
        if (this.checkAdd) {
            this.checkAdd = false;
        } else {
            this.checkAdd = true;
        }
    }
    showBilling() {
        if (this.checkBill) {
            this.checkBill = false;
        } else {
            this.checkBill = true;
        }
    }
    showProductList() {
        if (this.checklist) {
            this.checklist = false;
        } else {
            this.checklist = true;
        }
    }
    checkoutProcess() {
        this.submitAll = true;
        if (!this.check_privacy) {
            this.check_privacy_empty = true;
        } else {
            if (!this.login['token'] && this.config['required_login']) {
                this.core.showToastBottom(this.trans['login_required']);
            } else {
                this.core.showLoading();
                if (this.note) {
                    this.params['order_comments'] = this.note.replace(/\r?\n/g, '&#13;&#10;');
                } else {
                    this.params['order_comments'] = "";
                }
                if (this.useShipping) {
                    this.params['ship_to_different_address'] = 1;
                } else {
                    this.params['ship_to_different_address'] = 0;
                }
                this.params['onesignal_player_id'] = this.playerID;
                this.params['woo_currency'] = this.config['currency']['code']; 
                let send_params = this.core.objectToURLParams(this.params);
                let headers = new Headers();
                if (this.login && this.login['token']) {
                    headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    headers.set('Authorization', 'Bearer ' + this.login["token"]);
                }
                let url = this.wordpress_url + '/wp-json/wooconnector/checkout/processcheckout';
                this.http.post(url, send_params, { headers: headers })
                    .subscribe(res => {
                        if(res.json()['code'] && res.json()['code'] == "rest_order_stock_error") {
                            let msg = this.trans['stock_order_err1'] + res.json()['product_name'] + this.trans['stock_order_err2'];
                            let alert = this.alertCtrl.create({
                                message: msg,
                                cssClass: 'alert-no-title',
                                enableBackdropDismiss: false,
                                buttons: [
                                  {
                                    text: this.trans['button_ok'],
                                    handler: () => {}
                                  }
                                ]
                            });
                            alert.present();
                        } else {
                            this.checkout(res.json());
                        }
                    }, err => {
                        this.core.hideLoading();
                        console.log(err);
                        this.core.showToastBottom(err.json()['message']);
                    }
                    );
            }
        }

    }

    checkout(res) {
        let isLogin = false;
        if (this.login && this.login['token']) {
            isLogin = true;
        }
        let checkoutUrl = this.wordpress_url + '/wooconnector-checkout?data_key=' + res;

        if (this.device.platform) {
            let inapp_config = 'location=no,hardwareback=yes,hidespinner=true,closebuttoncaption=' + this.trans['close_inapp'];
            let openCheckout = this.InAppBrowser.create(checkoutUrl, '_blank', inapp_config);
            openCheckout.on('loadstart').subscribe(res => {
                this.core.hideLoading();
                console.log('loadstart');
                console.log(res.url);
                if (res.url.indexOf(this.wordpress_url) == -1) res.url.replace('http', 'https');
                if (res.url.indexOf(this.wordpress_url) != -1 && res.url.indexOf('order-received') != -1) {
                    // let order_id = res.url.split('order-received')[1].split('&')[0].replace(/[/=]/g, '');
                   let order_id = (res.url.split('?')[0]).split('order-received/')[1].replace("/", "");
                    this.navCtrl.push(ThankPage, {
                        id: order_id,
                        payment: this.payment,
                        isLogin: isLogin
                    }).then(() => {
                        openCheckout.close();
                        this.storageMul.remove(['cart', 'coupon']);
                    });;
                } else if (res.url.indexOf('cancel_order') != -1
                    && res.url.indexOf('paypal.com') == -1) {
                    console.log('Checkout close');
                    openCheckout.close();
                }
            });
        }
    }


    location() {
        if(this.device.platform) {
            this.locationAccuracy.canRequest().then((can: boolean) => {
                if (can || (this.device.platform.toLowerCase() == 'ios')) {
                    console.log('can get location');;
                    this.core.showLoading();
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                        console.log('into location accuracy')
                        this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(
                            data => {
                                console.log(data);
                                let coords = data['coords'];
                                let latlng = coords['latitude'] + ',' + coords['longitude'];
                                this.http.get('http://maps.google.com/maps/api/geocode/json?latlng=' + latlng).subscribe(
                                    res => {
                                        console.log(res);
                                        if (res.json()['status'] == 'OK' && res.json()['results']) {
                                            let address = res.json()['results'][0];
                                            let city;
                                            let country;
                                            address['address_components'].forEach(component => {
                                                if (component['types'].indexOf('administrative_area_level_1') != -1)
                                                    city = component['long_name'];
                                                if (component['types'].indexOf('country') != -1)
                                                    country = component['short_name'];
                                            });
                                            this.changeCountryBilling(country);
                                            this.changeCountryShipping(country);
                                            this.formAddress.patchValue({
                                                billing_address_1: address['formatted_address'],
                                                billing_city: city,
                                                billing_country: country,
                                            });
                                        }
                                        this.core.hideLoading();
                                    }, err => {
                                        console.log('Can not get address from Google Api', err);
                                        this.core.showToastBottom(this.trans['err_location']);
                                        this.core.hideLoading();
                                    }
                                );
                            })
                        // .catch((error) => {
                        //         console.log('Can not get Latitude and Longitude.', error);
                        //         this.core.showToastBottom(this.trans['err_location']);
                        //         this.core.hideLoading();
                        //     }
                        // );
                    }, err => {
                        console.log('Can not request locationAccuracy.', err);
                        this.core.showToastBottom(this.trans['err_location']);
                        this.core.hideLoading();
                    })
                } else {
                    console.log('Cant request');
                    this.diagnostic.requestLocationAuthorization('always').then(res => {
                        console.log(res);
                        if (res == "GRANTED" || res == "authorized_when_in_use"
                            || res == "authorized") {
                            this.location();
                        } 
                    });
                }
            })
        } 
    }

    chooseGetLocation() {
        let alert = this.alertCtrl.create({
            message: this.chooselocation['message'],
            cssClass: 'alert-no-title alert-blue-btn',
            buttons: [
                {
                    text: this.chooselocation['no'],
                    cssClass: 'dark',
                },
                {
                    text: this.chooselocation['yes'],
                    handler: () => {
                        this.location()
                    }
                }
            ]
        });
        alert.present();
    }

    totalItem(object: any): string {
        let obj;
        let total = 0;
        let result = "";
        this.translate.get('checkout').subscribe(trans => {
            if (trans) this.trans_items = trans;
        });
        for (obj in object) {
            if (object.hasOwnProperty(obj)) {
                total += object[obj]['quantity'];
            }
        }
        if (total == 1) {
            result = total.toString() + ' ' + this.trans_items['item'];
        } else {
            result = total.toString() + ' ' + this.trans_items['items'];
        }
        return result;
    }

    findCountryFormCode(code) {
        let country = this.core.findCountryFromCode(this.config['countries'], code);
        if (country) {
            return country.name;
        }
        return '';
    }

    openPopupTerms() {
        let alert = this.alertCtrl.create({
            title: this.trans['checkout_terms']['title'],
            message: this.config['text_static']['cellstore_description_term_ofuse'],
            cssClass: ' terms-popup',
            buttons: [
                {
                    text: this.trans['checkout_terms']['close'],
                    role: 'cancel'
                },
                {
                    text: this.trans['checkout_terms']['accept'],
                    handler: () => {
                        this.check_privacy = true;
                    }
                }
            ]
        });
        alert.present();
    }
}