import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sentenceCase',
  standalone:true,
})
export class SentenceCasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Convert to sentence case: first letter uppercase, the rest lowercase
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
