import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textCase',
  standalone: true,
})
export class TextCasePipe implements PipeTransform {
  transform(
    value: string | undefined,
    caseType: 'titlecase' | 'sentenceCase'
  ): string {
    if (!value) return '';

    if (caseType === 'titlecase') {
      return value
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else if (caseType === 'sentenceCase') {
      const sentence = value.trim(); 
      if (!sentence) return ''; 
      return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    }
    return value; // If no case type return the same string.
  }
}
