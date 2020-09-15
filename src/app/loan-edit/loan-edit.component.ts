import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder} from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoanDetailModel } from '../-model/loan-detail-model';
import { SharedConstants } from '../shared/services/sharedConstants';
import { LoanDefaultPredictionService } from '../-service/load-default-prediction.service';
import { DatePipe } from '@angular/common';
import { ReportsComponent } from '../reports/reports.component';

@Component({
  selector: 'app-loan-edit',
  templateUrl: './loan-edit.component.html',
  styleUrls: ['./loan-edit.component.scss']
})
export class LoanEditComponent implements OnInit {
  eventForm:FormGroup; 
  loanDetailModel : LoanDetailModel;
  showError:boolean = false;
  public homebuyerFlagList = [
    {"id": "Y", "name": "Yes"},
    {"id": "N", "name": "No"},
    {"id": "9", "name": "Not Available"}
  ]
  public occupancyStatusList = [
    {"id": "P", "name": "Primary Residence"},
    {"id": "I", "name": "Investment Property"},
    {"id": "S", "name": "Second Home"},
    {"id": "9", "name": "Not Available"}
  ]
  public channelList = [
    {"id": "R", "name": "Retail"},
    {"id": "B", "name": "Broker"},
    {"id": "C", "name": "Correspondent"},
    {"id": "T", "name": "TPO Not Specified"},
    {"id": "9", "name": "Not Available"}
  ]
  public PPMFlagList = [
    {"id": "Y", "name": "PPM"},
    {"id": "N", "name": "Not PPM"}  
  ]

  public propertyTypeList = [
    {"id": "CO", "name": "Condo"},
    {"id": "PU", "name": "PUD"},
    {"id": "MH", "name": "Manufactured Housing"} ,
    {"id": "SF", "name": "Single-Family"} ,
    {"id": "CP", "name": "Co-op"},
    {"id": "99", "name": "Not Available"}   
  ] 
  public loanPurposeList = [
    {"id": "P", "name": "Purchase"},
    {"id": "C", "name": "Refinance - Cash Out"},
    {"id": "N", "name": "Refinance - No Cash Out"} ,
    {"id": "R", "name": "Refinance - Not Specified"},
    {"id": "9", "name": "Not Available"}   
  ] 
  public superConformingFlagList = [
    {"id": "Y", "name": "Yes"},
    {"id": "N", "name": "No"},
    {"id": "NA", "name": "Not Applicable"},
  ]

  public repurchaseFlagList = [
    {"id": "N", "name": "Not Repurchased"},
    {"id": "Y", "name": "Repurchased"},  
    {"id": "NA", "name": "Not Applicable"},      
  ]

  public modificationFlagList = [
    {"id": "Y", "name": "Yes"},
    {"id": "N", "name": "No"},
    {"id": "NA", "name": "Not Available"},
  ]
  
  public stepModificationFlagList = [
    {"id": "Y", "name": "Yes"},
    {"id": "N", "name": "No"},
    {"id": "NA", "name": "Not Available"},  
  ]

  public deferredPaymentModificationFlagList = [
    {"id": "Y", "name": "Yes"},
    {"id": "N", "name": "No"},
    {"id": "NA", "name": "Not Available"},  
  ]

