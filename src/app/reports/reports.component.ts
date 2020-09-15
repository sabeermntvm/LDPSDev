import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedConstants } from '../shared/services/sharedConstants';
import { ResolutionModelService } from '../-service/resolution-model.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { config, Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  showProgressBar = false
  submitted = false;
  questionList = [{ title: 'Q1', answered: 'true' }, { title: 'Q2', answered: 'true' }, { title: 'Q3', answered: 'active' }, { title: 'Q4', answered: 'false' }, { title: 'Q5', answered: 'false' }];
  lastQuestion: any;
  selectedQuestion: any;
  activeindex = 2;
  background: ThemePalette = undefined;
  questionArrayList: any[] = []
  qstnPrefix = "Q";
  recommendedResolution: string = "";
  question0: any = { "ckey": 1, "curr_index": 0, "curr_key": ["A", "001"], "curr_question": "Mortgagor has the ability to payoff loan?", "done": false, "evaluation": null, "ikey": 2, "path": {}, "score": { "A": { "dq": false, "name": "Payoff", "weight": 0 }, "B": { "dq": false, "name": "Reinstatement", "weight": 0 }, "C": { "dq": false, "name": "Repayment", "weight": 0 }, "D": { "dq": false, "name": "Modification", "weight": 0 }, "E": { "dq": false, "name": "MI Claims", "weight": 0 }, "F": { "dq": false, "name": "Short Payoff", "weight": 0 }, "G": { "dq": false, "name": "Deed in Lieu", "weight": 0 } } };
  selectedAnswer: any;
  resolutionSubscription: Subscription;
  restartFromQuestionSubscription: Subscription;
  answerModified: boolean = false;
  currentQuestion = true;
  selectedLoan: any;
  enableNext: boolean = false;
  enablePrevious: boolean = false;
  enableStartOver: boolean = false;
  answerSelected = false;
  
  constructor(private _resolutionService: ResolutionModelService, public dialogRef: MatDialogRef<ReportsComponent>) {
    this.startNewResolution();
  }
  ngOnInit(): void {
  }

  startNewResolution() {
    this.questionArrayList = [];
    this.lastQuestion = {};
    this.selectedQuestion = {};
    this.submitted = false;
    this.recommendedResolution = "";
    this.questionArrayList.push(this.question0);
    this.lastQuestion = this.questionArrayList[0];
    this.selectedQuestion = this.questionArrayList[0]
    this.selectedLoan = SharedConstants.selectedLoan;
    this.answerSelected = false;
    this.blockUI.start();
    var request = {
      ckey: this.selectedLoan.ckey,
      ikey: this.selectedLoan.ikey
    };    
    this.resolutionSubscription = this._resolutionService.getResolution(request)
      .subscribe(resolution => {
        this.questionArrayList = [];
        this.blockUI.stop();;
        this.selectedAnswer = null;            
        if(resolution.path.length>0){             
          this.questionArrayList = resolution.path;
        }
        this.questionArrayList.push(resolution);
        this.lastQuestion = this.questionArrayList[this.questionArrayList.length - 1];;
        this.selectedQuestion = this.questionArrayList[this.questionArrayList.length - 1];           
        if (this.selectedQuestion.done) {
          this.recommendedResolution = this.selectedQuestion.best_resolution;
          this.submitted = true;
        }
        this.currentQuestion = true;             
        this.answerModified = false;
        this.answerSelected = false;
        this.HandleButtonVisibility(this.selectedQuestion);
      },
        (error) => {
          this.blockUI.stop();
        }
      )
  }

  startOverResolution() {
    this.questionArrayList = [];
    this.lastQuestion = {};
    this.selectedQuestion = {};
    this.submitted = false;
    this.recommendedResolution = "";
    this.questionArrayList.push(this.question0);
    this.lastQuestion = this.questionArrayList[0];
    this.selectedQuestion = this.questionArrayList[0]
    this.selectedLoan = SharedConstants.selectedLoan;
    this.answerSelected = false;
    this.blockUI.start();
    var request = {
      ckey: this.selectedLoan.ckey,
      ikey: this.selectedLoan.ikey
    };
    this._resolutionService.clearResolution(request)
      .subscribe(reponse => {
        this.resolutionSubscription = this._resolutionService.getResolution(request)
          .subscribe(resolution => {
            this.questionArrayList = [];
            this.blockUI.stop();;
            this.selectedAnswer = null;
            this.questionArrayList.push(resolution);
            this.lastQuestion = this.questionArrayList[this.questionArrayList.length - 1];;
            this.selectedQuestion = this.questionArrayList[this.questionArrayList.length - 1];
            this.currentQuestion = true;             
            this.answerModified = false;
            this.answerSelected = false;
            this.HandleButtonVisibility(this.selectedQuestion);
          },
            (error) => {
              this.blockUI.stop();
            }
          )
      },
      (error) => {
        this.blockUI.stop();
      }
      );
  }

  ngOnDestroy() {
    if (this.resolutionSubscription) {
      this.resolutionSubscription.unsubscribe();
    }
    if (this.restartFromQuestionSubscription) {
      this.restartFromQuestionSubscription.unsubscribe();
    }
  }

  async callClear(request) {
    await this._resolutionService.clearResolution(request)
      .subscribe(reponse => {
        return reponse;
      })
  };

  onNextQuestionClicked(question) {
    if (this.selectedQuestion.curr_index < this.questionArrayList.length - 1) {
      if (this.answerModified == true) {
        this.updateQuestion(question)
      }
      else {
        this.answerModified = false;
        this.answerSelected = false;
        this.selectedQuestion = this.questionArrayList[this.selectedQuestion.curr_index + 1];  
        this.HandleButtonVisibility(this.selectedQuestion);     
      }       
    }
    else {
      this.nextQuestion(question);
    }
  }
  nextQuestion(question) {
    this.blockUI.start();
    //var path = JSON.parse(JSON.stringify(question.path));
    question.path = "";
    var request = JSON.parse(JSON.stringify(question));
    //var request = cloneShallow(question);
    //question.path = path;
    
    //var request = this.clone(question);
    // If Answered then we need to start over               
    request.evaluation = this.selectedAnswer
    this.resolutionSubscription = this._resolutionService.getResolution(request)
      .subscribe((data) => {
        this.blockUI.stop();
        if (data.done) {
          this.recommendedResolution = data.best_resolution;
          this.submitted = true;
        }
        question.evaluation = this.selectedAnswer
        this.questionArrayList.push(data);
        this.lastQuestion = data;
        this.selectedQuestion = data;        
        this.answerModified = false;
        this.answerSelected = false;
        this.HandleButtonVisibility(this.selectedQuestion);
      },
        (error) => {
          this.blockUI.stop();
        }
      );

  }

  updateQuestion(question) {

    this.blockUI.start();
    var request = JSON.parse(JSON.stringify(question));
    //var request = cloneDeep(question);
    var backReq = {
      ckey: request.ckey,
      ikey: request.ikey,
      rkey: request.tuple_key.rkey,
      nkey: request.tuple_key.nkey
    }
    this.restartFromQuestionSubscription = this._resolutionService.restartFromQuestion(backReq)
      .subscribe(backResponse => {
        if (backResponse) {
          this.questionArrayList.length = request.curr_index + 1
          request.evaluation = this.selectedAnswer
          this.resolutionSubscription = this._resolutionService.getResolution(request)
            .subscribe(resolutionResponse => {
              this.blockUI.stop();
              if (resolutionResponse.done) {
                this.recommendedResolution = resolutionResponse.best_resolution;
                this.submitted = true;
              }
              question.evaluation = this.selectedAnswer;
              this.questionArrayList.push(resolutionResponse);
              this.lastQuestion = this.questionArrayList[this.questionArrayList.length - 1];;
              this.selectedQuestion = this.questionArrayList[this.questionArrayList.length - 1];
              this.currentQuestion = true;             
              this.answerModified = false;
              this.answerSelected = false;
              this.HandleButtonVisibility(this.selectedQuestion);

            },
              (error) => {
                this.dialogRef.close();
                this.blockUI.stop();
              }
            )
        }
      },
        (error) => {
          this.blockUI.stop();
        }
      )
  }

  onStartOverClicked() {
    this.startOverResolution();
  }
  onPreviousQuestionClicked(selectedQuestion) {
    this.selectedQuestion = this.questionArrayList[selectedQuestion.curr_index - 1];
    // if(!this.selectedQuestion.score){
    //   this.getResolutionByQuestionIndex(this.selectedQuestion);
    // }
    this.HandleButtonVisibility(this.selectedQuestion);
  }

  async callBackToQuestion(backReq) {
    await this._resolutionService.restartFromQuestion(backReq)
      .subscribe(data => {
        return data;
      })
  };

  download(file) {
  }
  onSelectedQuestion(value: any, index: number) {
    this.answerSelected = false;
    this.selectedQuestion = value;
    this.HandleButtonVisibility(this.selectedQuestion);
    // if(!this.selectedQuestion.score){
    //   this.getResolutionByQuestionIndex(this.selectedQuestion);
    // }
  }
  onAnswerSelected(anwer: any) {
    this.selectedAnswer = anwer;
    this.answerModified = false;
    this.answerSelected = true;
    if (this.selectedQuestion.evaluation != null) {
      if (this.selectedQuestion.evaluation != anwer) {
        this.answerModified = true;
      }
    }
    else {
      this.currentQuestion = true;
    }
    // this.selectedQuestion.evaluation = anwer;
    this.HandleButtonVisibility(this.selectedQuestion);
  }
  onSubmit() {
    this.showProgressBar = true;
    setTimeout(() => {
      this.submitted = true; this.showProgressBar = false;

    }, 2000)

  }
  onCloseReport() {
    this.dialogRef.close();
  }

  HandleButtonVisibility(question){
    this.enableNext = false;
    this.enablePrevious = false;
    this.enableStartOver = false;
    if(question.curr_index>0){
      this.enablePrevious = true;
    }
    if(this.questionArrayList.length > 1){
      this.enableStartOver = true;
    }
    if(question.evaluation!=null || this.answerSelected==true){
      this.enableNext = true;
    }       
  }
  getResolutionByQuestionIndex(question){
    var requestQuestion = this.questionArrayList[question.curr_index-1];
    var request = {
      ckey: requestQuestion.ckey,
      ikey: requestQuestion.ikey,
      curr_key:requestQuestion.curr_key,
      rkey:requestQuestion.rkey,
      nkey:requestQuestion.nkey,      
      evaluation:requestQuestion.evaluation
    };   
    this.resolutionSubscription = this._resolutionService.getResolution(request)
      .subscribe(resolution => {
        this.blockUI.stop();;
        question = resolution;
        this.HandleButtonVisibility(this.selectedQuestion);
      },
        (error) => {
          this.blockUI.stop();
        }
      )
  }
}
