import { Component, Input, Output, EventEmitter, ContentChild, AfterContentInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-module',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './popup-module.component.html',
  styleUrls: ['./popup-module.component.css']
})
export class PopupModuleComponent implements AfterContentInit {
  @Input() isVisible: boolean = false;  // Control the modal visibility
  @Input() modalTitle: string = '';     // Dynamic title for the modal

  // Input properties for custom CSS classes (or fallback to defaults)
  @Input() containerClass: string = 'bg-white rounded-lg shadow-lg w-11/12 max-w-lg md:max-w-xl p-6 relative';
  @Input() headerClass: string = 'flex justify-between items-center';
  @Input() bodyClass: string = 'mt-4';
  @Input() footerClass: string = 'mt-6 flex justify-end';

  @Output() closeModalEvent = new EventEmitter<void>();  // Close modal event
  @ContentChild('modalTitle', { static: false }) modalTitleTemplate: TemplateRef<any> | null = null;  // Content projection reference

  selectedLink: string = '';
  projectedTitle = false;

  ngAfterContentInit() {
    // Check if modalTitle content is projected
    if (this.modalTitleTemplate) {
      this.projectedTitle = true;
    }
  }

  closeModal(): void {
    this.closeModalEvent.emit();  // Emit event to close modal
  }

  // Check if modalTitle content was projected
  hasProjectedModalTitle(): boolean {
    return this.projectedTitle;
  }
}
