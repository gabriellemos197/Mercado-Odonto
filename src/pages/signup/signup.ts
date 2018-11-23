import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';

//custom
import { TranslateService } from 'ng2-translate';
import { SigninPage } from '../signin/signin';
import { CoreValidator } from '../../validator/core';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html',
    providers: [Core]
})
export class SignupPage {
    SigninPage = SigninPage;
    formSignup: FormGroup;
    trans: Object;
    type: string = 'password'; check: boolean = false;
    submitAttempt = false;
    username_used = false;
    email_used = false;
    wordpress_url = "";

    constructor(
        public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public http: Http,
        public core: Core,
        public config: Config,
        public translate: TranslateService
    ) {
        this.wordpress_url = config['wordpress_url'];
        translate.get('signup').subscribe(trans => this.trans = trans);
        this.formSignup = formBuilder.group({
            first_name: ['', CoreValidator.required],
            last_name: ['', CoreValidator.required],
            username: ['', CoreValidator.required],
            email: ['', Validators.compose([CoreValidator.required, CoreValidator.isEmail])],
            password: ['', Validators.compose([CoreValidator.required, Validators.minLength(6)])],
            repass: ['', Validators.compose([CoreValidator.required, CoreValidator.confirmPassword])]
        });
    }

    save() {
        this.submitAttempt = true;
        if (this.formSignup.valid) {
            this.core.showLoading();
            let params = this.formSignup.value;
            params["display_name"] = params["first_name"] + ' ' + params["last_name"];
            let send_params = this.core.objectToURLParams(params);
            this.http.post(this.wordpress_url + '/wp-json/mobiconnector/user/register', send_params)
                .subscribe(res => {
                    this.core.hideLoading();
                    this.navCtrl.push(this.SigninPage, { parent: 'signup' });
                    this.core.showToastBottom(this.trans["success"]);
                }, err => {
                    this.core.hideLoading();
                    if (err.json()['code'] == "username_exists") {
                        this.username_used = true;
                    } else if (err.json()['code'] == "email_exists") {
                        this.email_used = true;
                    }
                }
                );
        } else {
            this.core.showToastBottom(this.trans['err_input'])
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
        this.formSignup.patchValue({
            repass: ''
        });
        this.formSignup.controls.repass.setErrors({ invalidEqual: false, required: false });
    }
}
