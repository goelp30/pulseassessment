import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as monaco from 'monaco-editor';

@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="editor-container" #editorContainer></div>',
  styles: [
    `
      .editor-container {
        height: 400px;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
      }
    `,
  ],
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy {
  @Input() options: any = {};
  @Input() code: string = '';
  @Output() codeChange = new EventEmitter<string>();

  private editor: any;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.initMonaco();
  }

  private initMonaco() {
    const container =
      this.elementRef.nativeElement.querySelector('.editor-container');

    this.editor = monaco.editor.create(container, {
      value: this.code,
      language: this.options.language || 'javascript',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      ...this.options,
    });

    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.codeChange.emit(value);
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  updateOptions(options: any) {
    if (this.editor) {
      this.editor.updateOptions(options);
    }
  }
}
