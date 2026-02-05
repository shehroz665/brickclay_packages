import {
  Component,
  input,
  output,
  signal,
  model,
  forwardRef,
  ElementRef,
  HostListener,
  inject,
  computed,
  effect,
  ViewChild,
  ViewChildren,
  QueryList, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'bk-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.html',
  styleUrls: ['./select.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkSelect),
      multi: true
    }
  ]
})
export class BkSelect implements ControlValueAccessor {
  // --- Inputs ---
  items = input<any[]>([]);
  bindLabel = input<string>('label');
  bindValue = input<string>('');
  placeholder = input<string>('');
  notFoundText = input<string>('No items found');
  loadingText = input<string>('Loading...');
  clearAllText = input<string>('Clear all');
  // iconSrc = input<string>('Clear all');
  @Input() iconAlt: string = 'icon';
  @Input() label: string = 'Label';
  @Input() required: Boolean = false;


  @Input() iconSrc?: string; // optional icon

  // Config
  multiple = input<boolean>(false);
  maxLabels = input<number>(2);
  searchable = input<boolean>(true);
  clearable = input<boolean>(true);
  readonly = input<boolean>(false);
  disabled = model<boolean>(false);
  loading = input<boolean>(false);
  closeOnSelect = input<boolean>(true);
  dropdownPosition = input<'bottom' | 'top'>('bottom');


  // 1. NEW INPUT: Toggle append-to-body behavior
  appendToBody = input<boolean>(false);

  // --- Outputs ---
  open = output<void>();
  close = output<void>();
  focus = output<void>();
  blur = output<void>();
  search = output<{ term: string, items: any[] }>();
  clear = output<void>();
  change = output<any>();
  scrollToEnd = output<void>();

  // --- Refs ---
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('optionsListContainer') optionsListContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('optionsRef') optionsRef!: QueryList<ElementRef>;
  @ViewChild('controlWrapper') controlWrapper!: ElementRef<HTMLDivElement>;

  // --- State ---
  private _value: any = null;

  isOpen = signal(false);
  selectedOptions = signal<any[]>([]);
  searchTerm = signal<string>('');
  markedIndex = signal(-1);

