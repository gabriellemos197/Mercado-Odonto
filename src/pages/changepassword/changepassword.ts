import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from 'ng2-translate';
import { Storage } from '@ionic/storage';

// Custom
import { Core } from '../../service/core.service';
import { CoreValidator } from '../../validator/core';
import { Config } from '../../service/config.service';

@Component({
    selector: 'page-changepassword',
    templateUrl: 'changepassword.html',
    providers: [Core]
})
export class ChangepasswordPage {
    wordpress_url = '';
    login: Object = {};
    formChange: FormGroup;
    password_wrong = false;
    submitAttempt = false;
    type: string = 'password'; check: boolean = false;
    constructor(
        public navCtrl: NavController,
        public storage: Storage,
        public http: Http,
        public core: Core,
        public formBuilder: FormBuilder,
        public translate: TranslateService,
        public config: Config
    ) {
        this.formChange = formBuilder.group({
            current_password: ['', CoreValidator.required],
            password: ['', Validators.compose([CoreValidator.required, Validators.minLength(6)])],
            re_password: ['', Validators.compose([CoreValidator.required, CoreValidator.confirmPassword])]
        });
        this.wordpress_url = config['wordpress_url'];
        
    }

    ionViewDidEnter() {
        this.storage.get('login').then(val => {
            if (val) {
                this.login = val;
            }
        });
    }

    save() {
        this.submitAttempt = true;
        if (!this.formChange.invalid) {
            this.core.showLoading();
            let params_login = {
                username: this.login['username'],
                password: this.formChange.value['current_password']
            };

            this.http.post(this.wordpress_url + '/wp-json/mobiconnector/jwt/token', params_login)
                .subscribe(
                    res => {
                        let tmp = {
                            user_pass: this.formChange.value['password'],
                            re_password: this.formChange.value['re_password']
                        };
                        let params = this.core.objectToURLParams(tmp);
                        let url_update = this.wordpress_url + '/wp-json/mobiconnector/user/update_profile';
                        let headers = new Headers();
                        headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                        headers.set('Authorization', 'Bearer ' + this.login["token"]);
                        this.http.post(url_update, params, {
                            headers: headers,
                            withCredentials: true
                        }).subscribe(res => {
                            this.core.hideLoading();
                            this.storage.set('user', res.json());
                            this.translate.get('profile.update_successfully').subscribe(trans => {
                                this.core.showToastBottom(trans);
                            });
                            this.navCtrl.pop();
                        }), err => {
                            this.core.hideLoading();
                            this.core.showToastBottom(err.json()["message"]);
                        }
                    }
                    , err => {
                        this.core.hideLoading();
                        if (err.json()['code'].indexOf("incorrect_password") != -1) {
                            this.password_wrong = true;
                        }
                    }
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

    autoFocus(target) {
        this.core.autoFocus(target);
    }

    changeNewPassword() {
        this.formChange.patchValue({
            re_password: ''
        });
        this.formChange.controls.re_password.setErrors({ invalidEqual: false, required: false });
    }
}
