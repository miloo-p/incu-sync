import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dbhl',
})
export class DbhlPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
