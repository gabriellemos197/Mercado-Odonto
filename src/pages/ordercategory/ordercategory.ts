import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

// Custom
import { Storage } from '@ionic/storage';
import { TranslateService } from 'ng2-translate';

@Component({
    selector: 'page-ordercategory',
    templateUrl: 'ordercategory.html'
})
export class OrdercategoryPage {
    id: Number;
    parents: Object[] = [];
    defaultCategories: Object;
    catName: string;
    trans: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public storage: Storage,
        public translate: TranslateService
    ) {
        translate.get('home.all').subscribe(trans => {
            if (trans) this.trans = trans;
        });
        this.parents = navParams.get('categoriesList');
        this.storage.get('idCategoriesDefault').then(value => {
            if (value) {
                this.defaultCategories = value;
            } else {
                this.defaultCategories = 0;
            }
        });
    }
    getData() {
        this.storage.set('idCategoriesDefault', this.defaultCategories).then(() => {
            if (this.defaultCategories == 0) {
                this.storage.set('cateName', this.trans).then(() => {
                    this.viewCtrl.dismiss({ id: this.defaultCategories, name: this.catName });
                });
            } else {
                this.parents.forEach(cate => {
                    if (cate['id'] == this.defaultCategories) {
                        this.catName = cate['name'];
                        this.storage.set('cateName', cate['name']).then(() => {
                            this.viewCtrl.dismiss({ id: this.defaultCategories, name: this.catName });
                        });
                    }
                });
            }
        });

    }
    dismiss(reload: boolean = false) {
        this.viewCtrl.dismiss(reload);
    }
}