  public stateList = [
    {"id": "AK", "name": "AK"},
    {"id": "AL", "name": "AL"},
    {"id": "AR", "name": "AR"},  
    {"id": "AZ", "name": "AZ"},  

    {"id": "CA", "name": "CA"}, 
    {"id": "CO", "name": "CO"},  
    {"id": "CT", "name": "CT"},  

    {"id": "DC", "name": "DC"},  
    {"id": "DE", "name": "DE"},  

    {"id": "FL", "name": "FL"},  
    {"id": "GA", "name": "GA"},  
    {"id": "GU", "name": "GU"},

    {"id": "HI", "name": "HI"},
    {"id": "IA", "name": "IA"},  
    {"id": "ID", "name": "ID"},  
    {"id": "IL", "name": "IL"},  
    {"id": "IN", "name": "IN"},      
    {"id": "KS", "name": "KS"},  
    {"id": "KY", "name": "KY"},  
    {"id": "LA", "name": "LA"},  

    {"id": "MA", "name": "MA"},  
    {"id": "MD", "name": "MD"},  
    {"id": "ME", "name": "ME"},     
    {"id": "MI", "name": "MI"},
    {"id": "MN", "name": "MN"},
    {"id": "MO", "name": "MO"},  
    {"id": "MS", "name": "MS"},  
    {"id": "MT", "name": "MT"},  

    {"id": "NC", "name": "NC"},  
    {"id": "ND", "name": "ND"},  
    {"id": "NE", "name": "NE"},  
    {"id": "NH", "name": "NH"},
    {"id": "NJ", "name": "NJ"},
    {"id": "NM", "name": "NM"},  
    {"id": "NV", "name": "NV"},  
    {"id": "NY", "name": "NY"},

    {"id": "OH", "name": "OH"},  
    {"id": "OK", "name": "OK"},  
    {"id": "OR", "name": "OR"},

    {"id": "PA", "name": "PA"},
    {"id": "RI", "name": "RI"},  
    {"id": "SC", "name": "SC"},  
    {"id": "SD", "name": "SD"},  

    {"id": "TN", "name": "TN"},  
    {"id": "TX", "name": "TX"},  

    
    {"id": "UT", "name": "UT"},  
    {"id": "VA", "name": "VA"},  
    {"id": "VI", "name": "VI"},
    {"id": "VT", "name": "VT"},
    {"id": "WA", "name": "WA"},  
    {"id": "WI", "name": "WI"},  
    {"id": "WV", "name": "WV"},  
    {"id": "WY", "name": "WY"},

  ]

  first_time_homebuyer_flag_name;
  occupancy_status_name;
  channel_name;
  prepayment_penalty_mortgage_flag_name;
  property_state_name;
  property_type_name;
  loan_purpose_name;
  super_conforming_flag_name;
  repurchase_flag_name;
  modification_flag_name;
  step_modification_flag_name;
  deferred_payment_modification_name;
  constructor(private Loan_fm_builder: FormBuilder, private datePipe: DatePipe, public dialogRef: MatDialogRef<LoanEditComponent>, private _loanService: LoanDefaultPredictionService,public dialog: MatDialog ) { }

