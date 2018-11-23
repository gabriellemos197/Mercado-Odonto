import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { Core } from '../../service/core.service';
import { Http } from '@angular/http';
import { TranslateService } from 'ng2-translate';
import { Config } from '../../service/config.service';

import { RatingPage } from '../rating/rating';
import { SigninPage } from '../signin/signin';
import { DetailPage } from '../detail/detail';

import { FADEIN } from '../../app/loading-animation';

@Component({
    selector: 'page-comment',
    templateUrl: 'comment.html',
    providers: [Core],
    animations: FADEIN,
})

export class CommentPage {
    RatingPage = RatingPage;
    SigninPage = SigninPage;
    DetailPage = DetailPage;
    wordpress_url = '';
    comments: Object[] = [];
    id: number;
    login: Object;
    user: Object;
    trans: any;
    loaded_data = false;
    post_num_page = 1;
    reviews_allowed = true;
    total_comment = 0;
    page_allow_scroll = true;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public core: Core,
        public http: Http,
        public modalCtrl: ModalController,
        public translate: TranslateService,
        public config: Config
    ) {
        this.wordpress_url = config['wordpress_url'];
        translate.get('detail.comment_process').subscribe(trans => this.trans = trans);
        this.id = navParams.get('id');
        this.reviews_allowed = navParams.get('reviews_allowed');
        this.getFirstComment();
    }

    getFirstComment() {
        this.getComment(false).subscribe(data => {
            if (data && data.length > 0) {
                this.comments = data;
                this.total_comment = this.comments[0]['total_comments'];
            } 
            this.loaded_data = true;
        })
    }

    getComment(no_cache): Observable<Object[]> {
        return new Observable(observable => {
            let params = { 
                post_num_page: this.post_num_page, 
                post_per_page: 10,
                product_id: this.id
            };
            if(no_cache) {
                let date = new Date();
                let date_gmt0 = new Date(date.toString()).toUTCString();
                params['time'] = date_gmt0;
            }
            this.http.get(this.wordpress_url + '/wp-json/wooconnector/product/getnewcomment', {
                search: this.core.objectToURLParams(params)
            }).subscribe(res => {
                observable.next(res.json());
                observable.complete();
            }, err => {
                console.log(err);
                observable.next(null);
                observable.complete();
            }
            );
        })
    }

    showRating() {
        this.page_allow_scroll = false;
        let modal = this.modalCtrl.create(RatingPage, { id: this.id }, { cssClass: 'custom-modal modal-rating' });
        modal.onDidDismiss(reload => {
            if (reload) {
                this.core.showLoading();
                this.post_num_page = 1;
                this.getComment(true).subscribe(data => {
                    if (data && data.length > 0) {
                        this.comments = data;
                        this.total_comment = this.comments[0]['total_comments'];
                    } 
                    this.core.hideLoading()
                });
            }
            this.page_allow_scroll = true;
        });
        modal.present();
    }

    doRefresh(refresher) {
        this.core.showLoading();
        this.post_num_page = 1;
        this.getComment(true).subscribe(data => {
            if (data && data.length > 0) {
                this.comments = data;
                this.total_comment = this.comments[0]['total_comments'];
            } 
            this.core.hideLoading()
        });
        setTimeout(() => { refresher.complete(); }, 200);
    }

    loadMore(infiniteScroll) {
        this.post_num_page++;
        this.getComment(true).subscribe(data => {
            if (data && data.length > 0) {
                this.comments = this.comments.concat(data);
            } 
            infiniteScroll.complete();
        });
    }
}
