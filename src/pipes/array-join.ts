import { Injectable, Pipe } from '@angular/core';

@Pipe({
	name: 'ArrayJoin'
})
@Injectable()
export class ArrayJoin {
	transform(value:any[], args:string = ', ') {
		if(value) return value.join(args);
	}
}