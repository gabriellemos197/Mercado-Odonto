import { Injectable, Pipe } from '@angular/core';
import { Config } from '../service/config.service';

@Pipe({
  name: 'static',
})
@Injectable()
export class Static {
	textStatic:Object = {};
	constructor(public config: Config){
		if(this.textStatic["text_static"]) this.textStatic = config['text_static'];
	}
  transform(value) {
    if(this.textStatic[value]) return this.textStatic[value];
    else return null;
  }
}
