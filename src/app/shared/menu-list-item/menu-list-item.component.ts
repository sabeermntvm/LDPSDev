import { Component, OnInit, HostBinding, Input } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

import { Router } from '@angular/router';
import { NavService } from '../services/nav-service';
import { NavItem } from '../services/nav-item';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class MenuListItemComponent implements OnInit {
  expanded: boolean;
  isToggle:boolean=false;
  @HostBinding('attr.aria-expanded') ariaExpanded = false;
  @Input() item:NavItem
  @Input() depth: number;
  constructor(public navService: NavService,
    public router: Router) {
if (this.depth === undefined) {
this.depth = 0;
}
}

  ngOnInit(): void {
  }
  onItemSelected(item: NavItem) {
    this.router.navigate([item.route]);
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
      // item.children.
      // this.navService.closeNav();
      // this.expanded = !this.expanded;
    
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }
  show(){
this.isToggle= true;
  }
  hide(){
    this.isToggle= false;
  }
}
