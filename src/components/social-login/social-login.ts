import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TranslateService } from 'ng2-translate';
import { Core } from '../../service/core.service';

/**
 * Generated class for the SocialLoginComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'social-login',
    templateUrl: 'social-login.html'
})
export class SocialLoginComponent {
    listSocial = [];
    loadedSocial = false;
    trans = {};
    wordpress_url = "http://dev.taydotech.com/doanhung/wordpress-2/wordpress";
    activeSocialLink = "";

    constructor(
        public http: Http,
        public iab: InAppBrowser,
        public translate: TranslateService,
        public core: Core
    ) {
        console.log('Hello SocialLoginComponent Component');
        this.translate.get('social_login').subscribe(trans => this.trans = trans);
       
        this.getSocialList();
    }

    getSocialList() {
        let url = this.wordpress_url + "/wp-json/mobiconnector/settings/getsocialloginlink";
        this.http.get(url).subscribe(res => {
            if(res.json()) {
                this.listSocial = res.json();
                this.listSocial.map(item => {
                    return item['name'] = this.trans[item.code];
                });
            }
            console.log( this.listSocial);
            this.loadedSocial = true;
        })
    }

    resetActiveSocial() {
        let url = this.activeSocialLink + "?reset=1";
        let social_control = this.iab.create(url, '_blank', 'location=yes');
        social_control.on('loadstart').subscribe(
            res => {
                console.log(res.url);
                if(res.url.indexOf("social-complete") != -1) {
                    social_control.close();
                    console.log("Reset social done");
                }
            }
        )
        social_control.on('loaderror').subscribe(res => {
            social_control.close();
            console.log(res);
        });
    }


    filterSocialId(link:string) {
        let data = link.split('mobiconnector-social-complete.php?')[1].split('&');
        let user_id = data[0].split('=')[1];
        let social_id = "";
        if(link.indexOf('linkedin') != -1) {
            social_id = data[1].split('=')[1].replace(/[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');
        } else {
            social_id = data[1].split('=')[1].replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,'');
        }
        let params = {
            user_id: user_id,
            social_id: social_id
        }
        console.log(params);
        return params;
    }

    socialLogin(type: String) {
        let socialLink = '';
        this.listSocial.forEach(function (element) {
            if (element.code == type) {
                socialLink = element.sociallink;
            }
        });
        this.activeSocialLink = socialLink;
        let openCheckout = this.iab.create(socialLink, '_blank', 'location=yes');
        openCheckout.on('loadstart').subscribe(res => {
            console.log(res);
            if (res.url.indexOf('mobiconnector-social-complete.php?user_id=') != -1) {
                openCheckout.close();
                let params = this.filterSocialId(res.url);
                this.http.get(this.wordpress_url+"/wp-json/mobiconnector/settings/getsocialuserinfo", {
                    search: this.core.objectToURLParams(params)
                }).subscribe(
                    res => {
                        console.log(res);
                        console.log(res.json());
                    }, err => console.log(err)
                );
            }
        })
        openCheckout.on('loaderror').subscribe(res => {
            openCheckout.close();
            console.log(res);
        });
    }


}
