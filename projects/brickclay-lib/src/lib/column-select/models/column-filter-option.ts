export class ColumnFilterOption {
  columnName!: string;
  selected: boolean=true;

  constructor(columnName?: string, selected: boolean = false) {
   if (columnName) {
      this.columnName = columnName;
    }
    this.selected = selected;
  }

}
