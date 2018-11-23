import { Injectable, Pipe } from '@angular/core';

@Pipe({
	name: 'isNew'
})
@Injectable()

/**
 * is new if time smaller <= 1 day
 */
export class IsNew {
	transform(value) {
        let time = (new Date().getTime() - new Date(value).getTime())/1000;
        if ((time/86400) <= 1)  {
            return true;
        } else {
            return false;
        }
	}
}
