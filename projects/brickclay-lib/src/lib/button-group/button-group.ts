import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GroupItem {
  label: string;
  value: any;
}

export type GroupMode = 'single' | 'multiple';

@Component({
  selector: 'bk-button-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-group.html',
  styleUrl: './button-group.css',
})
export class BkButtonGroup {
  // --- Inputs ---
  @Input() items: GroupItem[] = [];
  @Input() mode: GroupMode = 'single';
  @Input() disabled: boolean = false;

  // Holds the current selection.
  // For 'single', it's a single value. For 'multiple', it's an array.
  @Input() value: any | any[] = null;

  // --- Outputs ---
  @Output() valueChange = new EventEmitter<any>();

  // --- Logic ---

  onItemClick(itemValue: any) {
    if (this.disabled) return;

    if (this.mode === 'single') {
      // 1. Single Mode: Just set the value
      if (this.value !== itemValue) {
        this.value = itemValue;
        this.valueChange.emit(this.value);
      }
    } else {
      // 2. Multiple Mode: Toggle value in array
      let currentValues = Array.isArray(this.value) ? [...this.value] : [];

      if (currentValues.includes(itemValue)) {
        // Remove if exists
        currentValues = currentValues.filter(v => v !== itemValue);
      } else {
        // Add if not exists
        currentValues.push(itemValue);
      }

      this.value = currentValues;
      this.valueChange.emit(this.value);
    }
  }

  // Helper to check active state for UI
  isActive(itemValue: any): boolean {
    if (this.mode === 'single') {
      return this.value === itemValue;
    } else {
      return Array.isArray(this.value) && this.value.includes(itemValue);
    }
  }

  // --- Styles ---

  get containerClass(): string {
    return `group-container ${this.disabled ? 'disabled' : ''}`;
  }
}
