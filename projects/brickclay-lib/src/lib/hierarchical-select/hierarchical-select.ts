import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

/** Generic hierarchical node; works with note types and any similar tree. */
export interface HierarchicalNode {
  [key: string]: any;
  childs?: HierarchicalNode[];
  children?: HierarchicalNode[];
}

@Component({
  selector: 'bk-hierarchical-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hierarchical-select.html',
  styleUrls: ['./hierarchical-select.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkHierarchicalSelect),
      multi: true,
    },
  ],
})
export class BkHierarchicalSelect implements ControlValueAccessor {
  /** Tree data (root-level array). */
  items = input<HierarchicalNode[]>([]);
  /** Key for display label (e.g. 'noteType'). */
  labelKey = input<string>('noteType');
  /** Key for value (e.g. 'noteTypeKey'). */
  valueKey = input<string>('noteTypeKey');
  /** Key for children array (e.g. 'childs' or 'children'). */
  childrenKey = input<string>('childs');
  /** Placeholder when nothing selected. */
  placeholder = input<string>('Select...');
  /** Label above the control. */
  label = input<string>('');
  /** Required indicator. */
  required = input<boolean>(false);
  /** Optional icon URL in the trigger. */
  iconSrc = input<string | undefined>(undefined);
  iconAlt = input<string>('icon');
  /** Disabled state (can also be set by form control via CVA). */
  disabled = input<boolean>(false);
  private disabledByForm = signal<boolean>(false);
  isDisabled = computed(() => this.disabled() || this.disabledByForm());
  /** Whether to allow selecting parent nodes that have children. Default: only leaf selection. */
  allowParentSelection = input<boolean>(false);
  /** Text for "Back" link (e.g. "< Back to Main"). */
  backToMainText = input<string>('Back to Main');
  /** Search placeholder. */
  searchPlaceholder = input<string>('Search');
  searchable = input<boolean>(false);
  /** When true, dropdown is positioned fixed and sized to the trigger (use inside modals/popups). */
  appendToBody = input<boolean>(false);
  /** Open above or below the trigger (also used when appendToBody is true for fixed coordinates). */
  dropdownPosition = input<'bottom' | 'top'>('bottom');
  /** Key for option color (e.g. "color"). When set, option label and selected value use this color. */
  colorKey = input<string>('');
  /** Whether to show clear button when a value is selected. */
  clearable = input<boolean>(true);
  /** Optional anchor key to scope dropdown to one subtree (e.g. module/category key). */
  restrictKey = input<any>(null);
  hasError = input<boolean>(false);

  /** Emit full selected node. */
  selectionChange = output<HierarchicalNode | null>();
  /** Emit value only (e.g. noteTypeKey). */
  valueChange = output<any>();
  /** Emit when clear button is clicked. */
  clear = output<any>();


  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('controlWrapper') controlWrapper!: ElementRef<HTMLDivElement>;

  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      const list = this.items();
      const value = this.valueSignal();

      if (value == null) {
        this.selected.set(null);
        return;
      }

