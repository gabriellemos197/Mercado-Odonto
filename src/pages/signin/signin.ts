import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, Platform } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';
import { Toast } from '@ionic-native/toast';
//Page
import { SignupPage } from '../signup/signup';
import { ForgotPage } from '../forgot/forgot';
import { HomePage } from '../home/home';
import { AccountPage } from '../account/account';
import { CoreValidator } from '../../validator/core';
declare var google_web_api_key;
@Component({
    selector: 'page-signin',
    templateUrl: 'signin.html',
    providers: [Core]
})
export class SigninPage {
    wordpress_user: string = '';
    wordpress_url = "";
    SignupPage = SignupPage;
    ForgotPage = ForgotPage;
    HomePage = HomePage;
    AccountPage = AccountPage;
    formLogin: FormGroup;
    submitAttempt = false;
    wrong_pass_username = false;
    wrong: boolean;
    trans: Object = {};
    checkreturn: string;
    type: string = 'password'; check: boolean = false;
    allowRegister: boolean = false;
    listSocial = [];
    loadedSocial = false;
    maintain = false;
    login_google:boolean;
    login_facebook:boolean;
    socialMode:boolean = false;
    playerId: string;
    loading: boolean = false;

    constructor(
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public http: Http,
        public core: Core,
        public storage: Storage,
        public alertCtrl: AlertController,
        public translate: TranslateService,
        public navParams: NavParams,
        public platform: Platform,
        public config: Config,
        private googleplus: GooglePlus,
        private fb: Facebook,
        public Toast: Toast,
    ) {
        translate.get('login').subscribe(trans => this.trans = trans);
        this.wordpress_url = config['base_url'];
        this.login_facebook = config['app_settings']['socials_login']['facebook'];
        this.login_google = config['app_settings']['socials_login']['google'];
        console.log(config['app_settings']['socials_login']);
        storage.get('userID').then(val => {  
            console.log(this.playerId);
            if (val) {
                this.playerId = val;
                http.post(this.wordpress_url+'/wp-json/mobiconnector/settings/updateplayerid', {'player_id': this.playerId})
                .subscribe(res => {
                    console.log('Update Successful!');
                }, err => {
                    this.Toast.showShortBottom(this.trans["login_fail"]).subscribe(
                        toast => {},
                        error => {console.log(error);}
                    );
                });
            }
            
        });
        this.formLogin = formBuilder.group({
            username: ['', CoreValidator.required],
            password: ['', CoreValidator.required]
        });
        this.wordpress_user = this.wordpress_url + '/wp-json/mobiconnector/user';
        this.checkreturn = navParams.get('check');
        this.allowRegister = config['register'];
        this.maintain = config['app_settings']['maintain'];
    }
    login(method: string) {
        if (method == 'normal') {
            this.loginNormal();
        } else if (method == 'facebook') {
            this.loginFacebook();
        } else if (method == 'google') {
            this.loginGP();
        }
    }
    loginNormal() {
        this.submitAttempt = true;
        if (!this.formLogin.invalid) {
            this.core.showLoading();
            let params = this.formLogin.value;
            let send_params = this.core.objectToURLParams(params);
            let headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            this.http.post(this.wordpress_url + '/wp-json/mobiconnector/jwt/token', send_params, {
                headers: headers
            }).subscribe(
                res => {
                    let login = res.json();
                    login.username = this.formLogin.value.username;
                    let params = this.core.objectToURLParams({ 'username': login["username"] });
                    this.http.post(this.wordpress_user + '/get_info', params)
                        .subscribe(data => {
                                let user = data.json();
                                login['mobiconnector_avatar'] = data.json()['mobiconnector_avatar'];
                                this.core.hideLoading();
                                this.storage.set('login', login);
                                this.storage.set('user', user);
                                if(this.maintain && user['wp_capabilities']['administrator']) {
                                    this.config['app_settings']['maintain'] = false;
                                    this.maintain = false;
                                    this.navCtrl.setRoot(HomePage);
                                    this.core.showToastBottom(this.trans["success"]);
                                } else if (this.maintain && !user['wp_capabilities']['administrator']) {
                                    this.core.showToastBottom(this.trans['not_admin']);  
                                } else if (!this.maintain && this.navParams.get('parent') == 'signup') {
                                    this.navCtrl.remove(1, this.navCtrl.length() - 2);
                                    this.navCtrl.push(AccountPage);
                                    this.core.showToastBottom(this.trans["success"]);
                                } else if (!this.maintain) {
                                    this.navCtrl.pop();
                                    this.core.showToastBottom(this.trans["success"]);
                                }
                                
                            })
                }, err => {
                    this.core.hideLoading();
                    if (err.json()['code'].indexOf("incorrect_password") != -1
                        || err.json()['code'].indexOf("invalid_username") != -1) {
                        this.wrong_pass_username = true;
                    } else {
                        this.core.showToastBottom(err.json()['message']);
                    }
                }
            );
        }
    }

