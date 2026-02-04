export interface TableColumn<T = any> {
  header: string;
  field?: keyof T;
  width?: string;
  sticky?: boolean;
  sortable?: boolean;
  headerClass?: string;
  cellClass?: string;
  formatter?: (row: T) => string;

  /** show / hide both th + td */
  visible?: boolean; // default: true
}

export interface TableAction{
  name: string;       // e.g. edit, delete
  icon: string;
  tooltip: string;
  hasPermission: boolean;
}
