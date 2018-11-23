import { Component, forwardRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

const noop = () => {};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ButtonQuantityComponent),
    multi: true
};

@Component({
	selector: 'button-quantity',
	templateUrl: 'button-quantity.html',
	providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ButtonQuantityComponent implements ControlValueAccessor {
	@ViewChild('input') input;
	@Input() min:Number;
    @Input() max:Number;
	@Output() update: EventEmitter<number> = new EventEmitter<number>();
    private innerValue: Number = 1;
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;
	
	ngOnInit() {
		if(this.min || this.min == 0) this.min = Number(this.min)
		else this.min = 1;
		if(this.max && this.max > 0) this.max = Number(this.max)
        else this.max = 2147483647;
	}
    get value(): Number {
        return Number(this.innerValue);
    };
    set value(v: Number) {
		if(v == null) return;
		if(v < this.min) v = this.min;
		if(v > this.max) v = this.max;
        if (Number.isInteger(Number(v)) && v !== this.innerValue) {
            this.innerValue = Number(v);
            this.onChangeCallback(Number(v));
			this.inputBlur();
        } else if(v) this.inputBlur();
    }
    onBlur() {
        this.onTouchedCallback();
    }
    writeValue(value: Number) {
        if (value !== this.innerValue) {
            this.innerValue = Number(value);
        }
    }
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }
	minus(){
		if(this.innerValue>this.min) this.value = Number(this.innerValue)-1;
		this.update.emit(Number(this.value));
	}
	plus(){
		if(this.innerValue<this.max) this.value = Number(this.innerValue)+1;
		this.update.emit(Number(this.value));
	}
	inputBlur(update:boolean = false){
		this.input['nativeElement'].value = Number(this.value);
		if(update) this.update.emit(Number(this.value));
	}
}