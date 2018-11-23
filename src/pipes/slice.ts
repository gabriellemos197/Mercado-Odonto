// import { Injectable } from '@angular/core';
import {Pipe, PipeTransform} from '@angular/core';
@Pipe({name: 'slice', pure: false})
export class SlicePipe implements PipeTransform {
  transform(value: any, start: number, end?: number): any {
    if (value == null) return value;

    return value.slice(start, end);
  }

//   private supports(obj: any): boolean { return typeof obj === 'string' || Array.isArray(obj); }
}