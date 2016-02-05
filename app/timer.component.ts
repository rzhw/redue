import {Component} from 'angular2/core';
import {Observable, Subject} from 'rxjs/Rx';
import {Reminder} from './reminder';

@Component({
  selector: 'timer',
  template: `<div class="timer">
    <div class="info">
      <div class="time">{{timeString}}</div>
      <div class="name">{{reminder.name}}</div>
    </div>
    <button (click)="clicked.next($event)">Start</button>
  </div>`,
  inputs: ['reminder']
})
export class TimerComponent {
  public reminder: Reminder;
  public timeString: string;
  public name: string;
  private clicked: Subject<MouseEvent>;

  constructor() {
    this.clicked = new Subject<MouseEvent>();
  }
}
