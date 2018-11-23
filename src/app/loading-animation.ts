import {
  trigger,
  style,
  state,
  animate,
  transition
} from '@angular/animations';

export const FADEIN = [
    trigger('fadeIn', [
  	transition(':enter', [
  	    style({ opacity: '0' }),
  	    animate('.8s ease-out', style({ opacity: '1' })),
  	  ]),
  	]),
];

export const FADEIN_LONGER = [
    trigger('fadeInLonger', [
    transition(':enter', [
        style({ opacity: '0' }),
        animate('1.3s ease-out', style({ opacity: '1' })),
      ]),
    ]),
];

export const FADEIN_CONTROL = [
    trigger('fadeInControl', [
        state('inactive', style({
          opacity: '0'
        })),
        state('active',   style({
          opacity: '1'
        })),
        transition('inactive => active', animate('2s ease-out')),
        transition('active => inactive', animate('2s ease-out'))
    ]),
];