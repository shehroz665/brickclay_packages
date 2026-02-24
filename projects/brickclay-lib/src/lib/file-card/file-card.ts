import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BKTooltipDirective } from '../tooltip/tooltip.directive';
export type FileState = 'uploading' | 'uploaded' | 'failed';
@Component({
  imports: [CommonModule,BKTooltipDirective],
  selector: 'bk-file-card',
  templateUrl: './file-card.html',
  styleUrl: './file-card.css',
  standalone: true
})
export class BkFileCard implements OnInit {
  @Input() id: string ='';
  @Input() state: FileState = 'uploading';
  @Input() fileName: string = 'Tech design requirements.pdf';
  @Input() fileSize: string | null = '200 KB';
  @Input() progress: number = 65; // Progress percentage (0-100)
  @Input() errorMessage: string = 'Upload failed, please try again';
  @Output() remove = new EventEmitter<string>();

  /**
   *
   */
  constructor() {

  }

  ngOnInit(): void {

    if(!this.id){
      this.id = crypto.randomUUID();
    }

  }
  onRemove() {
    this.remove.emit(this.id);
  }

}
