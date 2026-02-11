import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string; // Icon for inactive state
  iconActive?: string; // Icon for active state (optional, falls back to icon if not provided)
  iconAlt?: string;
  disabled?: boolean;
}

@Component({
  selector: 'bk-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class BkTabs {
  @Input() list: TabItem[] = [];
  @Input() activeTabId: string = '';
  @Input() disabled: boolean = false;

  @Output() change = new EventEmitter<TabItem>();

  // Set active tab and emit change event
  setActiveTab(tab:TabItem): void {
    debugger
    if (tab?.disabled || this.disabled) return;
    this.activeTabId = tab.id;
    this.change.emit(tab);

  }

  // Check if a tab is active
  isActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  // Get the appropriate icon for a tab based on its active state
  getTabIcon(tab: TabItem): string | undefined {
    if (this.isActive(tab.id) && tab.iconActive) {
      return tab.iconActive;
    }
    return tab.icon;
  }
}
