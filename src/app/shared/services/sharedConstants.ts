import { LoanDataModel } from 'src/app/-model/loan-data-model';
import { LoanDetailModel } from 'src/app/-model/loan-detail-model';

export class SharedConstants {
    public static selectedLoan:LoanDetailModel;
    public static currentUpload:LoanDataModel = new LoanDataModel();;
 }