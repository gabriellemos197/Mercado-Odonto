import { Component } from '@angular/core';
import { ContactusPage } from '../contactus/contactus';
import { Config } from '../../service/config.service';
import { NavController, NavParams } from 'ionic-angular';

import { FADEIN_LONGER } from '../../app/loading-animation';

@Component({
    selector: 'page-aboutus',
    templateUrl: 'aboutus.html',
    animations: FADEIN_LONGER,
})
export class AboutusPage {
    ContactusPage = ContactusPage;
    textStatic: Object = {};
    constructor(public navCtrl: NavController, public navParams: NavParams,
        public config: Config) {
        this.textStatic = config['text_static'];
    }
}