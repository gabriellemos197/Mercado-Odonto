import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Config } from '../../service/config.service';
import { TranslateService } from 'ng2-translate';
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';

/*
  Generated class for the LanguagePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-language',
    templateUrl: 'language.html'
})
export class LanguagePage {
    lang: string;
    list: Object[] = [];
    trans: Object = {};
    HomePage = HomePage;
    lang_index = 0;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public viewCtrl: ViewController,
        public config: Config,
        public storage: Storage,
        public translate: TranslateService,
        public core: Core) {
        this.lang = navParams.get('active');
        this.list = navParams.get('list');
    }

    confirm() {
        if (this.config['lang']['language'] != this.lang) {
            this.config['lang'] = this.list[this.lang_index];
            this.storage.set('lang', this.config['lang']);
            this.translate.use(this.config['lang']['language']);
            this.viewCtrl.dismiss(true);
        } else {
            this.dismiss();
        }

    }

    dismiss() {
        this.viewCtrl.dismiss(false);
    }
}
