import { Injectable, Pipe } from '@angular/core';
import { TranslateService } from 'ng2-translate';

@Pipe({
    name: 'timeRemain',
    pure: false
})
@Injectable()
export class TimeRemain {
	trans:Object;
	
	constructor(translate:TranslateService){
		translate.get('general.timeUnits').subscribe(trans => this.trans = trans);
	}
	transform(value) {
		let _value:any;
        let ago = value;
        if (ago >= 2592000) {
            _value = Math.floor(ago/2592000);
			if(_value < 2) _value += this.trans['month'];
			else _value += this.trans['months'];
        } else if(ago >= 86400){
            _value = Math.floor(ago/86400);
			if(_value < 2) _value += this.trans['day'];
			else _value += this.trans['days'];
		} else if (ago >= 3600) {
            _value = Math.floor(ago/3600);
			if(_value < 2) _value += this.trans['hour'];
			else _value += this.trans['hours'];
        } else {
            _value = Math.floor(ago/60);
			if(_value < 2) _value += this.trans['minute'];
            else _value += this.trans['minutes'];
        }

		return _value;
	}
}
