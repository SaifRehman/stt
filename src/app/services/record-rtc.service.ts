import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';
declare var WaveSurfer;
declare var require: any

const axios = require('axios');
@Injectable()
export class RecordRTCService {
  /**
   * NOTE: if your are upload the file on server then you change your according
   * UPLOAD ON SERVER @function stopRTC write your code
   */

  blobUrl: any;
  interval; recordingTimer: string; recordWebRTC: any; mediaRecordStream: any;
  options: any = {
    type: 'audio',
    mimeType: 'audio/webm',
    numberOfAudioChannels: 1,
    desiredSampRate: 16000
  }

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  /**
   * @function toggleRecord
   * check recording base on `recordingTimer`
   * getting permission on `mediaDevices` audio
   */
  toggleRecord() {
    console.log(this.recordingTimer)
    if (this.recordingTimer) {
      this.stopRTC();
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        this.startRTC(stream);
      }).catch(error => {
        alert(error)
      })
    }
  }

  /**
   * @param stream 
   * @name recordWebRTC set recording `stream` and `options`
   * @var blobUrl set null UI update
   * @see startCountdown()
   */
  startRTC(stream: any) {
    this.recordWebRTC = new RecordRTC.StereoAudioRecorder(stream, this.options);
    this.mediaRecordStream = stream;
    this.blobUrl = null;
    this.recordWebRTC.record();
    this.startCountdown();
  }

  /**
   * @function stopRTC
   * after `stop` recordWebRTC function getting blob
   * blob file making to blob url `blobUrl`
   * @name startCountdown stop counting with stream
   */
  stopRTC() {
    this.recordWebRTC.stop((blob) => {
      //NOTE: upload on server
      blob.text().then(text => {
        console.log("text is", text)
      });

      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
      console.log(blob)
      axios.put('https://s3.eu-de.cloud-object-storage.appdomain.cloud/openshift-voice-stt/alphasaif.wav',
      blob,
      {
        headers: { 
          'Content-Type': 'audio/wav',
          'Authorization': 'bearer eyJraWQiOiIyMDIwMTIyMTE4MzQiLCJhbGciOiJSUzI1NiJ9.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLTlhNDczNjQ5LWRiZTYtNGU1Mi05OTNkLWNlMWY4NTA5ZTJkOCIsImlkIjoiaWFtLVNlcnZpY2VJZC05YTQ3MzY0OS1kYmU2LTRlNTItOTkzZC1jZTFmODUwOWUyZDgiLCJyZWFsbWlkIjoiaWFtIiwianRpIjoiMTVkN2YzMjItZjcyYi00YTYwLWJkZDctZGYzNTcyNzVlYTgyIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC05YTQ3MzY0OS1kYmU2LTRlNTItOTkzZC1jZTFmODUwOWUyZDgiLCJuYW1lIjoiU2VydmljZSBjcmVkZW50aWFscy0xIiwic3ViIjoiU2VydmljZUlkLTlhNDczNjQ5LWRiZTYtNGU1Mi05OTNkLWNlMWY4NTA5ZTJkOCIsInN1Yl90eXBlIjoiU2VydmljZUlkIiwiYWNjb3VudCI6eyJ2YWxpZCI6dHJ1ZSwiYnNzIjoiNGQ0Y2NmN2RhOWI0NGI3MjlmMWRmOWY2YWU1NjViNGIiLCJmcm96ZW4iOnRydWV9LCJpYXQiOjE2MDk1ODQxMjEsImV4cCI6MTYwOTU4NzcyMSwiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9vaWRjL3Rva2VuIiwiZ3JhbnRfdHlwZSI6InVybjppYm06cGFyYW1zOm9hdXRoOmdyYW50LXR5cGU6YXBpa2V5Iiwic2NvcGUiOiJpYm0gb3BlbmlkIiwiY2xpZW50X2lkIjoiZGVmYXVsdCIsImFjciI6MSwiYW1yIjpbInB3ZCJdfQ.J0SQ5k_clHKhsNJ5p_8jLXg1kqu91wwMy7hOXCRll1HqTMXN5gXeiqRojJzElKUw4E-90BooHAo7Yc-HIiWGqNqNkaG5XI6VQW3hhzF8PKUfGh9rc8-lm4xCF-y1wOalj4HvS8R34hu-xwm49mhEu-5Pu6urpQXYJrc1gRelYvNo7iEVovIGvfmHRy2X5XvcUTscT4yQoFMOnGvzmfvL9QPOFy0WPrpYIgAn-In68abx195rNVBBmAlVrdkKpB_-0JzK8VM1QLqp_Yu9TPQp2nHRqRvvgLQqn5NWvCM9atRZdhx8ermNX0H7NXl7dqyCXawii-jZgTKmsUa766i7Jg'
         }
      });
      console.log(this.blobUrl);
      this.startCountdown(true);
    })
  }

  /**
   * @param clearTime default value `false` 
   * `false` miens recording start if getting `true` then we are stop counting `clearStream`
   * Maximum Recoding time `10`Minutes @see minutes == 10
   */
  startCountdown(clearTime = false) {
    if (clearTime) {
      this.clearStream(this.mediaRecordStream);
      this.recordWebRTC = null;
      this.recordingTimer = null;
      this.mediaRecordStream = null;
      clearInterval(this.interval);
      return
    } else {
      this.recordingTimer = `00:00`;
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      let timer: any = this.recordingTimer;
      timer = timer.split(':');
      let minutes = +timer[0];
      let seconds = +timer[1];

      if (minutes == 10) {
        this.recordWebRTC.stopRecording();
        clearInterval(this.interval);
        return
      }
      ++seconds;
      if (seconds >= 59) {
        ++minutes;
        seconds = 0;
      }

      if (seconds < 10) {
        this.recordingTimer = `0${minutes}:0${seconds}`;
      } else {
        this.recordingTimer = `0${minutes}:${seconds}`;
      }
    }, 1000);
  }
  clear(){
    this.clearStream(this.mediaRecordStream);
    this.recordWebRTC = null;
    this.recordingTimer = null;
    this.mediaRecordStream = null;
    clearInterval(this.interval);
  }

  /**
   * @param stream clear stream Audio also video
   */
  clearStream(stream: any) {
    try {
      stream.getAudioTracks().forEach(track => track.stop());
    } catch (error) {
      //stream error
    }
  }

}
