import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';
import { CoreValidator } from '../../validator/core';
import { Config } from '../../service/config.service';

@Component({
    selector: 'page-forgot',
    templateUrl: 'forgot.html',
    providers: [Core]
})
export class ForgotPage {
    formForgot: FormGroup;
    trans: Object = {};
    submitAttempt = false;
    username_not_exist = false;
    keyboard_show = false;
    wordpress_url = "";

    constructor(
        public formBuilder: FormBuilder,
        public http: Http,
        public core: Core,
        public navCtrl: NavController,
        public translate: TranslateService,
        public navParams: NavParams,
        public config: Config,
        public screenOrientation: ScreenOrientation
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.formForgot = formBuilder.group({
            username: ['', CoreValidator.required]
        });
        translate.get('login').subscribe(trans => { if (trans) this.trans = trans; });
    }

    backPage() {
        this.navCtrl.pop();
    }

    forgot() {
        this.submitAttempt = true;
        if (!this.formForgot.invalid) {
            this.core.showLoading();
            let params = this.formForgot.value;
            let send_params = this.core.objectToURLParams(params);
            this.http.post(this.wordpress_url + '/wp-json/mobiconnector/user/forgot_password', send_params
            ).subscribe(res => {
                this.core.hideLoading();
                this.navCtrl.pop();
                this.core.showToastBottom(this.trans["forgot_success"]);
            }, err => {
                console.log(err);
                this.core.hideLoading();
                if (err.json()['code'] == "user_not_exists") {
                    this.username_not_exist = true;
                }
            });
        }
    }

}
