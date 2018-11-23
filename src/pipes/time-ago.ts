import { Injectable, Pipe } from '@angular/core';
import { TranslateService } from 'ng2-translate';
// import { DatePipe } from '@angular/common';

// declare var date_format:string;
@Pipe({
    name: 'timeAgo',
    pure: false
})
@Injectable()
export class TimeAgo {
	trans:Object;
	
	constructor(translate:TranslateService){
		translate.get('general.timeUnits').subscribe(trans => this.trans = trans);
    }
    
	transform(value) {
		value = value + "Z";
		let _value:any;
		let ago = (new Date().getTime() - new Date(value).getTime())/1000;
        if (ago >= 2592000) {
            _value = Math.floor(ago/2592000);
			if(_value < 2) _value += this.trans['month'] + this.trans['ago'];
			else _value += this.trans['months'] + this.trans['ago'];
        } else if(ago >= 86400){
            _value = Math.floor(ago/86400);
			if(_value < 2) _value += this.trans['day'] + this.trans['ago'];
			else _value += this.trans['days'] + this.trans['ago'];
		} else if (ago >= 3600) {
            _value = Math.floor(ago/3600);
			if(_value < 2) _value += this.trans['hour'] + this.trans['ago'];
			else _value += this.trans['hours'] + this.trans['ago'];
        } else {
            _value = Math.floor(ago/60);
			if(_value < 2) _value += this.trans['minute'] + this.trans['ago'];
            else _value += this.trans['minutes'] + this.trans['ago'];
        }

		return _value;
	}
}
