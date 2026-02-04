import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonSize = 'xxsm' | 'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type ButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'bk-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.html',
  styleUrl: './ui-button.css',
})
export class UiButton {
  // --- Inputs ---

  // 1. Style & Size Inputs
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';

  // 2. Content Inputs
  @Input() label: string = ''; // Pass text directly
  @Input() leftIcon?: string;
  @Input() rightIcon?: string;
  @Input() iconAlt: string = 'icon';

  // 3. State & Config
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;

  // 4. Customization (Optional overrides)
  @Input() buttonClass: string = ''; // Append extra classes if needed
  @Input() textClass: string = '';
  @Input() spinnerClass: string = '';

  // --- Outputs ---
  @Output() clicked = new EventEmitter<boolean>();

  // --- Logic ---
  onClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(true);
    }
  }

  // Generate the class string based on Inputs
  get buttonClasses(): string {
    const variantClass = this.variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    // Combine: Variant + Size + Custom Classes
    // Note: The size name (e.g., 'sm') matches your CSS class name exactly
    return `btn ${variantClass} ${this.size} ${this.buttonClass}`;
  }
}
