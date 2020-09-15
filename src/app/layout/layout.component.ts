import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavItem } from '../shared/services/nav-item';
import { NavService } from '../shared/services/nav-service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  @ViewChild('appDrawer') appDrawer: ElementRef;
  navItems: NavItem[] = [
    {
      displayName: 'Upload Dataset ',
      iconName: 'fa fa-upload',
      route: 'home',
      // children: [
      //   {
      //     displayName: 'Default prediction model',
      //     iconName: 'null',
      //     route: 'home'
      //   }
        
      // ]
    },
    // {
    //   displayName: 'Default Prediction',
    //   iconName: 'fa fa-bar-chart',
    //   // route: 'prediction',     
    // }
    // {
    //   displayName: 'Early Resolution Model ',
    //   iconName: 'fa fa-user'
    
    // }
   
  ];

  constructor(private navService: NavService){    

  }
  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
    this.navService.closeNav();
    
  }

  ngOnInit(): void {
    
  }

}
