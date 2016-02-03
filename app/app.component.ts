/// <reference path="../typings/jquery/jquery.d.ts" />
import {Component} from 'angular2/core';
import {TimeAgoPipe} from 'angular2-moment';
import {Observable, Subject} from 'rxjs/Rx';
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
    (selectedTabChanged)="selectedTabChanged($event)"></navbar>
  <ul class="reminders">
    <li *ngFor="#reminder of reminders | async">
      {{reminder.name}}
      (<time>{{reminder.dateDue | amTimeAgo }}</time>)
    </li>
  </ul>`
})
export class AppComponent {
  public remindersManager: RemindersManager;
  public reminders: Observable<Reminder[]>;
  public selectedTab: NavbarTab;
  private selectedTabChangedSubject: Subject<NavbarTab> = new Subject<NavbarTab>();

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

    // Set up the reminders changed event
    this.reminders =
        Observable
            .combineLatest(this.remindersManager.remindersChanged, this.selectedTabChangedSubject)
            .map(x => {
              var reminders = x[0];
              var selectedTab = x[1];

              if (selectedTab === undefined) {
                return;
              }

              return reminders.filter(reminder => selectedTab.filter(reminder.status))
                  .sort((a, b) => {
                    if (a.dateDue < b.dateDue) {
                      return -1;
                    } else if (a.dateDue > b.dateDue) {
                      return 1;
                    }
                    return 0;
                  });
            });
  }

  selectedTabChanged(tab: NavbarTab) {
    this.selectedTabChangedSubject.next(tab);
    this.selectedTab = tab;
  }
}
