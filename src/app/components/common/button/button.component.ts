import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [NgClass, CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.css'
})
export class ButtonComponent {
    @Input() label: string = 'Button';
    @Input() colorClass: string = "btn py-2 text-white";
    @Input() disabled: boolean = false; // Add this line
    @Output() action = new EventEmitter<void>();

    onClick(): void {
        if(!this.disabled){
            this.action.emit();
        }
    }
}