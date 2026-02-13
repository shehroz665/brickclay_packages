import { Component, Input, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'bk-validator',
  standalone:true,
  imports: [],
  templateUrl: './validator.html',
})
export class BkValidator implements OnInit {
  @Input() control!: NgModel;
  @Input() label!: string;
  @Input() errorMessage: string='';
  @Input() showError:boolean= false;



  constructor() {


  }
  ngOnInit(): void {


  }

}


