export class LoanDetailModel
{

    ckey:string
    ikey:string
    fname:string
    lname:string
    loan_sequence_number :string
    credit_score :number
    first_payment_date :string | Date;
    first_time_homebuyer_flag :string;
    maturity_date :string | Date;;
    //MetropolitanStatisticalAreaOrDevision { get; set; }
    mortgage_insurance_percentage :number
    number_of_units :number
    occupancy_status:string
    original_combined_loan_to_value :number
    original_debt_to_income_ratio :number
    original_upb :number
    original_loan_to_value :number
    original_interest_rate :number
    channel : string
    prepayment_penalty_mortgage_flag : string
    property_state : string
    property_type : string
    //public int PostalCode { get; set; }    
    loan_purpose:string
    original_loan_term :number
    number_of_borrowers :number
    super_conforming_flag :string
    monthly_reporting_period :string | Date
    current_actual_upb :string
    loan_age :number
    remaining_months_to_legal_maturity :number
    repurchase_flag :string
    modification_flag :string
    current_interest_rate :number
    current_deferred_upb :number
    modification_cost :number
    step_modification_flag :string
    deferred_payment_modification :string
    risk_category :number
    risk_type :string
    prob_default: string;


    // CreditScore: number
    // FirstPaymentDate : Date
    // FirstTimeHomebuyerFlag: string
    // MaturityDate: Date
    // MetropolitanStatisticalAreaOrDevision: number
    // MortgageInsurancePercentage: number
    // NumberOfUnits: number
    // OccupancyStatus: string
    // OriginalCombinedLoanToValue: number
    // OriginalDebitToIncomeRatio: number
    // OriginalUPB: number
    // OriginalLoanToValue: number
    // OriginalIntrestRate: number
    // Channel: string
    // PrepaymentPenaltyMortgage: string
    // PropertyState: string
    // PropertyType: string
    // PostalCode: number
    // LoanSequenceNumber: string
    // LoanPurpose: string
    // OriginalLoanTerm: number
    // NumberOfBorrowers: number
    // SuperConformingFlag: string
    // MonthlyReportingPeriod: Date
    // CurrentActualUpb: number
    // LoanAge: number
    // RemainingMonthsToLegalMaturity: number
    // RepurchaseFlag: string
    // ModificationFlag: string
    // CurrentInterestRate: number
    // CurrentDeferredUpb: number
    // ModificationCost: number
    // StepModificationFlag: string
    // DeferredPaymentModification: string
}