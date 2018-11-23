import { Injectable, Pipe } from '@angular/core';

@Pipe({
	name: 'dimensions'
})
@Injectable()
export class Dimensions{

    /**
     * format product dimensions
     * @param dimensions Object
     * @return string
     */
	transform(value):string {
        let result = (value.length + " x " + value.width + " x " +  value.height).trim();
        if(result.substring(0,1)=="x") {
            result = result.substring(1);
        }
        if(result.slice(-1)=="x") {
            result = result.substring(0, result.length - 1);
        }
        return result;
	}
}