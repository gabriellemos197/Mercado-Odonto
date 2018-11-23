import { TimeAgo } from '../pipes/time-ago';
import { Static } from '../pipes/static';
import { Price } from '../pipes/price';
import { Viewmore } from '../pipes/viewmore';
import { ObjectToArray } from '../pipes/object-to-array';
import { ArrayJoin } from '../pipes/array-join';
import { OrderBy } from '../pipes/order-by';
import { Range } from '../pipes/range';
import { Filter } from '../pipes/filter';
import { SlicePipe } from '../pipes/slice';
import { TruncatePipe } from '../pipes/truncate';
import { TimeRemain } from '../pipes/timeRemain';
import { IsNew } from '../pipes/isNew';
import { Dimensions } from '../pipes/dimensions';
import { SafeHtmlPipe } from '../pipes/safeHtml';
import { BreakLinePipe } from '../pipes/break-line';
import { NgModule } from '@angular/core';
 
@NgModule({
    declarations: [
        Range,
        Filter,
        SlicePipe,
        TruncatePipe,
        TimeRemain,
        IsNew,
        SafeHtmlPipe,
        Static,
        ArrayJoin,
        OrderBy,
        TimeAgo,
        Dimensions,
        Price,
        Viewmore,
        ObjectToArray,
        BreakLinePipe
    ],
    imports: [
 
    ],
    exports: [
        // Range,
        Filter,
        SlicePipe,
        TruncatePipe,
        TimeRemain,
        IsNew,
        SafeHtmlPipe,
        Static,
        ArrayJoin,
        OrderBy,
        TimeAgo,
        Dimensions,
        Price,
        Viewmore,
        ObjectToArray,
        BreakLinePipe
    ]
})
export class PipesModule {}
