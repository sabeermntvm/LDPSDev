import { Pipe, PipeTransform } from '@angular/core';
   import { DatePipe } from '@angular/common';
   
   @Pipe({
     name: 'customDate'
   })
   export class CustomDatePipe extends 
                DatePipe implements PipeTransform {
     transform(value: any, header?: any): any {
       if(header == "" || header == null ){
        return value;
       }
       else{
        if(header.toLowerCase()=="date"){
          return super.transform(value, "MMM y");
         }
         else
         return value
       }     
     }
   }