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
// import * as jspdf from 'jspdf';
// import html2canvas from 'html2canvas';
import { MatDialog } from '@angular/material/dialog';
import { ReportsComponent } from '../reports/reports.component';
import { LoanEditComponent } from '../loan-edit/loan-edit.component';
import { SharedConstants } from '../shared/services/sharedConstants';
import { FormControl } from '@angular/forms';
import { element } from 'protractor';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

const incr = 1;
@Component({
  selector: 'app-default-prediction',
  templateUrl: './default-prediction.component.html',
  styleUrls: ['./default-prediction.component.scss'],
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
export class DefaultPredictionComponent implements OnInit {
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
  @ViewChild("predictionpaginator") paginator: MatPaginator;
  chartData: ChartDataModel;
  chartSeries: number[] = []
  chartCategory: string[] = [];
  selectedChartItemIndex: number = 0;
  selectedRiskType: string;
  selectedRiskCategory: number;
  recordCount: number;
  pdfbase64String: string = ""
  excelbase64String: string = ""
  selectedLoan : LoanDetailModel;
  cKey:string;
  cKeyList: string[] = []
  keyword = 'name';
  title = 'materialApp';
   myControl = new FormControl();
  ngOnInit() {
    this._loanService.events$.forEach(modifiedRecord => 
      {
      var index = this.LoanDefaultPredictionResultList.findIndex(x => x.ikey ===modifiedRecord.ikey);
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
        if(index==this.chartCategory.length){
          this.SetTableData();
        }
      } 
        this.loadChart();     
      }
    );
    this.loadChart();  
    this.onSelectedMenu(0);    
    //this.getMyCkeyList();
    
  }

  constructor(private _router: Router, private _loanService: LoanDefaultPredictionService, public dialog: MatDialog) {
    this.chartData = new ChartDataModel();
    this.selectedLoan = new LoanDetailModel();
    this.chartData.chartSeries = this.chartSeries;
    this.chartData.chartCategory = this.chartCategory;
    this.onSelectedMenu(0);
    this.getMyCkeyList();
    // if(SharedConstants.currentUpload && SharedConstants.currentUpload.processed_data){
    //   this.processdata(SharedConstants.currentUpload.processed_data);  
    // }
    // else{
    //   this.getDataByCkey();  
    // }
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
    this.selectedMenu = index;
    if (this.selectedMenu === 0) {
      this.showTable = false;
      this.tabTitle = "Upload Dataset.";
      this.tabInstruction = "Please upload the dataset as excel sheet. The excel sheet should contain all the columns included in the sample template.";
    }
    else {
      this.showTable = true;
      this.tabTitle = "Loan Default Prediction.";
      this.tabInstruction = "Please click on the graph item to see the list of Loan default of certain category.";
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
    catch{
      this.showProgressBar = false;
      this.showVlidationError = true;
    }
  }
  uploadFileNew() {
    this.progressbarValue = 0;
    var progressInterval = Math.round(this.excelData.length / 500);
    if (progressInterval < 3) {
      progressInterval = 3;
    }
    this.uploadFileTimer(progressInterval);
    this._loanService.UploaDatasetAsExcelNew(this.selectedFile)
      .subscribe(data => {
        if (data != null) {
          this.cKey = data.ckey;
          if(this.cKeyList.indexOf(this.cKey)==-1){
            this.cKeyList.push(this.cKey);
            this.cKeyList = this.cKeyList.sort((n1,n2) =>  parseInt(n2)-parseInt(n1));
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


          // var category = distinctRiskType.sort((n1,n2)=> n1.risk_category - n2.risk_category).map(X=>X.risk_type);
          // var Series : any[]
          // var SeriesCopy : any[]
          // var index:number = 0;
          // for (const categoryItem of category) { 
          //   var count = this.LoanDefaultPredictionResultList.reduce(function(n, val) {
          //     return n + (val.risk_type === categoryItem);
          //   }, 0);
          //   Series[index]= count;
          //   SeriesCopy[index]= count;
          //   index = index+1;
          // }

          //var sorrtedSeries:Array<number> = Series.sort((n1,n2)=> n1 - n2);



          this.showProgressBar = true;
          this.progressbarValue = 98;

          ///this.uploadFileTimer(11);     
          this.loadChart();
          this.fileProcessingSuccess = true;
          this.showTable = true;
          this.showLoanDefaultTab();
        }
      },
        (httpErrorResponse: HttpErrorResponse) => {
          this.showProgressBar = false;
          this.showVlidationError = true;
          this.fileprocessStatus = "";
          this.errorData = httpErrorResponse.error;
        });
  }

  uploadFileTimer(seconds: number) {
    this.showProgressBar = true;
    const time = seconds;
    const timer$ = interval(1000);
    this.fileprocessStatus = "Uploading file....";

    const sub = timer$.subscribe((sec) => {
      this.progressbarValue = 95 - Math.round(95 - sec * 95 / seconds);
      if (this.progressbarValue >= 0 && this.progressbarValue < 10) {
        this.fileprocessStatus = "File accepted....";
      }
      // if (this.progressbarValue > 10 && this.progressbarValue < 25) {
      //   this.fileprocessStatus = "Validating dataset....";
      // }
      if (this.progressbarValue > 10 && this.progressbarValue < 60) {
        this.fileprocessStatus = "Processing data....";
      }
      if (this.progressbarValue > 60) {
        this.fileprocessStatus = "Loading result....";
      }
      this.curSec = sec;

      if (this.curSec === seconds || this.showTable) {
        sub.unsubscribe();
        // this.loadChart();
        // this.fileProcessingSuccess = true;
        // this.showTable = true;
        // this.showLoanDefaultTab();

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
    let aaa = ['Allocated Hours', 'Submitted Hours']
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
        selection: {
          enabled: true,
          type: 'x',
          fill: {
            color: '#24292e',
            opacity: 0.1
          },
          stroke: {
            width: 1,
            dashArray: 3,
            color: '#24292e',
            opacity: 0.4
          },
          xaxis: {
            min: undefined,
            max: undefined
          },
          yaxis: {
            min: undefined,
            max: undefined
          }
        }
      },
      plotOptions: {
        bar: {
          vertical: true,
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
      series: this.chartSeries,
      chart: {
        foreColor: '#373d3f',
        width: 380,
        type: "pie",
        // offsetX: -20,
        // offsetY: -20,
        events: {
          dataPointSelection: (e, chart, config) => {
            this.onChartDataPointSelection(config);
          }
        },
      },
      // colors: ['#008000', '#FFFF00', '#FFC200', '#FF0000'],
      colors: ['#FF0000', '#FFC200', '#FFFF00', '#008000'],
      labels: this.chartCategory,
      dataLabels: {
        offset: 0,
        //minAngleToShowLabel: 10,
        style: {
          //colors: ["#304758"]
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
  onStartResolution() {
    this.showReport = true;
    const dialogRef = this.dialog.open(ReportsComponent, {
      width: '80%',
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
    var req = {ckey:this.cKey};

    this._loanService.getReport(req).subscribe(res => {
      const linkSource = `data:application/pdf;base64,${res.pdf}`;
      const downloadLink = document.createElement("a");
      const fileName = "LoanDefaulter.pdf";
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    })
    
    // const linkSource = `data:application/pdf;base64,${this.pdfbase64String}`;
    // const downloadLink = document.createElement("a");
    // const fileName = "LoanDefaulter.pdf";
    // downloadLink.href = linkSource;
    // downloadLink.download = fileName;
    // downloadLink.click();
  }

  onDownloadExcel() {
    var req = {ckey:this.cKey};
    this._loanService.getReport(req).subscribe(res => {
      const linkSource = `data:application/excel;base64,${res.xlsx}`;
      const downloadLink = document.createElement("a");
      const fileName = "LoanDefaulter.xlsx";
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    })
    // const linkSource = `data:application/excel;base64,${this.excelbase64String}`;
    // const downloadLink = document.createElement("a");
    // const fileName = "LoanDefaulter.xlsx";
    // downloadLink.href = linkSource;
    // downloadLink.download = fileName;
    // downloadLink.click();
  }
  downloadZip() {
    const linkSource = `data:application/zip;base64,${this.excelbase64String}`;
    const downloadLink = document.createElement("a");
    const fileName = "LoanDefaulter.zip";
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
      this.allowedExtensions = ["xls", "xlsx"];
      if (event.target.files[0].name != null) {
        this.fileExtension = event.target.files[0].name.split('.').pop();
        if (this.allowedExtensions.indexOf(this.fileExtension) == -1) {
          //this.showMessageBox("msgSaveEmployeeProfileErr", "Attachment should be of type jpeg/png/bmp/svg ", MessageType.Information);
          validation.SlNumber = 2;
          validation.ValidationMsg = "File should be of type xls/xlsx";
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
    catch{
      this.fileprocessStatus = "";
      this.showProgressBar = false;
    }

  }
  onOpenLoanEdit(loan:any) {
    var selectedLoandata = this.selectedLoan;
    Object.keys(loan).map(function(key, index) {
      selectedLoandata[key]  = loan[key]
    });
    
    this.selectedLoan = selectedLoandata;
    this.selectedLoan.ckey = this.cKey;
    SharedConstants.selectedLoan = this.selectedLoan;
    const dialogRef = this.dialog.open(LoanEditComponent, {
      width: '80%',
      panelClass: 'loanedit-modal'
    });

  }
  oncKeyChanged(selectedVal:any){
    this.getDataByCkey(selectedVal);
  }

  getDataByCkey(cKey:string){
    var req = {ckey:cKey};
    this._loanService.getDataByCkey(req).subscribe(result => {
        this.cKey =cKey;      
        SharedConstants.currentUpload.ckey = cKey;
        SharedConstants.currentUpload.processed_data = result;
        this.processdata(result);    
        this.cKey =cKey;       
    })    
  }
  getMyCkeyList(){
    var req = {ckey:"dff"};
    this._loanService.getMyCkeyList(req).subscribe(result => {
        this.cKeyList =[];
        this.cKeyList = result;
        this.cKeyList = this.cKeyList.sort((n1,n2) =>  parseInt(n2)-parseInt(n1));
        if(SharedConstants.currentUpload && SharedConstants.currentUpload.processed_data){
          this.processdata(SharedConstants.currentUpload.processed_data);  
        }
        else{          
            this.getDataByCkey(this.cKeyList[0]);
        }        
    })    
  }

  private processdata(processed_data:any){
    // for (var i = 0; i < processed_data.length; i++) {
    //   if(processed_data[i].risk_category==0){
    //     processed_data[i].risk_type = "No Risk";
    //   }
    //   else if(processed_data[i].risk_category==1){
    //     processed_data[i].risk_type = "Low Risk";
    //   }
    //   else if(processed_data[i].risk_category==2){
    //     processed_data[i].risk_type = "Medium Risk";
    //   }
    //   else if(processed_data[i].risk_category==3){
    //     processed_data[i].risk_type = "High Risk";
    //   }
    //    // Add "total": 2 to all objects in array
    // }
  
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

          this.chartCategory = this.chartCategory.reverse();
          this.chartSeries = this.chartSeries.reverse();
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
    
    onFocused(e){
      // do something when input is focused
    }
  
}