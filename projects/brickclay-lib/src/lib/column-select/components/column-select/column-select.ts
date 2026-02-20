import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BkButton } from '../../../ui-button/ui-button';
import { BkCheckbox } from '../../../checkbox/checkbox';
import { BkInput } from '../../../input/input';
import { ColumnFilterOption } from '../../models/column-filter-option';
import { BkColumnFilterService } from '../../service/column-filter.service';




@Component({
  selector: 'bk-column-select',
  imports: [FormsModule, BkButton, BkCheckbox,BkInput],
  standalone:true,
  templateUrl: './column-select.html',
  styleUrl: './column-select.css',
})
export class BkColumnSelect implements OnInit,OnChanges {
  @Input() searchable:boolean =false;
  @Input() cacheKey!:string;
  @Input() columns!:string[];
  @Input() isOpened: boolean= false;
  @ViewChild('formBox') formBoxRef!: ElementRef;
  @Output() change = new EventEmitter<ColumnFilterOption[]>();
  @Output() isOpenedChange = new EventEmitter<boolean>();
  columnsFilterList: ColumnFilterOption[] = [];
  search:string='';
  constructor(
      public columnFilterService: BkColumnFilterService,
  ) { }

  ngOnInit(): void {
    this.getColumnsFilterList();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] && !changes['columns'].firstChange) {
      this.getColumnsFilterList();
    }
  }
  getColumnsFilterList() {
    this.columnsFilterList = this.columnFilterService.getColumnsFilterList(
      this.cacheKey,
      this.columns
    );
    this.change.emit(this.columnsFilterList);
  }
  filterButtonClicked(event: Event) {
      event.stopPropagation();
      this.isOpenedChange.emit(!this.isOpened);
  }
  onChangeColumnFilter(evt:boolean){
    this.columnFilterService.updateColumnFilterList(this.cacheKey,this.columnsFilterList);
    this.change.emit(this.columnsFilterList);
  }

 @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    // Check if the click target is inside the form_box
    if (
      (this.isOpened) &&
      this.formBoxRef.nativeElement.contains(event.target as Node)
    ) {
      return; // Do nothing if click occurred inside the form_box
    }

    // Check if the click target is .ng-value-icon
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains('ng-value-icon')
    ) {
      // Do nothing if click is on .ng-value-icon
      return;
    }

    // Check if the click target is the button
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.closest('.btn-light-primary-custom')
    ) {
      // Close the popup if the click is not on the button
      this.isOpened = false;
      this.isOpenedChange.emit(this.isOpened);
    }
  }

  get list():ColumnFilterOption[] {
    return this.columnsFilterList.filter((x)=> x.columnName.toLowerCase().includes(this.search.toLowerCase()));
  }


}
