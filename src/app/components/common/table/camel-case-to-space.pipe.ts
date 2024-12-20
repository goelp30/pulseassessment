import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone:true,
  name: 'camelCaseToSpace',
})
export class CamelCaseToSpacePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