      const node = this.findNodeByValue(list ?? [], value);
      this.selected.set(node ?? null);
    });
  }

  isOpen = signal(false);
  dropdownStyle = signal<{ top?: string; bottom?: string; left: string; width: string }>({
    left: '0px',
    width: 'auto',
  });
  searchTerm = signal('');
  /** Breadcrumb stack: each entry is the parent node we navigated into. */
  breadcrumb = signal<HierarchicalNode[]>([]);
  /** Currently selected node (leaf or parent if allowParentSelection). */
  selected = signal<HierarchicalNode | null>(null);

  /** Current level items: root or children of last breadcrumb. */
  currentLevelItems = computed(() => {
    const list = this.items();
    const stack = this.breadcrumb();
    if (!list?.length) return [];

    const restrictKey = this.restrictKey();
    if (restrictKey != null) {
      const anchorNode = this.findNodeByValue(list, restrictKey);
      if (!anchorNode) {
        return [];
      }

      // Start from anchor children only, so siblings outside this branch are hidden.
      let anchoredLevel: HierarchicalNode[] = this.getChildren(anchorNode) ?? [];
      for (const parent of stack) {
        const children = this.getChildren(parent);
        anchoredLevel = children ?? [];
      }
      return anchoredLevel;
    }

    let level: HierarchicalNode[] = list;
    for (const parent of stack) {
      const children = this.getChildren(parent);
      level = children ?? [];
    }
    return level;
  });

  /** Filtered by search (matches label in current level and descendants). */
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const level = this.currentLevelItems();
    if (!term) return level;
    return level.filter((item) =>
      this.getLabel(item).toLowerCase().includes(term)
    );
  });

  /** Display text in trigger: path "Parent > Child" or placeholder. */
  displayPath = computed(() => {
    const sel = this.selected();
    if (!sel) return [];

    const path = this.buildPathTo(sel);
    return path.length ? path : [sel];
  });


  /** Whether we're not at root (show Back). */
  showBack = computed(() => this.breadcrumb().length > 0);

  getLabel(node: HierarchicalNode): string {
    const key = this.labelKey();
    return (node && key && node[key]) ?? '';
  }

  /** Returns the color for the node (e.g. node.color) when colorKey is set. */
  resolveColor(node: HierarchicalNode | null): string | null {
    if (!node) return null;
    const key = this.colorKey();
    return key && typeof node === 'object' ? (node[key] as string) ?? null : null;
  }

  getValue(node: HierarchicalNode): any {
    const key = this.valueKey();
    return key && node ? node[key] : node;
  }

  getChildren(node: HierarchicalNode): HierarchicalNode[] | undefined {
    const key = this.childrenKey();
    const raw = node?.[key];
    if (Array.isArray(raw) && raw.length > 0) return raw;
    const alt = node?.['children'];
    return Array.isArray(alt) && alt.length > 0 ? alt : undefined;
  }

  hasChildren(node: HierarchicalNode): boolean {
    const ch = this.getChildren(node);
    return !!ch?.length;
  }

  isSelected(node: HierarchicalNode): boolean {
    const sel = this.selected();
    if (!sel) return false;
    return this.getValue(sel) === this.getValue(node);
  }

  /** Build path from root to target (finds first occurrence). */
  private buildPathTo(target: HierarchicalNode): HierarchicalNode[] {
    const targetVal = this.getValue(target);
    const path: HierarchicalNode[] = [];
    const search = (list: HierarchicalNode[], parentPath: HierarchicalNode[]): boolean => {
      for (const node of list) {
        const currentPath = [...parentPath, node];
        if (this.getValue(node) === targetVal) {
          path.push(...currentPath);
          return true;
        }
        const children = this.getChildren(node);
        if (children?.length && search(children, currentPath)) return true;
      }
      return false;
    };
    search(this.items(), []);
    return path;
  }

  toggleDropdown(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.isDisabled()) return;
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.restrictKey() != null) {
      const restrictKey = this.restrictKey();
      const sel = this.selected();

      if (sel) {
        const selectedPath = this.buildPathTo(sel);
        const anchorIndex = selectedPath.findIndex(
          (node) => this.getValue(node) === restrictKey
        );

        if (anchorIndex >= 0) {
          const relativePath = selectedPath.slice(anchorIndex + 1);
          const selectedHasChildren = this.hasChildren(sel);

          // If selected has children, open at selected node so user can navigate deeper.
          // If selected is leaf, open at parent level so siblings are still visible/selectable.
          if (selectedHasChildren) {
            this.breadcrumb.set(relativePath);
          } else {
            this.breadcrumb.set(relativePath.slice(0, -1));
          }
        } else {
          this.breadcrumb.set([]);
        }
      } else {
        this.breadcrumb.set([]);
      }

      if (this.appendToBody()) {
        this.updatePosition();
      }
      this.isOpen.set(true);
      this.searchTerm.set('');
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
      return;
    }

    const sel = this.selected();
    if (sel) {
      const path = this.buildPathTo(sel);
      this.breadcrumb.set(path.slice(0, -1));
    } else {
      this.breadcrumb.set([]);
    }
    if (this.appendToBody()) {
      this.updatePosition();
    }
    this.isOpen.set(true);
    this.searchTerm.set('');
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  updatePosition(): void {
    const el = this.controlWrapper?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    if (this.dropdownPosition() === 'bottom') {
      this.dropdownStyle.set({
        top: `${rect.bottom + 4}px`,
        bottom: undefined,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    } else {
      this.dropdownStyle.set({
        top: undefined,
        bottom: `${window.innerHeight - rect.top + 4}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }
  }

  /** Fixed positioning when appendToBody; inset placement uses CSS + .hierarchical-select-field. */
  getTop(): string | null {
    if (!this.appendToBody()) return null;
    return this.dropdownStyle().top ?? null;
  }

  getBottom(): string | null {
    if (!this.appendToBody()) return null;
    return this.dropdownStyle().bottom ?? null;
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScrollOrResize(): void {
    if (this.isOpen() && this.appendToBody()) this.closeDropdown();
  }

  closeDropdown(): void {
    const wasOpen = this.isOpen();
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.breadcrumb.set([]);
    if (wasOpen) {
      this.onTouched();
    }
  }

  goBack(): void {
    const stack = this.breadcrumb();
    if (stack.length === 0) return;
    this.breadcrumb.set(stack.slice(0, -1));
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  selectItem(node: HierarchicalNode, event?: Event): void {
    event?.stopPropagation();
    const hasChildren = this.hasChildren(node);
    if (hasChildren && !this.allowParentSelection()) {
      this.breadcrumb.update((stack) => [...stack, node]);
      return;
    }
    this.selected.set(node);
    const value = this.getValue(node);
    this._value = value;
    this.valueSignal.set(value);
    this.onChange(this.getValue(node));
    this.selectionChange.emit(node);
    this.valueChange.emit(value);
    this.closeDropdown();
  }

  openFromLabel(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDisabled()) return;
    this.controlWrapper?.nativeElement?.focus();
    this.openDropdown();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(e: Event): void {
    if (!this.el.nativeElement.contains(e.target)) this.closeDropdown();
  }

  // --- ControlValueAccessor ---
  private _value: any = null;
  private valueSignal = signal<any>(null);
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this._value = value;
    this.valueSignal.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  private findNodeByValue(list: HierarchicalNode[], value: any): HierarchicalNode | null {
    for (const node of list) {
      if (this.getValue(node) === value) return node;
      const children = this.getChildren(node);
      if (children?.length) {
        const found = this.findNodeByValue(children, value);
        if (found) return found;
      }
    }
    return null;
  }

  handleClear(event: Event): void {
    event.stopPropagation();
    this.selected.set(null);
    this._value = null;
    this.valueSignal.set(null);
    this.onChange(null);
    this.selectionChange.emit(null);
    this.valueChange.emit(null);
    this.clear.emit(null);
  }
}
