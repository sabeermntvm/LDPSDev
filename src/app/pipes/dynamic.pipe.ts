import { Injector, Pipe, PipeTransform } from '@angular/core';
import { PercentPipe, CurrencyPipe, DecimalPipe, DatePipe, UpperCasePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';

@Pipe({
    name: 'dynamicPipe'
})

export class DynamicPipe implements PipeTransform {

    public constructor(private injector: Injector) {
    }

    transform(value: any, pipeToken: string, pipeArgs?: string): any {
        const MAP = { 
            'currency': CurrencyPipe, 
            'decimal': DecimalPipe, 
            'percent': PercentPipe, 
            'date':DatePipe,
            'upperCase': UpperCasePipe,
            'lowerCase' : LowerCasePipe,
            'titleCase' : TitleCasePipe,
         }

        if (pipeToken && MAP.hasOwnProperty(pipeToken)) {
            var pipeClass = MAP[pipeToken];
            var pipe = this.injector.get(pipeClass);
            if (Array.isArray(pipeArgs)) {
                return pipe.transform(value, ...pipeArgs);
            } else {
                return pipe.transform(value, pipeArgs);
            }
        }
        else {
            return value;
        }
    }
}