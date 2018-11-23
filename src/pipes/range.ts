import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'range'
})
@Injectable()
export class Range {
	transform(items:any[], args:Number[]): any {
		if(args && args.length == 2){
			//items = items.filter(item => item[key] == args[key]);
		}
		return items;
	}	
}
