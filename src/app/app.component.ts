import { Component, ViewChild } from '@angular/core';
import { RecordRTCService } from './services/record-rtc.service';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';  
import { NgbSlideEvent, NgbSlideEventSource, NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
declare var require: any

const axios = require('axios');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('mycarousel', {static : true}) carousel: NgbCarousel;
  public controls="controls";
  constructor(
    public _recordRTC:RecordRTCService,
    config: NgbCarouselConfig
  ){
    config.interval = 0;  
    config.wrap = true;  
    config.keyboard = true;  
    config.pauseOnHover = false;  
    config.showNavigationArrows = true;
    config.showNavigationArrows = true;
  }


  startVoiceRecord(){
    this._recordRTC.toggleRecord();
    this.controls = "controls";

  }
  left(){
    this.carousel.prev();
    this.retry();
  }
  right(){
    this.carousel.next();
    this.retry();
  }
  retry(){
    this._recordRTC.clear();
    this.controls = "";
  }
}




