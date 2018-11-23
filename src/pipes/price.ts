import { Injectable, Pipe } from '@angular/core';
import { Config } from '../service/config.service';

@Pipe({
    name: 'price',
    pure: false
})
@Injectable()
export class Price {
	currency:Object;
	
	constructor(public config: Config){
        this.currency = config['currency'];
    }
    
	transform(value:Number):string {
		let _value:any = Number(value);
		if(!_value) _value = 0;
		if(this.currency){
			_value = Number(value).toFixed(this.currency['number_of_decimals']);
			_value = _value.split('.');
			_value.splice(1, 0, this.currency['decimal_separator']);
            _value[0] = _value[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.currency['thousand_separator']);
            
			let symbol = document.createElement('textarea');
			symbol.innerHTML = this.currency['symbol'];
			switch (this.currency['position']){
				case 'left':
                    _value.unshift(symbol.value);
					break;
				case 'left_space':
					_value.unshift(symbol.value+' ');
					break;
				case 'right':
					_value.push(symbol.value);
					break;
				case 'right_space':
					_value.push(' '+symbol.value);
					break;
            }
			_value = _value.join('');
        }
		return _value;
	}
}