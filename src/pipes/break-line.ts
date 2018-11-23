import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the BreakLinePipe pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'breakLine'
})
@Injectable()
export class BreakLinePipe {
  /*
    Convert html break line character to break line tag
   */
  transform(value, args) {
    value = value.replace(/\r?\n/g, '<br />');
    return value;
  }
}
