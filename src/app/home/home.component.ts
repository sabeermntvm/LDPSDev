import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { trigger, transition, query, style, animate } from '@angular/animations';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";

import { Router } from '@angular/router';
import { LoanDefaultPredictionService } from '../-service/load-default-prediction.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ValidationModel } from '../-model/validation-model';
import { LoanDetailModel } from '../-model/loan-detail-model';
import * as XLSX from 'xlsx';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { interval } from 'rxjs';
import { ChartDataModel } from '../-model/chart-data-model';
import { MatDialog } from '@angular/material/dialog';
import { ReportsComponent } from '../reports/reports.component';
import { LoanEditComponent } from '../loan-edit/loan-edit.component';
import { SharedConstants } from '../shared/services/sharedConstants';
import { FormControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { DatePipe } from '@angular/common';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

const incr = 1;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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

  ]
})

export class HomeComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  LoanDefaultPredictionResultList: any[];
  LoanDefaultPredictionResultListFiltered: any[];
  showReport = false;
  LoanDetail: any[];
  tabTitle: string;
  tabInstruction: string;
  fileprocessStatus;
  showTable = false;
  showProgressBar = false;
  showVlidationError = false;
  selectedMenu: number = 0;
  toggleMenu = ['Upload Dataset', 'Loan Default Prediction'];
  selectedFileName: string;
  selectedFileNameWithoutExtn: string;
  showselectedFile = false;
  isToggle = false;
  allowedExtensions: string[];
  fileExtension: any;
  selectedFile: any;
  errorData: any;
  arrayBuffer: any;
  showValidateBtn: boolean = false;
  missingCoumns: Array<string> = [];
  avilableColIndex: Array<number> = [];
  missingColIndex: Array<number> = [];
  excelData = [];
  filtredData = [];
  gridColumnDefinitions = [];
  templateColumnList = [];
  uploadFileColumnList = [];
  fileProcessingSuccess = false;

  displayedHeads: string[];
  displayedColumns: string[];
  columns: number;
  pageEvent: PageEvent;
  pageSizeOptions: Array<number> = [5, 10, 25, 100]
  pageIndex: number = 0;
  pageSize: number = this.pageSizeOptions[1];
  length: number;
  progressbarValue: number = 0;
  curSec: number = 0;
  public gridColumnDefinitionFile: Blob;
  public templateFile: Blob;
  @ViewChild("chart") chart: ChartComponent;
  public barChartOptions: Partial<any>;
  public pieChartOptions: Partial<any>;
  @ViewChild("paginator") paginator: MatPaginator;
  chartData: ChartDataModel;

  chartSeries: number[] = []
  chartCategory: string[] = [];

  chartSeries_Pie: number[] = []
  chartCategory_Pie: string[] = [];

  selectedChartItemIndex: number = 0;
  selectedRiskType: string;
  selectedRiskCategory: number;
  recordCount: number;
  pdfbase64String: string = ""
  excelbase64String: string = ""
  selectedLoan: LoanDetailModel;
  cKey: string;
  cKeyList: string[] = []
  keyword = 'name';
  title = 'materialApp';
  myControl = new FormControl();
  maxCount = 10;
  showUploadNote = false;
  currentProgressNote: any = {};
  progressItemList: any[] = [];
  progressResultList: any[] = [];
  showUploadNoteStacked = false;
  appendString = "."

  onPreloader = false;

  ngOnInit() {
    this._loanService.events$.forEach(modifiedRecord => {
      var index = this.LoanDefaultPredictionResultList.findIndex(x => x.ikey === modifiedRecord.ikey);
      this.LoanDefaultPredictionResultList[index] = modifiedRecord;

      const distinctRiskType = this.LoanDefaultPredictionResultList.filter((thing, i, arr) => {
        return arr.indexOf(arr.find(t => t.risk_type === thing.risk_type)) === i;
      });
      this.chartCategory = distinctRiskType.sort((n1, n2) => n1.risk_category - n2.risk_category).map(X => X.risk_type);
      var index: number = 0;
      for (const categoryItem of this.chartCategory) {
        var count = this.LoanDefaultPredictionResultList.reduce(function (n, val) {
          return n + (val.risk_type === categoryItem);
        }, 0);
        this.chartSeries[index] = count;
        index = index + 1;
        if (index == this.chartCategory.length) {
          this.SetTableData();
        }
      }
      this.loadChart();
    }
    );

    this.onSelectedMenu(0);
    //this.getServerData(null)
  }

  constructor(private _router: Router, private _loanService: LoanDefaultPredictionService, public dialog: MatDialog) {
    this.chartData = new ChartDataModel();
    this.selectedLoan = new LoanDetailModel();
    this.chartData.chartSeries = this.chartSeries;
    this.chartData.chartCategory = this.chartCategory;
    this.progressResultList = []
    this.progressItemList = [

      { index: "1", text: "Uploading file.", status: "pending" },
      { index: "1", text: "File successfully uploaded.", status: "pending" },
      { index: "2", text: "Evaluating the uploaded file.", status: "in-progress" },
      { index: "3", text: "Loaded XXXX rows for analysis.", status: "pending" },
      { index: "4", text: "Verifying the data elements for accuracy.", status: "pending" },
      { index: "5", text: "All data verified.", status: "pending" },
      { index: "6", text: "Analyzing Borrower Data.", status: "pending" },
      { index: "7", text: "Analyzing Loan Data.", status: "pending" },
      { index: "8", text: "Analyzing Property Data.", status: "pending" },
      { index: "9", text: "Combining External Data.", status: "pending" },
      { index: "10", text: "Running the staged Data through Beacon Default Engine.", status: "pending" },
      { index: "11", text: "Verifying Results.", status: "pending" },
      { index: "12", text: "Formatting the Output.", status: "pending" },
      // { index: "10", text: "Verifying Prediction Precision.", status: "pending"},
      // { index: "11", text: "Verifying Prediction F1 Score.", status: "pending"},
      // { index: "12", text: "Verifying Prediction Recall.", status: "pending"},
      // { index: "13", text: "Verifying True Positive.", status: "pending"},
      // { index: "14", text: "Verifying True Negative.", status: "pending"},
      // { index: "15", text: "Verifying False Positive.", status: "pending"},
      // { index: "16", text: "Verifying False Negative.", status: "pending"},
    ];

    this.onSelectedMenu(0);
    //this.getMyCkeyList();
    this._loanService.getGridColumnDefinitionFile().subscribe((result: any) => {
      this.gridColumnDefinitionFile = result;
      this.loadGridColumnDefinition();
    })
    this._loanService.getTemplateFile().subscribe((result: any) => {
      this.templateFile = result;
      this.loadTemplateFileColumns();
    })
  }
  onSelectedMenu(index: number) {
    if (!this.fileProcessingSuccess && index) {
      return;
    }
    this.selectedMenu = index;
    if (this.selectedMenu === 0) {
      this.showTable = false;
      this.tabTitle = "Upload Dataset.";
      this.tabInstruction = "Please upload the dataset as excel sheet. The excel sheet should contain all the columns included in the sample template.";
    }
    else {
      this.tabTitle = "Loan Default Prediction.";
      this.tabInstruction = "Please click on the bar chart series to see the list of Loan default of particular risk category.";
    }
  }

  async onValidateFile() {
    this.progressbarValue = 0;
    this.showValidateBtn = false;
    this.showProgressBar = true;
    this.fileprocessStatus = "Validating File....";
    let uplodedFIleHeader: any;
    uplodedFIleHeader = await this.excelHeaderReader(this.selectedFile);
    this.validateFileTimer(3, uplodedFIleHeader);

  }

  showLoanDefaultTab() {
    this.selectedMenu = 1;
    this.fileprocessStatus = "";
    this.showProgressBar = false;
    this.showVlidationError = false;
    this.onSelectedMenu(1);
  }

  onResetFileSelection() {
    this.progressbarValue = 0;
    this.fileProcessingSuccess = false;
    this.showselectedFile = !this.showselectedFile
    this.showVlidationError = false;
    this.errorData = [];
    this.showValidateBtn = false;
    this.missingCoumns = [];
  }

  uploadFile() {
    try {
      this.formatExcelByTepmlate();
      this.showProgressBar = true;
      this.progressbarValue = 0;
      //this.uploadFileTimer(11);

    }
    catch {
      this.showProgressBar = false;
      this.showVlidationError = true;
    }
  }

  onClearAndUpLoad() {
    this.blockUI.start();
    var request = {
      // ckey: this.selectedLoan.ckey,
      // ikey: this.selectedLoan.ikey
    };
    this._loanService.deleteData(request).subscribe(data => {
      this.blockUI.stop();
      this.uploadFileNew();
    },
      (httpErrorResponse: HttpErrorResponse) => {
        this.blockUI.stop();
        console.log("Error in delete")
        console.log(httpErrorResponse)
        this.uploadFileNew();
      });


  }

  uploadFileNew() {

    try {
      this.errorData = [];
      this.showVlidationError = false;
      this.progressResultList = [];
      this.progressItemList.forEach(function (progress) {
        progress.status = "pending";
      });
      this.showUploadNote = true;
      this.appendString = "."
      this.preUploadFileTimer();
      this._loanService.UploaDatasetAsExcelNew(this.selectedFile)
        .subscribe(data => {
          if (data != null) {

            var seconds = 300;
            this.showUploadNote = true;
            const time = seconds;
            const timer$ = interval(100);
            const sub = timer$.subscribe((sec) => {
              this.curSec = sec;
              if (this.onPreloader == false) {

                sub.unsubscribe();
                this.showUploadNote = false;
                this.chartCategory = [];
                this.chartSeries = [];
                this.chartCategory_Pie = [];
                this.chartSeries_Pie = [];
                SharedConstants.currentUpload = data;
                this.cKey = data.ckey;

                if (this.cKeyList.indexOf(this.cKey) == -1) {
                  this.cKeyList.push(this.cKey);
                  this.cKeyList = this.cKeyList.sort((n1, n2) => parseInt(n2) - parseInt(n1));
                }

                this.progressbarValue = 90;
                this.LoanDefaultPredictionResultList = data.processed_data;
                if (this.LoanDefaultPredictionResultList.length > 0) {
                  this.LoanDefaultPredictionResultList = this.LoanDefaultPredictionResultList.sort((n1, n2) => n2.prob_default - n1.prob_default);

                  this.LoanDefaultPredictionResultListFiltered = data.processed_data;
                  this.pdfbase64String = data.pdf;
                  this.excelbase64String = data.xlsx;
                  const distinctRiskType = this.LoanDefaultPredictionResultList.filter((thing, i, arr) => {
                    return arr.indexOf(arr.find(t => t.risk_type === thing.risk_type)) === i;
                  });
                  this.progressbarValue = 95;
                  this.chartCategory = distinctRiskType.sort((n1, n2) => n1.risk_category - n2.risk_category).map(X => X.risk_type);
                  //this.chartCategory = distinctRiskType.map(X=>X.risk_type);
                  var index: number = 0;
                  for (const categoryItem of this.chartCategory) {
                    var count = this.LoanDefaultPredictionResultList.reduce(function (n, val) {
                      return n + (val.risk_type === categoryItem);
                    }, 0);
                    this.chartSeries[index] = count;
                    index = index + 1;
                  }
                }
                this.chartCategory_Pie = ["No Risk", "Risk"]
                var riskCount = 0;
                var indx = 0
                for (const categoryItem of this.chartCategory) {
                  if (categoryItem == "No Risk") {
                    this.chartSeries_Pie[0] = this.chartSeries[indx]
                  }
                  else {
                    riskCount = riskCount + this.chartSeries[indx];
                  }
                  indx = indx + 1;
                }

                this.chartSeries_Pie[1] = riskCount;
                if (this.chartSeries_Pie[0] > this.chartSeries_Pie[1]) {
                  this.chartCategory_Pie = this.chartCategory_Pie.reverse();
                  this.chartSeries_Pie = this.chartSeries_Pie.reverse();
                }

                var noRiskIndx = this.chartCategory.indexOf("No Risk");
                this.chartCategory.splice(noRiskIndx, 1)
                this.chartSeries.splice(noRiskIndx, 1)

                this.chartCategory = this.chartCategory.reverse();
                this.chartSeries = this.chartSeries.reverse();


                this.maxCount = Math.max(...this.chartSeries)

                this.showProgressBar = true;
                this.progressbarValue = 98;

                this.loadChart();
                this.fileProcessingSuccess = true;
                this.showTable = true;
                this.showLoanDefaultTab();
              }
            });
          }
        },
          (httpErrorResponse: HttpErrorResponse) => {
            this.showUploadNote = false;
            this.showVlidationError = true;
            this.fileprocessStatus = "";
            if (httpErrorResponse.status == 401) {
              localStorage.removeItem("Authorization")
              this._router.navigate(['/signin']);
              return;
            }            
            let validation = new ValidationModel;
            validation.SlNumber = 1;
            validation.ValidationMsg = "Error on uploading file.";
            this.errorData.push(validation);

          });
    }
    catch {
      let validation = new ValidationModel;     
      this.showUploadNote = false;
      validation.SlNumber = 1;
      validation.ValidationMsg = "Error on uploading file.";
      this.errorData.push(validation);
      this.showVlidationError = true;
      console.log("Error on upload");
    }
  }



  preUploadFileTimer() {

    try {
      this.onPreloader = true;
      var currentProgressIndx = 0;
      this.progressResultList.push(this.progressItemList[0])
      this.progressResultList[this.progressResultList.length - 1].status = "pending";
      this.appendString = "."
      var seconds = 70;          //var seconds = 2;
      const time = seconds;
      const timer$ = interval(1000);

      //Show "File successfully uploaded"
      this.appendString = "."
      this.progressResultList[this.progressResultList.length - 1].status = "completed"
      currentProgressIndx = currentProgressIndx + 1;
      this.progressResultList.push(this.progressItemList[currentProgressIndx])
      this.progressResultList[this.progressResultList.length - 1].status = "pending"

      const sub = timer$.subscribe((sec) => {

        this.appendString = this.appendString + ".";
        if (this.appendString == ".....................") {
          this.appendString = "."
        }
        /// show "Evaluating the uploaded file"
        if (sec == 1) {

          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"

        }

        ///show "Loaded XXXX number of rows for analysis"
        if (sec == 6) {

          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"

        }
        //show "Verifying the data elements for accuracy"       
        if (sec == 11) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"


        }
        //show "All data verified"
        if (sec == 20) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"

        }
        //show "Analyzing Borrower Data"
        if (sec == 22) {

          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        //Show "Analyzing Loan Data"
        if (sec == 30) {

          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        //Show "Analyzing Property Data"
        if (sec == 35) {

          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"

        }
        //show "Combining External Data"
        if (sec == 43) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        //show ""Running the staged Data through Beacon Default Engine"
        if (sec == 48) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        // show "Verifying Results"
        if (sec == 61) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        // show "Formatting the Output."
        if (sec == 68) {
          this.appendString = "."
          this.progressResultList[this.progressResultList.length - 1].status = "completed"
          currentProgressIndx = currentProgressIndx + 1;
          this.progressResultList.push(this.progressItemList[currentProgressIndx])
          this.progressResultList[this.progressResultList.length - 1].status = "pending"
        }
        // if (sec==70) {
        //   this.appendString = "."
        //   this.progressResultList[this.progressResultList.length-1].status = "completed"
        // }           
        this.curSec = sec;
        if (this.curSec === seconds) {
          sub.unsubscribe();
          this.onPreloader = false;
          //this.showUploadNote = false;
        }
      });
    }
    catch {
      //this.showUploadNote = false;
      this.onPreloader = false;
    }
  }

  showUploadNoteTimer(seconds: number) {
    this.showUploadNote = true;
    const time = seconds;
    const timer$ = interval(1000);
    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = 100 - Math.round(100 - sec * 100 / seconds);
      if (this.progressbarValue > 0 && this.progressbarValue < 10) {

      }
      if (this.progressbarValue > 10 && this.progressbarValue < 25) {

      }
      this.curSec = sec;
      if (this.curSec === seconds) {
        sub.unsubscribe();
        this.showUploadNote = false;
      }
    });
  }

  validateFileTimer(seconds: number, uplodedFIleHeader: any) {
    this.showProgressBar = true;
    this.fileprocessStatus = "Validating File....";
    const time = seconds;
    const timer$ = interval(1000);
    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = 100 - Math.round(100 - sec * 100 / seconds);
      if (this.progressbarValue > 0 && this.progressbarValue < 10) {
        this.fileprocessStatus = "Validating File....";
      }
      if (this.progressbarValue > 10 && this.progressbarValue < 25) {
        this.fileprocessStatus = "Validating columns....";
      }
      this.curSec = sec;
      if (this.curSec === seconds) {
        sub.unsubscribe();
        this.templateColumnList.forEach(element => {
          if (!uplodedFIleHeader.includes(element)) {
            this.missingCoumns.push(element);
          }
        });

        uplodedFIleHeader.forEach(element => {
          if (!this.templateColumnList.includes(element)) {
            this.missingColIndex.push(uplodedFIleHeader.indexOf(element));
          }
        });

        if (this.missingCoumns.length == 0) {
          this.showProgressBar = false;
          this.showVlidationError = false;
          this.showValidateBtn = true;
        }
        else {
          this.showProgressBar = false;
          this.showVlidationError = true;
          this.fileprocessStatus = "";
          let error = new Array<ValidationModel>();
          let validationModel = new ValidationModel;
          validationModel.SlNumber = 1;
          validationModel.ValidationMsg = 'Invalid file template'
          error.push(validationModel);
          let validation = new ValidationModel;
          validation.SlNumber = 2;
          validation.ValidationMsg = "Missing columns are " + this.missingCoumns.join();
          error.push(validation);
          this.errorData = error
        }
      }
    });
  }

  loadChart() {
    this.SetTableData();
    this.pageSize = 10;
    this.barChartOptions = {
      series: [
        {
          name: "Count",
          data: this.chartSeries
        }
      ],
      chart: {
        type: "bar",
        height: 300,
        events: {
          dataPointSelection: (e, chart, config) => {
            this.onChartDataPointSelection(config);
          }
        },
      },
      colors: ["#ff5050"],
      plotOptions: {
        bar: {
          vertical: false,
          // distributed: true,
          dataLabels: {
            position: 'top', // top, center, bottom
          },
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        textAnchor: 'start',
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: this.chartCategory
      },
      yaxis: {
        show: true,
        showAlways: true,
        // showForNullSeries: true,
        // seriesName: undefined,
        // opposite: false,
        // reversed: false,
        // logarithmic: false,
        // tickAmount: 6,
        min: 0,
        max: this.maxCount < 10 ? 10 : this.maxCount,
        // forceNiceScale: false,
        // floating: false,
        // decimalsInFloat: undefined,
        labels: {
          show: true,
          align: 'right',
          minWidth: 0,
          maxWidth: 160,
          style: {
            colors: [],
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
            cssClass: 'apexcharts-yaxis-label',
          },
          offsetX: 0,
          offsetY: 0,
          rotate: 0,
          formatter: (value) => { return parseInt(value) },
        },
        axisBorder: {
          show: true,
          color: '#78909C',
          offsetX: 0,
          offsetY: 0
        },
        axisTicks: {
          show: true,
          borderType: 'solid',
          color: '#78909C',
          width: 6,
          offsetX: 0,
          offsetY: 0
        },
        title: {
          text: undefined,
          rotate: -90,
          offsetX: 0,
          offsetY: 0,
          style: {
            color: undefined,
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 600,
            cssClass: 'apexcharts-yaxis-title',
          },
        },
        crosshairs: {
          show: true,
          position: 'back',
          stroke: {
            color: '#b6b6b6',
            width: 1,
            dashArray: 0,
          },
        },
        tooltip: {
          enabled: true,
          offsetX: 0,
        },

      },
      subtitle: {
        // text: 'X axis:Risk Category, Y axis : Loan Count',
        align: 'left',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '12px',
          color: '#9699a2'
        },
      },

    };

    this.pieChartOptions = {
      series: this.chartSeries_Pie,
      chart: {
        foreColor: '#373d3f',
        width: 380,
        type: "pie",
        //radius:  "100%",    
        // offsetX: -20,
        // offsetY: -20,
        events: {
          dataPointSelection: (e, chart, config) => {
            this.onPieChartDatSelection(config);
          },
          mounted: (chartContext, config) => {
            this.onPieChartLoaded(config);
          },
          dataPointMouseEnter: (event, chartContext, config) => {
            this.onPieChartdataPointMouseEnter(config);
          },
          dataPointMouseLeave: (event, chartContext, config) => {
            this.onPieChartdataPointMouseLeave(config);
          }
        },
      },

      colors: ['#ff5050', '#00E396',],
      //colors: ['#FF0000','#008000',],
      labels: this.chartCategory_Pie,
      dataLabels: {
        offset: 0,
        //minAngleToShowLabel: 10,
        style: {
          //colors: ["#304758"]
        },
        formatter: function (val, opts) {
          if (opts.seriesIndex == 0) {
            return "Risk " + val.toFixed(1) + "%"
            //return "Risk"
          }
          else {
            return "No Risk " + val.toFixed(1) + "%"
          }
        },
      },
      subtitle: {
        text: 'Loan distribution based on Risk Category',
        align: 'left',
        margin: 0,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize: '12px',
          color: '#9699a2'
        },
      },


      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  onPieChartDatSelection(config: any) {

    if (config.selectedDataPoints.length > 0) {
      this.selectedChartItemIndex = config.selectedDataPoints[0][0]
    }

    if (this.selectedChartItemIndex >= 0 && config.dataPointIndex == 0) {
      this.barChartOptions.colors = ["#ff5050"]
    }
    else {
      this.barChartOptions.colors = ["#ff505026"]
    }

    // this.pageIndex = 0;
    // if (this.paginator) {
    //   this.paginator.pageIndex = 0;
    // }
    // if (config.selectedDataPoints.length > 0) {
    //   this.selectedChartItemIndex = config.selectedDataPoints[0][0]
    // }
    // this.selectedRiskCategory = null;
    // this.selectedRiskType = null;

    // var selectedRiskCategory_Pie;
    // var selectedRiskType_Pie;


    // if (this.selectedChartItemIndex >= 0) {
    //   selectedRiskCategory_Pie = this.chartSeries_Pie[this.selectedChartItemIndex];
    //   selectedRiskType_Pie = this.chartCategory_Pie[this.selectedChartItemIndex];
    // }
    // var filtered: any[];
    // var stratingPostion = this.pageSize * this.pageIndex;
    // var endPosition = stratingPostion + this.pageSize;

    // this.LoanDefaultPredictionResultList = this.LoanDefaultPredictionResultList.sort((n1, n2) => n2.prob_default - n1.prob_default);
    // if (selectedRiskCategory_Pie) {
    //   if(selectedRiskType_Pie=="No Risk"){
    //     filtered = this.LoanDefaultPredictionResultList.filter(X => X.risk_category == 0)      
    //   }
    //   else{
    //     filtered = this.LoanDefaultPredictionResultList.filter(X => X.risk_category > 0) 
    //   }
    //   this.recordCount = filtered.length;
    // }
    // else {
    //   filtered = this.LoanDefaultPredictionResultList;
    //   filtered = this.LoanDefaultPredictionResultList.sort((a, b) => (a.risk_category < b.risk_category) ? 1 : -1)
    //   filtered = filtered.sort((n1, n2) => n2.prob_default - n1.prob_default);
    //   this.recordCount = filtered.length;
    // }
    // this.filtredData = filtered.slice(stratingPostion, endPosition)

  }

  onPieChartLoaded(config: any) {
  }

  onPieChartdataPointMouseEnter(config: any) {

    if (config.dataPointIndex == 0) {
      this.barChartOptions.colors = ["#ff5050"]
    }
    else {
      this.barChartOptions.colors = ["#ff505026"]
    }
  }
  onPieChartdataPointMouseLeave(config: any) {

    this.barChartOptions.colors = ["#ff5050"]
    // if (config.selectedDataPoints && config.selectedDataPoints.length > 0) {
    //       this.selectedChartItemIndex = config.selectedDataPoints[0][0]
    // }    

    // if (this.selectedChartItemIndex >= 0 && config.dataPointIndex==0 ) {
    //   this.barChartOptions.colors =["#ff5050"]
    // }
    // else{
    //   if(this.selectedChartItemIndex ==0){
    //     this.barChartOptions.colors =["#ff5050"]
    //   }
    //   else{
    //     this.barChartOptions.colors =["#ff505026"]
    //   }
    // }
  }

  onChartDataPointSelection(config: any) {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    if (config.selectedDataPoints.length > 0) {
      this.selectedChartItemIndex = config.selectedDataPoints[0][0]
    }
    this.selectedRiskCategory = null;
    this.selectedRiskType = null;

    if (this.selectedChartItemIndex >= 0) {
      this.selectedRiskCategory = this.chartSeries[this.selectedChartItemIndex];
      this.selectedRiskType = this.chartCategory[this.selectedChartItemIndex];
    }
    this.showTableFn();
    this.SetTableData();
  }

  downloadReport(file) {
    this._loanService.DownloadFile('DefaultPrediction').subscribe((result: any) => {
      let url = window.URL.createObjectURL(result);
      let pwa = window.open(url);
    }
    );
  }

  onChartSelection() {
    this.selectedRiskType = null;
    this.SetTableData()
  }

  onClose() {
    this._router.navigate(['/home']);
  }
  showTableFn() {
    this.showTable = true;
  }
  onStartResolution(loan: LoanDetailModel) {
    loan.ckey = this.cKey;
    SharedConstants.selectedLoan = loan;
    this.showReport = true;
    const dialogRef = this.dialog.open(ReportsComponent, {
      width: '100%',
      panelClass: 'report-modal'
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }

  download(file) {
    this._loanService.DownloadFile(file).subscribe(res => {
      let fileType = null;
      let fileName = null;
      if (file == "Template") {
        fileName = 'Template.xlsx'
      }
      else if (file == "DefaultPrediction") {
        fileName = 'DefaultPredictionReport.pdf'
      }
      let blob = new Blob([res], { type: fileType });
      var downloadURL = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = fileName;
      link.click();
    })
  }

  onDownloadPDF() {
    //this.blockUI.start()
    // var req = {ckey:this.cKey};
    // this._loanService.getReport(req).subscribe(res => {
    //   this.blockUI.stop()
    //   const linkSource = `data:application/pdf;base64,${res.pdf}`;
    //   const downloadLink = document.createElement("a");
    //   const fileName = "LoanDefaulter.pdf";
    //   downloadLink.href = linkSource;
    //   downloadLink.download = fileName;
    //   downloadLink.click();
    // },
    // (httpErrorResponse: HttpErrorResponse) => {
    //   this.blockUI.stop();       
    // });  
    var downloadTimeStamp = "";
    var timeStamp = new Date(Date.now());
   //downloadTimeStamp = new DatePipe('en-US').transform(timeStamp, 'medium');
   downloadTimeStamp = new DatePipe('en-US').transform(timeStamp, 'dd/MM/yy');

    // downloadTimeStamp= downloadTimeStamp.replace(", ", "_")
    // downloadTimeStamp= downloadTimeStamp.replace(" ", "_")
    // downloadTimeStamp= downloadTimeStamp.replace(":", "_");

    //downloadTimeStamp = downloadTimeStamp.split(', ').join('_').split(':').join('_').split(' ').join('_')
    downloadTimeStamp=downloadTimeStamp.split('/').join('')

    const linkSource = `data:application/pdf;base64,${this.pdfbase64String}`;
    const downloadLink = document.createElement("a");
    const fileName = "DPR" + "-" + this.selectedFileNameWithoutExtn + "-" + downloadTimeStamp + ".pdf";
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  onDownloadExcel() {
    // this.blockUI.start()
    // var req = {ckey:this.cKey};
    // this._loanService.getReport(req).subscribe(res => {
    //   this.blockUI.stop(); 
    //   const linkSource = `data:application/excel;base64,${res.xlsx}`;
    //   const downloadLink = document.createElement("a");
    //   const fileName = "LoanDefaulter.xlsx";
    //   downloadLink.href = linkSource;
    //   downloadLink.download = fileName;
    //   downloadLink.click();
    // },
    // (httpErrorResponse: HttpErrorResponse) => {
    //   this.blockUI.stop();       
    // })
    var downloadTimeStamp = "";
    var timeStamp = new Date(Date.now());
    downloadTimeStamp = new DatePipe('en-US').transform(timeStamp, 'dd/MM/yy');
    downloadTimeStamp=downloadTimeStamp.split('/').join('')


    const linkSource = `data:application/excel;base64,${this.excelbase64String}`;
    const downloadLink = document.createElement("a");
    const fileName = "DPR" + "-" + this.selectedFileNameWithoutExtn + "-" + downloadTimeStamp + ".xlsx";
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
  downloadZip() {

    var downloadTimeStamp = "";
    var timeStamp = new Date(Date.now());
    downloadTimeStamp = new DatePipe('en-US').transform(timeStamp, 'medium');
    downloadTimeStamp = downloadTimeStamp.split(', ').join('_').split(':').join('_').split(' ').join('_')

    const linkSource = `data:application/zip;base64,${this.excelbase64String}`;
    const downloadLink = document.createElement("a");
    const fileName = "DefaultPredictionResults" + "-" + this.selectedFileNameWithoutExtn + "-" + downloadTimeStamp + ".zip";
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  excelHeaderReader(file) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, { type: "binary" });
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          var arraylist = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
          this.excelData = arraylist;
          this.length = this.excelData.length;
          this.progressItemList[3].text = "Loaded " + (this.length - 1).toString() + " rows for analysis.";
          resolve(arraylist[0])
        }
      }, 2000)
    })
  }
  loadGridColumnDefinition() {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.gridColumnDefinitionFile);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      var arraylist: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      this.gridColumnDefinitions = arraylist.slice(1, arraylist.length);
      this.displayedHeads = this.gridColumnDefinitions.filter(X => X[3] == "TRUE").map(X => X[1])
      let action = ["Action"]
      this.displayedColumns = action.concat(this.displayedHeads);
    }
  }
  loadTemplateFileColumns() {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.templateFile);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      var arraylist: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
      this.templateColumnList = arraylist[0];
    }
  }

  getColumnDataPipe(columnName) {
    var dataType: string = this.gridColumnDefinitions.find(X => X[1] == columnName)[4];
    if (dataType) {
      return dataType;
    }
    else {
      return '';
    }

  }
  getColumnDataType(columnName) {
    var dataType: string = this.gridColumnDefinitions.find(X => X[1] == columnName)[2];
    if (dataType) {
      return dataType.toLowerCase();
    }
    else {
      return 'string';
    }

  }

  getColumnDataFormat(columnName) {
    var dataType: string = this.gridColumnDefinitions.find(X => X[1] == columnName)[5];
    if (dataType) {
      return dataType;
    }
    else {
      return '';
    }
  }

  getColumnVisibility(columnName) {
    var dataVisibility: string = this.gridColumnDefinitions.find(X => X[1] == columnName)[3];
    if (dataVisibility.toLowerCase() == "true") {
      return true;
    }
    else {
      return false;
    }
  }

  getColumnDisplyName(columnName) {
    var displyName: string = this.gridColumnDefinitions.find(X => X[1] == columnName)[6];
    if (displyName) {
      return displyName;
    }
    else {
      return columnName;
    }
  }

  formatExcelByTepmlateNew() {
    this.LoanDefaultPredictionResultList.forEach(element => {
      for (var i = this.missingColIndex.length - 1; i >= 0; i--)
        element.splice(this.missingColIndex[i], 1);
    });
  }

  formatExcelByTepmlate() {
    this.excelData.forEach(element => {
      for (var i = this.missingColIndex.length - 1; i >= 0; i--)
        element.splice(this.missingColIndex[i], 1);
    });
  }

  SetTableData() {
    var filtered: any[];
    var stratingPostion = this.pageSize * this.pageIndex;
    var endPosition = stratingPostion + this.pageSize;
    // var tepData = this.excelData.slice(1, this.excelData.length)
    //this.filtredData = tepData.slice(stratingPostion, endPosition)
    this.LoanDefaultPredictionResultList = this.LoanDefaultPredictionResultList.sort((n1, n2) => n2.prob_default - n1.prob_default);
    if (this.selectedRiskType) {
      filtered = this.LoanDefaultPredictionResultList.filter(X => X.risk_type == this.selectedRiskType)
      this.recordCount = filtered.length;
    }
    else {
      filtered = this.LoanDefaultPredictionResultList;
      filtered = this.LoanDefaultPredictionResultList.sort((a, b) => (a.risk_category < b.risk_category) ? 1 : -1)
      filtered = filtered.sort((n1, n2) => n2.prob_default - n1.prob_default);
      this.recordCount = filtered.length;
    }
    this.filtredData = filtered.slice(stratingPostion, endPosition)

  }
  public getServerData(event?: PageEvent) {
    this.pageSize = event ? event.pageSize : this.pageSize;
    this.pageIndex = event ? event.pageIndex : this.pageIndex;
    this.SetTableData();
    return event;
  }
  onFileSelected(event) {
    try {
      this.errorData = [];
      let validation = new ValidationModel;
      this.showVlidationError = false;
      //this.allowedExtensions = ["xls", "xlsx"];
      this.allowedExtensions = ["xlsx"];
      if (event.target.files[0].name != null) {
        this.selectedFileNameWithoutExtn = event.target.files[0].name.split('.').slice(0, -1).join('.')
        this.fileExtension = event.target.files[0].name.split('.').pop();
        if (this.allowedExtensions.indexOf(this.fileExtension) == -1) {
          //this.showMessageBox("msgSaveEmployeeProfileErr", "Attachment should be of type jpeg/png/bmp/svg ", MessageType.Information);
          validation.SlNumber = 2;
          validation.ValidationMsg = "File should be of type xlsx";
          this.errorData.push(validation);
          this.showVlidationError = true;
        }
        else {
          if (event.target.files[0].size < 4000000) {
            this.selectedFile = event.target.files[0];
            this.selectedFileName = event.target.files[0].name;
            if (this.selectedFileName != null) {
              this.showselectedFile = true;
            }
          }
          else {
            //this.showMessageBox("msgSaveEmployeeProfileErr", "Attachment size should be less than 4mb", MessageType.Information);
            validation.SlNumber = 1;
            validation.ValidationMsg = "File size should be less than 4mb";
            this.errorData.push(validation);
            this.showVlidationError = true;
          }
        }
      }
    }
    catch {
      this.fileprocessStatus = "";
      this.showProgressBar = false;
    }

  }
  onOpenLoanEdit(loan: any) {
    var selectedLoandata = this.selectedLoan;
    Object.keys(loan).map(function (key, index) {
      selectedLoandata[key] = loan[key]
    });

    this.selectedLoan = selectedLoandata;
    this.selectedLoan.ckey = this.cKey;
    SharedConstants.selectedLoan = this.selectedLoan;
    const dialogRef = this.dialog.open(LoanEditComponent, {
      width: '100%',
      panelClass: 'loanedit-modal'
    });

  }
  oncKeyChanged(selectedVal: any) {
    this.getDataByCkey(selectedVal);
  }

  getDataByCkey(cKey: string) {
    var req = { ckey: cKey };
    this._loanService.getDataByCkey(req).subscribe(result => {
      this.cKey = cKey;
      this.processdata(result);
      this.cKey = cKey;
    })
  }
  getMyCkeyList() {
    var req = { ckey: "dff" };
    this._loanService.getMyCkeyList(req).subscribe(result => {
      this.cKeyList = result;
      this.cKeyList = this.cKeyList.sort((n1, n2) => parseInt(n2) - parseInt(n1));
    })
  }

  private processdata(processed_data: any) {
    this.chartCategory = [];
    this.chartSeries = [];
    this.LoanDefaultPredictionResultList = processed_data;
    // this.LoanDefaultPredictionResultList = this.LoanDefaultPredictionResultList.filter(X=>X.risk_category==-1);
    // this.chartSeries = []
    // this.chartCategory = [];
    if (this.LoanDefaultPredictionResultList.length > 0) {
      this.LoanDefaultPredictionResultList = this.LoanDefaultPredictionResultList.sort((n1, n2) => n2.prob_default - n1.prob_default);

      this.LoanDefaultPredictionResultListFiltered = processed_data;
      const distinctRiskType = this.LoanDefaultPredictionResultList.filter((thing, i, arr) => {
        return arr.indexOf(arr.find(t => t.risk_type === thing.risk_type)) === i;
      });
      this.chartCategory = distinctRiskType.sort((n1, n2) => n1.risk_category - n2.risk_category).map(X => X.risk_type);
      //this.chartCategory = ["No Risk", "Low Risk", "Medium Risk", "High Risk"];
      var index: number = 0;
      for (const categoryItem of this.chartCategory) {
        var count = this.LoanDefaultPredictionResultList.reduce(function (n, val) {
          return n + (val.risk_type === categoryItem);
        }, 0);
        this.chartSeries[index] = count;
        index = index + 1;
      }
    }
    this.loadChart();
    this.SetTableData();
  }

  selectEvent(item) {
    // do something with selected item
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e) {
    // do something when input is focused
  }

}