    loginFacebook() {
        this.socialMode = true;
        console.log( this.socialMode);
        this.loading = true;
        this.fb.login(['public_profile','email'])
        .then((res: FacebookLoginResponse) => {
            console.log(res);
            this.fb.api('me?fields=id,name,email,first_name,last_name,picture', []).then(profile => {
                let params = {
                    user_email: profile['email'],
                    user_social_id: profile['id'],
                    social: 'facebook',
                    first_name: profile['first_name'],
                    last_name: profile['last_name'],
                    display_name: profile['name'],
                    user_picture: profile['picture']['data']['url'],
                    player_id: this.playerId
                }
                console.log(profile);
                this.socialLogin(params);
            }, err => {
                this.socialMode = false;
                this.loading = false;
                this.Toast.showShortBottom(this.trans["login_fail"]).subscribe(
                    toast => {},
                    error => {console.log(error);}
                );
            });
        }, err => {
            this.socialMode = false;
            this.loading = false;
            this.Toast.showShortBottom(this.trans["login_fail"]).subscribe(
                toast => {},
                error => {console.log(error);}
            );
        });
    }

    loginGP(){
        this.socialMode = true;
        this.loading = true;
        this.googleplus.login({
            'webClientId': google_web_api_key,
            'offline': true
        }).then(profile => {
            console.log(profile);
        let params = {
                user_email: profile['email'],
                user_social_id: profile['userId'],
                social: 'google',
                first_name: profile['familyName'],
                last_name: profile['givenName'],
                display_name: profile['displayName'],
                user_picture: profile['imageUrl'],
                player_id: this.playerId
            }
        console.log(profile);
        this.socialLogin(params);
        }).catch(err => {
            this.socialMode = false;
            this.loading = false;
            this.Toast.showShortBottom(this.trans["login_fail"]).subscribe(
                toast => {},
                error => {console.log(error);}
            );
        });
    }

    socialLogin(params:any){
        this.http.post(this.wordpress_url+'/wp-json/mobiconnector/settings/usersociallogin', params)
        .subscribe(
        res => {
            this.loading = false;
            this.storage.set('user', res.json()).then(() => {
                this.storage.set('login', {token: res.json()['token'], socialStatus: params['social']}).then(() => {
                    if (this.navParams.get('parent') == 'signup') {
                        this.navCtrl.remove(1, this.navCtrl.length() - 2);
                        this.navCtrl.push(AccountPage);
                        this.core.showToastBottom(this.trans["success"]);
                    } else {
                        this.navCtrl.pop();
                        this.core.showToastBottom(this.trans["success"]);
                    }
                });
            });
            console.log(res.json());
        }),
        err => {
            this.loading = false;
            this.socialMode = false;
            this.Toast.showShortBottom(this.trans["login_fail"]).subscribe(
                toast => {},
                error => {console.log(error);}
            );
        }
    }
    show_hide_Pass() {
        if (this.check) {
            this.check = false;
            this.type = 'password';
        } else {
            this.check = true;
            this.type = 'text';
        }
    }

    exitApp() {
        this.platform.exitApp();
    }
}
