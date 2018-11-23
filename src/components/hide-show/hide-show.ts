import { Component, Input } from '@angular/core';

@Component({
	selector: 'hide-show',
	templateUrl: 'hide-show.html'
})
export class HideShowComponent {
	@Input() color:string;
	@Input() show:boolean = false;
	constructor() {}
	change(){
		this.show = !this.show;
	}
}