import { Component} from '@angular/core';
import { trigger, transition, query, style, animate } from '@angular/animations';
import { NavService } from './shared/services/nav-service';
import { NavItem } from './shared/services/nav-item';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('myAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [style({ opacity: 0 })],
          { optional: true }
        ),
        query(
          ':leave',
           [style({ opacity: 1 }), animate('0.5s', style({ opacity: 0 }))],
          { optional: true }
        ),
        query(
          ':enter',
          [style({ opacity: 0 }), animate('0.5s', style({ opacity: 1 }))],
          { optional: true }
        )
      ])
    ])
    
      ] // register the animations
    
    })
export class AppComponent {
 
 
}
