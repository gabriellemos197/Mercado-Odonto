import { Component } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Keyboard } from '@ionic-native/keyboard';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';
import { CoreValidator } from '../../validator/core';
import { Config } from '../../service/config.service';

// Page
import { SigninPage } from '../signin/signin';
import { CommentPage } from '../comment/comment';

@Component({
    selector: 'page-rating',
    templateUrl: 'rating.html',
    providers: [Core]
})
export class RatingPage {
    SigninPage = SigninPage;
    CommentPage = CommentPage;
    id: Number;
    ratingValue: Number = 0;
    emptyRating: boolean = false;
    login: Object = {}; user: Object = {};
    trans: Object;
    guest = true;
    formComment: FormGroup;
    submitAttempt = false;
    ready = false;
    wordpress_url = "";
    time =  new Date().getTime();

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public http: Http,
        public core: Core,
        public storage: Storage,
        public config: Config,
        public translate: TranslateService,
        public formBuilder: FormBuilder,
        public keyboard: Keyboard
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.formComment = formBuilder.group({
            namecustomer: ['', CoreValidator.required],
            emailcustomer: ['', Validators.compose([CoreValidator.required, CoreValidator.isEmail])],
            comment: ['', CoreValidator.required]
        });
        translate.get('rating').subscribe(trans => this.trans = trans);
        this.id = navParams.get("id");
        this.storage.get('login').then(login => {
            if (login) {
                this.guest = false;
                this.login = login;
                this.storage.get('user').then(user => {
                    this.user = user;
                    this.formComment.controls.namecustomer.setValue(this.user['display_name']);
                    this.formComment.controls.emailcustomer.setValue(this.user['user_email']);
                    this.ready = true;
                });
            } else {
                this.ready = true;
            }


        })
    }

    ionViewDidEnter() {
        this.keyboard.disableScroll(true);
    }

    ionViewDidLeave() {
        this.keyboard.disableScroll(false);
    }

    ngOnInit() {
        let html = document.querySelector('html');
        this.keyboard.onKeyboardShow().subscribe(() => {
            html.classList.add('rating');
        });

        this.keyboard.onKeyboardHide().subscribe(() => {
            html.classList.remove('rating');
        });
    }


    dismiss(reload: boolean = false) {
        this.viewCtrl.dismiss(reload);
    }

    changeRating(value) {
        this.ratingValue = value;
        this.emptyRating = false;
    }

    rating() {
        this.submitAttempt = true;
        if (this.ratingValue == 0) {
            this.emptyRating = true;
        }
        if (this.ratingValue != 0 && this.formComment.valid) {
            let cmt = this.formComment.value.comment.replace(/\r?\n/g, '&#13;&#10;');
            let params = this.formComment.value;
            params['comment'] = cmt;
            params['product'] = this.id;
            params['ratestar'] = this.ratingValue;
            params['time'] = this.time;
            let url = this.wordpress_url + '/wp-json/wooconnector/product/postreviews';
            let option: Object = {};
            if (this.login && this.login["token"]) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/json; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + this.login["token"]);
                option['headers'] = headers
            }
            this.core.showLoading();
            this.http.post(url, params, option)
                .subscribe(res => {
                    this.core.hideLoading();
                    let comment = res.json();
                    if (comment["result"] == "success" && comment['status'] == "unapproved") {
                        this.dismiss(false);
                        this.core.showToastBottom(this.trans['comment_process']);
                    } else if(comment["result"] == "success" && comment['status'] == "approved") {
                        this.dismiss(true);
                    } else if (comment["result"] == "success" && comment["status"] == "trash") {
                        this.dismiss(false);
                        this.core.showToastBottom(this.trans['comment_process']);
                    } else {
                        this.core.showToastBottom(res.json()["message"]);
                    }
                }, err => {
                    this.core.hideLoading();
                    if (err.json()['code'] == 'rest_comment_login_required') {
                        this.core.showToastBottom(this.trans["requiredLogin"]);
                    } else if (err.json()['message'] == "Expired token") {
                        this.core.showToastBottom(this.trans["expiredToken"]);
                    } else {
                        this.core.showToastBottom(err.json()['message']);
                    }
                });
        }

    }

}
