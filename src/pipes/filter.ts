import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'filter'
})
@Injectable()
export class Filter {
	transform(items:any[], args:Object): any {
		if(args){
			for(var key in args){
				if(args.hasOwnProperty(key)){
					items = items.filter(item => item[key] == args[key]);
				}
			}
		}
		return items;
	}	
}
