import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  forwardRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BkButton } from '../../../ui-button/ui-button';
import { BkCheckbox } from '../../../checkbox/checkbox';
import { BkInput } from '../../../input/input';
import { ColumnFilterOption } from '../../models/column-filter-option';
import { BkColumnFilterService } from '../../service/column-filter.service';

@Component({
  selector: 'bk-column-select',
  imports: [FormsModule, BkButton, BkCheckbox, BkInput],
  standalone: true,
  templateUrl: './column-select.html',
  styleUrl: './column-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkColumnSelect),
      multi: true,
    },
  ],
})
export class BkColumnSelect implements ControlValueAccessor, OnChanges {
  @Input() searchable = false;
  @Input() cacheKey!: string;
  @Input() columns: string[] = [];
  @Input() isOpened = false;
  @Output() isOpenedChange = new EventEmitter<boolean>();
  @ViewChild('formBox') formBoxRef!: ElementRef;

  /** Value bound via ngModel – only updated when user ticks/unticks a checkbox, never on search. */
  columnsFilterList: ColumnFilterOption[] = [];
  search = '';

  private onChangeCallback: (value: ColumnFilterOption[]) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  constructor(public columnFilterService: BkColumnFilterService) {}

  writeValue(value: ColumnFilterOption[] | null | undefined): void {
    const isEmpty = !value || !Array.isArray(value) || value.length === 0;
    if (isEmpty && this.shouldLoadFromService()) {
      this.loadColumnsFilterListFromService();
    } else {
      this.columnsFilterList = Array.isArray(value) ? value : [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const columnsChanged = changes['columns'] && !changes['columns'].firstChange;
    const cacheKeyChanged = changes['cacheKey'] && !changes['cacheKey'].firstChange;
    if ((columnsChanged || cacheKeyChanged) && this.columnsFilterList.length === 0 && this.shouldLoadFromService()) {
      this.loadColumnsFilterListFromService();
    }
  }

  private shouldLoadFromService(): boolean {
    return !!this.cacheKey && !!this.columns?.length;
  }

  private loadColumnsFilterListFromService(): void {
    this.columnsFilterList = this.columnFilterService.getColumnsFilterList(
      this.cacheKey,
      this.columns
    );
    this.onChangeCallback(this.columnsFilterList);
  }

  registerOnChange(fn: (value: ColumnFilterOption[]) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Optional: disable button/dropdown when control is disabled
  }

  filterButtonClicked(event: Event): void {
    event.stopPropagation();
    const willOpen = !this.isOpened;
    if (!willOpen) {
      this.clearSearch();
      this.onTouchedCallback();
    }
    this.isOpenedChange.emit(willOpen);
  }

  /** Called only on checkbox tick/untick – not on search. Emits via CVA so ngModel updates. */
  onChangeColumnFilter(): void {
    this.columnFilterService.updateColumnFilterList(this.cacheKey, this.columnsFilterList);
    this.onChangeCallback(this.columnsFilterList);
    this.onTouchedCallback();
  }

  private clearSearch(): void {
    this.search = '';
  }

  private closeDropdown(): void {
    this.clearSearch();
    this.onTouchedCallback();
    this.isOpened = false;
    this.isOpenedChange.emit(this.isOpened);
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.isOpened) {
      return;
    }
    const formBox = this.formBoxRef?.nativeElement;
    if (formBox && formBox.contains(event.target as Node)) {
      return;
    }
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains('ng-value-icon')
    ) {
      return;
    }
    if (
      event.target instanceof HTMLElement &&
      event.target.closest('.btn-light-primary-custom')
    ) {
      return;
    }
    this.closeDropdown();
  }

  get list():ColumnFilterOption[] {
    return this.columnsFilterList.filter((x)=> x.columnName.toLowerCase().includes(this.search.toLowerCase()));
  }


}
