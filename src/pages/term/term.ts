import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Config } from '../../service/config.service';

import { FADEIN_LONGER } from '../../app/loading-animation';

@Component({
    selector: 'page-term',
    templateUrl: 'term.html',
    animations: FADEIN_LONGER,
})
export class TermPage {
    public static_text;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public config: Config) {
        this.static_text = config['text_static'];
    }
}
