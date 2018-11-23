import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageMulti } from '../../service/storage-multi.service';

// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { CoreValidator } from '../../validator/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';

//page
import { ChangepasswordPage } from '../changepassword/changepassword';

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html',
    providers: [Core]
})
export class ProfilePage {
    ChangepasswordPage = ChangepasswordPage;
    wordpress_url = "";
    login: Object;
    data: Object;
    formEdit: FormGroup;
    avatar: string;
    submitAttempt = false;

    constructor(
        public navCtrl: NavController,
        public storage: Storage,
        public http: Http,
        public core: Core,
        public formBuilder: FormBuilder,
        public translate: TranslateService,
        public camera: Camera,
        public config: Config,
        public storageMulti: StorageMulti,
        public DomSanitizer: DomSanitizer
    ) {
        this.wordpress_url = config['wordpress_url'];
        storageMulti.get(['login', 'user']).then(val => {
            if(val) {
                this.login = val['login'];
                this.data = val['user'];
                console.log(this.data)
                this.formEdit = formBuilder.group({
                    first_name: ['', CoreValidator.required],
                    last_name: ['', CoreValidator.required],
                    user_email: ['', Validators.compose([CoreValidator.required, CoreValidator.isEmail])]
                });
                this.reset();
            } 
        })
    }

    reset() {
        this.formEdit.patchValue({
            "first_name": this.data["first_name"],
            "last_name": this.data["last_name"],
            "user_email": this.data["user_email"]
        });
        this.avatar = this.data["mobiconnector_avatar"];
    }

    editAvatar() {
        const options: CameraOptions = {
            quality: 100,
            sourceType: 0,
            allowEdit: true,
            targetWidth: 180,
            targetHeight: 180,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }

        this.camera.getPicture(options).then((imageData) => {
            this.avatar = 'data:image/jpeg;base64,' + imageData;
        }, (err) => {
            // Handle error
        });
    }

    save() {
        this.submitAttempt = true;
        if (!this.formEdit.invalid) {
            this.core.showLoading();
            let params = this.formEdit.value;
            params["display_name"] = params["first_name"] + " " + params["last_name"];
            if (this.avatar != this.data["mobiconnector_avatar"]) params["user_profile_picture"] = this.avatar;
            let url = this.wordpress_url + '/wp-json/mobiconnector/user/update_profile';
            let send_params = this.core.objectToURLParams(params);
            let headers = new Headers();
            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            this.http.post(url, send_params, {
                headers: headers
            }).subscribe(
                res => {
                    this.core.hideLoading();
                    console.log(res.json());
                    this.storage.set('user', res.json());
                    this.translate.get('profile.update_successfully').subscribe(trans => {
                        this.core.showToastBottom(trans);
                    });
                }, err => {
                    this.core.hideLoading();
                    if (err.json()['code'] == 'rest_user_invalid_email') {
                        this.translate.get('errorMessage.emailUsed').subscribe(trans => {
                            this.core.showToastBottom(trans);
                        });
                    } else {
                        this.core.showToastBottom(err.json()['message']);
                    }
                }
            )
        }
    }
}
