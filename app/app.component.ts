/// <reference path="../typings/jquery/jquery.d.ts" />
import {Component} from 'angular2/core';
import {TimeAgoPipe} from 'angular2-moment';
import {NavbarComponent} from './navbar.component';
import {NavbarTab} from './navbartab';
import {Reminder} from './reminder';
import {RemindersManager} from './remindersmanager';

declare var jQuery: JQueryStatic;

var fs = require('fs');
var path = require('path');
var os = require('os');

@Component({
  selector: 'dueinator-app',
  directives: [NavbarComponent],
  pipes: [TimeAgoPipe],
  template: `<navbar [selectedTab]="selectedTab"
    (selectedTabChanged)="onSelectedTabChanged($event)"></navbar>
  <ul class="reminders">
    <li *ngFor="#reminder of reminders">
      {{reminder.name}}
      (<time>{{reminder.dateDue | amTimeAgo }}</time>)
    </li>
  </ul>`
})
export class AppComponent {
  public remindersManager: RemindersManager;
  public reminders: Reminder[];
  public selectedTab: NavbarTab;

  constructor() {
    // Get Dropbox folder path. Currently assumes personal, FIXME
    // Future: Don't use synchronous functions
    var dbInfoPath = path.join(os.homedir(), '.dropbox/info.json');
    var dbInfoJson = fs.readFileSync(dbInfoPath);
    var dbInfo = JSON.parse(dbInfoJson);
    var dbPath = dbInfo.personal.path;

    // Get Due file
    var duePath = path.join(dbPath, 'Apps/Due App/Sync.dueappgz');
    this.remindersManager = RemindersManager.fromPath(duePath);
    console.log('RemindersManager initialised');
    console.log(this.remindersManager.allReminders);
  }

  onSelectedTabChanged(tab: NavbarTab) {
    // TODO this should be in RemindersManager
    this.reminders = this.remindersManager.allReminders.filter(reminder => {
      return tab.filter(reminder.status);
    }).sort((a, b) => {
      if (a.dateDue < b.dateDue) {
        return -1;
      } else if (a.dateDue > b.dateDue) {
        return 1;
      }
      return 0;
    });
  }
}
