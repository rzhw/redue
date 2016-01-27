/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jquery.timeago/jquery.timeago.d.ts" />
import {Component} from 'angular2/core';
import {NavbarComponent} from './navbar.component';
import {NavbarTab} from './navbartab';
import {Item} from './item';

declare var jQuery: JQueryStatic;

@Component({
  selector: 'dueinator-app',
  directives: [NavbarComponent],
  template: `<navbar [selectedTab]="selectedTab"
    (selectedTabChanged)="onSelectedTabChanged($event)"></navbar>
  <ul class="items">
    <li *ngFor="#item of items">
      {{item.name}}
      (<time class="timeago" [attr.datetime]="item.dateDue | date:'medium'">{{item.dateDue}}</time>)
    </li>
  </ul>`
})
export class AppComponent {
  public items: Item[];
  public selectedTab: NavbarTab;
  private allItems: Item[];

  constructor() {
    // TODO move all this code elsewhere
    var dueTuples = (function() {
      var fs = require('fs');
      var path = require('path');
      var os = require('os');
      var zlib = require('zlib');
      var bplist = require('bplist-parser');
      var plist = require('simple-plist');

      // Get Dropbox folder path. Currently assumes personal, FIXME
      // Future: Don't use synchronous functions
      var dbInfoPath = path.join(os.homedir(), '.dropbox/info.json');
      var dbInfoJson = fs.readFileSync(dbInfoPath);
      var dbInfo = JSON.parse(dbInfoJson);
      var dbPath = dbInfo.personal.path;

      // Get Due file
      var duePath = path.join(dbPath, 'Apps/Due App/Sync.dueappgz');
      var dueGzBuf = fs.readFileSync(duePath);
      var dueBplistBuf = zlib.unzipSync(dueGzBuf);
      var dueBplistObj = bplist.parseBuffer(dueBplistBuf);
      var duePlistDict = dueBplistObj[0];
      var dueObjects = duePlistDict["$objects"];
      console.log(dueObjects);

      // Find Due Reminder objects.
      var dueReminders = [];
      for (var i = 0; i < dueObjects.length; i++) {
        if (dueObjects[i].hasOwnProperty("$class")
            && dueObjects[i]["$class"]["UID"] == 16) { // magic number FIXME
          dueReminders.push(dueObjects[i]);
        }
      }
      console.log(dueReminders);

      // TODO move this elsewhere.
      var nsTimeToDate = function(time: number) {
        var d = new Date(time * 1000 + Date.UTC(2001, 1, 1));
        // For some reason the above date is off by a month? TODO investigate
        d.setMonth(d.getMonth() - 1);
        return d;
      };

      // Now go through this subset. We can combine this code w/above FIXME
      return dueReminders.map(function(x) {
        return <Item>{
          name: <string>dueObjects[x["name"]["UID"]],
          dateDue: nsTimeToDate(dueObjects[x["dateDue"]["UID"]]["NS.time"]),
          status: <number|BigInteger>x["status"],
          data: x
        };
      })
    })();

    console.log(dueTuples);

    this.allItems = dueTuples;
    this.items = this.allItems;
  }

  ngAfterViewInit() {
    // TODO does this result in constantly running timeago
    jQuery("time.timeago").timeago();
  }

  onSelectedTabChanged(tab: NavbarTab) {
    this.items = this.allItems.filter(reminder => {
      return tab.filter(reminder.status);
    });
  }
}