  ngOnInit(): void {
    

    this.loanDetailModel = SharedConstants.selectedLoan;
    this.loanDetailModel.first_payment_date = new Date(this.loanDetailModel.first_payment_date);
    this.loanDetailModel.maturity_date = new Date(this.loanDetailModel.maturity_date);
    this.loanDetailModel.monthly_reporting_period = new Date(this.loanDetailModel.monthly_reporting_period),

    this.eventForm =  this.Loan_fm_builder.group({
      fname:this.loanDetailModel.fname,
      lname:this.loanDetailModel.lname,
      first_payment_date:this.loanDetailModel.first_payment_date,
      credit_score:this.loanDetailModel.credit_score,     
      first_time_homebuyer_flag:this.loanDetailModel.first_time_homebuyer_flag,      
      maturity_date:this.loanDetailModel.maturity_date,
      mortgage_insurance_percentage:this.loanDetailModel.mortgage_insurance_percentage,
      number_of_units:this.loanDetailModel.number_of_units,
      occupancy_status:this.loanDetailModel.occupancy_status,
      original_combined_loan_to_value:this.loanDetailModel.original_combined_loan_to_value,
      original_debt_to_income_ratio:this.loanDetailModel.original_debt_to_income_ratio,
      original_upb:this.loanDetailModel.original_upb,
      original_loan_to_value:this.loanDetailModel.original_loan_to_value,
      original_interest_rate:this.loanDetailModel.original_interest_rate,
      channel:this.loanDetailModel.channel,
      prepayment_penalty_mortgage_flag:this.loanDetailModel.prepayment_penalty_mortgage_flag,
      property_state:this.loanDetailModel.property_state,
      property_type:this.loanDetailModel.property_type,
      loan_purpose:this.loanDetailModel.loan_purpose,
      original_loan_term:this.loanDetailModel.original_loan_term,
      
      number_of_borrowers:this.loanDetailModel.number_of_borrowers,
      super_conforming_flag:this.loanDetailModel.super_conforming_flag,
      monthly_reporting_period:this.loanDetailModel.monthly_reporting_period ,
      current_actual_upb:this.loanDetailModel.current_actual_upb ,
      loan_age:this.loanDetailModel.loan_age,
      remaining_months_to_legal_maturity:this.loanDetailModel.remaining_months_to_legal_maturity,
      loan_sequence_number:this.loanDetailModel.loan_sequence_number,
      repurchase_flag:this.loanDetailModel.repurchase_flag,
      modification_flag:this.loanDetailModel.modification_flag,
      current_interest_rate:this.loanDetailModel.current_interest_rate,

      current_deferred_upb:this.loanDetailModel.current_deferred_upb,
      modification_cost:this.loanDetailModel.modification_cost,
      step_modification_flag:this.loanDetailModel.step_modification_flag,
      deferred_payment_modification:this.loanDetailModel.deferred_payment_modification,
      risk_type:this.loanDetailModel.risk_type,
      risk_category:this.loanDetailModel.risk_category,
      prob_default: this.loanDetailModel.prob_default,
      first_time_homebuyer_flagName: "",
      occupancy_statusName:"",
      channelName:"",
      prepayment_penalty_mortgage_flagName:"",
      property_stateName:"",
      property_typeName:"",
      loan_purposeName:"",
      super_conforming_flagName:"",
      repurchase_flagName:"",
      modification_flagName:"",
      step_modification_flagName:"",
      deferred_payment_modificationName:""

    });   
    this.first_time_homebuyer_flag_name = this.getHomebuyerFlag(this.loanDetailModel.first_time_homebuyer_flag);
    this.occupancy_status_name = this.getOccupancyStatus(this.loanDetailModel.occupancy_status);
    this.channel_name = this.getChannel(this.loanDetailModel.channel);
    this.prepayment_penalty_mortgage_flag_name = this.getPPMFlag(this.loanDetailModel.prepayment_penalty_mortgage_flag); 
    this.property_state_name = this.getState(this.loanDetailModel.property_state); 
    this.property_type_name = this.getPropertyType(this.loanDetailModel.property_type);
    this.loan_purpose_name = this.getLoanPurpose(this.loanDetailModel.loan_purpose);
    this.super_conforming_flag_name= this.getSuperConformingFlag(this.loanDetailModel.super_conforming_flag);
    this.repurchase_flag_name  = this.getRepurchaseFlag(this.loanDetailModel.repurchase_flag);
    this.modification_flag_name = this.getModificationFlag(this.loanDetailModel.modification_flag);
    this.step_modification_flag_name = this.getStepModificationFlag(this.loanDetailModel.step_modification_flag);
    this.deferred_payment_modification_name = this.getDeferredPaymentModificationFlag(this.loanDetailModel.deferred_payment_modification);
  }
  onSubmit(){

    delete this.loanDetailModel.risk_type;
    this.loanDetailModel.first_payment_date = this.datePipe.transform(this.loanDetailModel.first_payment_date,"yyyy-MM-dd"); //output : 2018-02-13
    this.loanDetailModel.maturity_date = this.datePipe.transform(this.loanDetailModel.maturity_date,"yyyy-MM-dd"); //output : 2018-02-13
    this.loanDetailModel.monthly_reporting_period = this.datePipe.transform(this.loanDetailModel.monthly_reporting_period,"yyyy-MM-dd"); //output : 2018-02-13

    this._loanService.updateRecord(this.loanDetailModel).subscribe((result: any) => {    
      this._loanService.recordModifiedEvent(result);
      this.dialogRef.close();
    })
  }

  getHomebuyerFlag(id){
    return this.homebuyerFlagList.filter(X=>X.id==id).map(X=>X.name);
  }
  getOccupancyStatus(id){
    return this.occupancyStatusList.filter(X=>X.id==id).map(X=>X.name);
  }
  getChannel(id){
    return this.channelList.filter(X=>X.id==id).map(X=>X.name);
  }
  
  getPPMFlag(id){
    return this.PPMFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  getState(id){
    return this.stateList.filter(X=>X.id==id).map(X=>X.name);
  }

  getPropertyType(id){
    return this.propertyTypeList.filter(X=>X.id==id).map(X=>X.name);
  }

  getLoanPurpose(id){
    return this.loanPurposeList.filter(X=>X.id==id).map(X=>X.name);
  }

  getSuperConformingFlag(id){
    return this.superConformingFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  getRepurchaseFlag(id){
    return this.repurchaseFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  getModificationFlag(id){
    return this.modificationFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  getStepModificationFlag(id){
    return this.stepModificationFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  getDeferredPaymentModificationFlag(id){
    return this.deferredPaymentModificationFlagList.filter(X=>X.id==id).map(X=>X.name);
  }

  onStartResolution(loan:LoanDetailModel){
    this.dialogRef.close();
    SharedConstants.selectedLoan = loan;
    const dialogResolution = this.dialog.open(ReportsComponent, {
      width: '100%',
      panelClass: 'report-modal'
    });

    dialogResolution.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }
  onCloseModal(){
    this.dialogRef.close();
  }  
}

