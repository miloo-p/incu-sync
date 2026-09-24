import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gain',
})
export class GainPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
