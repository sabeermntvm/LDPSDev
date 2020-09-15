import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public selectedData: Subject<any>;

  constructor() {
    this.selectedData = new Subject();
  }

  showLoader(row: boolean) {
    this.selectedData.next(row);
  }
}
