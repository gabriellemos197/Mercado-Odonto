import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DetailcategoryPage } from '../detailcategory/detailcategory';
import { TranslateService } from 'ng2-translate';
/*
  Generated class for the Sortpopup page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-sortpopup',
    templateUrl: 'sortpopup.html'
})
export class SortpopupPage {
    hidden: boolean = false;
    DetailcategoryPage = DetailcategoryPage;
    sort: string;
    sortList = [];
    filter: Object = { grid: true, open: null, value: {} };
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public translate: TranslateService
    ) {
        this.translate.get('categories.sortData').subscribe(trans => { this.initialSortList(trans) });
        this.sort = navParams.get('sort');
    }

    initialSortList(trans) {
        for (var key in trans) {
            if (!trans.hasOwnProperty(key)) continue;
            let sort = {
                "title": trans[key],
                "value": key
            }
            this.sortList.push(sort);
        }
    }

    close() {
        if (this.sort) {
            this.viewCtrl.dismiss(this.sort);
        } else {
            this.viewCtrl.dismiss(false);
        }
    }

    click() {
        console.log(this.sort);
        this.viewCtrl.dismiss(this.sort);
    }
}
