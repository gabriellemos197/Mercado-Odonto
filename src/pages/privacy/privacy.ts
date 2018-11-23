import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Config } from '../../service/config.service';

import { FADEIN_LONGER } from '../../app/loading-animation';

@Component({
    selector: 'page-privacy',
    templateUrl: 'privacy.html',
    animations: FADEIN_LONGER,
})
export class PrivacyPage {
    public privacy;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public config: Config) {
        this.privacy = config['text_static'];
    }


}