  dropdownStyle = signal<{
    top?: string;
    bottom?: string;
    left: string;
    width: string;
  }>({
    left: '0px',
    width: 'auto'
  });


  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const list = this.items();
    if (!term || !this.searchable()) return list;
    return list.filter(item => {
      const label = this.resolveLabel(item).toLowerCase();
      return label.includes(term);
    });
  });

  isAllSelected = computed(() => {
    const filtered = this.filteredItems();
    const current = this.selectedOptions();
    if (!filtered.length) return false;
    return filtered.every(item => this.isItemSelected(item));
  });

  constructor() {
    effect(() => {
      const currentItems = this.items();
      if (currentItems.length > 0 && this._value !== null) {
        this.resolveSelectedOptions(this._value);
      }
    });
  }

  // --- Helpers ---
  resolveLabel(item: any): string {
    if (!item) return '';
    const labelProp = this.bindLabel();
    return labelProp && typeof item === 'object' ? item[labelProp] : String(item);
  }

  resolveValue(item: any): any {
    const valueProp = this.bindValue();
    return valueProp && typeof item === 'object' ? item[valueProp] : item;
  }

  isItemSelected(item: any): boolean {
    const current = this.selectedOptions();
    const compareFn = this.compareWith();
    const itemVal = this.resolveValue(item);
    return current.some(selected => compareFn(itemVal, this.resolveValue(selected)));
  }

  compareWith = input<(a: any, b: any) => boolean>((a, b) => a === b);

  // --- Actions ---

  toggleDropdown(event: Event | null) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (this.disabled() || this.readonly()) return;
    this.isOpen() ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    if (this.isOpen()) return;

    // Only calculate position if we are appending to body
    if (this.appendToBody()) {
      this.updatePosition();
    }

    this.isOpen.set(true);
    // this.markedIndex.set(0);
    this.open.emit();
    this.focus.emit();
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  closeDropdown() {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.onTouched();
    this.close.emit();
    this.blur.emit();
  }

  getTop(): string | null {
    if (this.appendToBody()) {
      return this.dropdownStyle().top ?? null;
    }

    // NOT appendToBody
    return this.dropdownPosition() === 'bottom' ? '105%' : null;
  }

  getBottom(): string | null {
    if (this.appendToBody()) {
      return this.dropdownStyle().bottom ?? null;
    }

    // NOT appendToBody
    return this.dropdownPosition() === 'top' ? '105%' : null;
  }


  updatePosition() {
    const rect = this.controlWrapper.nativeElement.getBoundingClientRect();

    if (this.dropdownPosition() === 'bottom') {
      this.dropdownStyle.set({
        top: `${rect.bottom + 4}px`,
        bottom: undefined,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      });
    } else {
      this.dropdownStyle.set({
        top: undefined,
        bottom: `${window.innerHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      });
    }
  }



  // 2. FIXED: Removed ['$event'] argument
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowEvents() {
    // Only close on scroll if we are in "fixed" mode (append to body)
    if (this.isOpen() && this.appendToBody()) {
      this.closeDropdown();
    }
  }

  // ... (toggleSelectAll, handleSelection, removeOption, handleClear logic same as before) ...

  toggleSelectAll(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    const allSelected = this.isAllSelected();
    const filtered = this.filteredItems();
    let newSelection = [...this.selectedOptions()];
    const compareFn = this.compareWith();
    if (allSelected) {
      newSelection = newSelection.filter(sel => {
        const selVal = this.resolveValue(sel);
        return !filtered.some(fItem => compareFn(this.resolveValue(fItem), selVal));
      });
    } else {
      filtered.forEach(item => {
        if (!this.isItemSelected(item)) newSelection.push(item);
      });
    }
    this.updateModel(newSelection);
  }

  handleSelection(item: any, event?: Event) {
    if (event) event.stopPropagation();
    if (this.multiple()) {
      const isSelected = this.isItemSelected(item);
      let newSelection = [...this.selectedOptions()];
      const compareFn = this.compareWith();
      if (isSelected) {
        const itemVal = this.resolveValue(item);
        newSelection = newSelection.filter(sel => !compareFn(this.resolveValue(sel), itemVal));
      } else {
        newSelection.push(item);
      }
      this.updateModel(newSelection);
      if (this.closeOnSelect()) this.closeDropdown();
    } else {
      this.updateModel([item]);
      if (this.closeOnSelect()) this.closeDropdown();
    }
  }

  removeOption(item: any, event: Event) {
    event.stopPropagation();
    const newSelection = this.selectedOptions().filter(i => i !== item);
    this.updateModel(newSelection);
  }

  handleClear(event: Event) {
    event.stopPropagation();
    this.updateModel([]);
    this.clear.emit();
  }

  private updateModel(items: any[]) {
    this.selectedOptions.set(items);
    if (this.multiple()) {
      const values = items.map(i => this.resolveValue(i));
      this._value = values;
      this.onChange(values);
      this.change.emit(values);
    } else {
      const item = items[0] || null;
      const value = item ? this.resolveValue(item) : null;
      this._value = value;
      this.onChange(value);
      this.change.emit(value);
    }
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
    this.markedIndex.set(0);
    this.search.emit({ term: val, items: this.filteredItems() });
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen()) return;
    const list = this.filteredItems();
    const current = this.markedIndex();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (current < list.length - 1) {
          this.markedIndex.set(current + 1);
          this.scrollToMarked();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (current > 0) {
          this.markedIndex.set(current - 1);
          this.scrollToMarked();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (current >= 0 && list[current]) this.handleSelection(list[current]);
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      this.scrollToEnd.emit();
    }
  }

  scrollToMarked() {
    setTimeout(() => {
      const container = this.optionsListContainer?.nativeElement;
      const options = this.optionsRef?.toArray();
      const index = this.markedIndex();
      if (container && options && options[index]) {
        const el = options[index].nativeElement;
        if (el.offsetTop < container.scrollTop) {
          container.scrollTop = el.offsetTop;
        } else if ((el.offsetTop + el.clientHeight) > (container.scrollTop + container.clientHeight)) {
          container.scrollTop = (el.offsetTop + el.clientHeight) - container.clientHeight;
        }
      }
    });
  }

  onChange: any = () => {};
  onTouched: any = () => {};
  writeValue(value: any): void { this._value = value; this.resolveSelectedOptions(value); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.disabled.set(d); }

  private resolveSelectedOptions(val: any) {
    const list = this.items();
    if (!list.length) return;
    if (val === null || val === undefined) {
      this.selectedOptions.set([]);
      return;
    }
    const valArray = Array.isArray(val) ? val : [val];
    const bindVal = this.bindValue();
    const compare = this.compareWith();
    const matchedItems = list.filter(item => {
      const itemVal = bindVal ? item[bindVal] : item;
      return valArray.some(v => compare(v, itemVal));
    });
    this.selectedOptions.set(matchedItems);
  }

  private el = inject(ElementRef);
  @HostListener('document:click', ['$event'])
  onClickOutside(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) this.closeDropdown();
  }

  openFromLabel(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled() || this.readonly()) return;

    this.controlWrapper.nativeElement.focus();
    this.openDropdown();
  }

}
