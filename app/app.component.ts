/// <reference path="../typings/jquery/jquery.d.ts" />
import {Component} from 'angular2/core';
import {TimeAgoPipe} from 'angular2-moment';
import {NavbarComponent} from './navbar.component';
import {NavbarTab} from './navbartab';
import {Item} from './item';

declare var jQuery: JQueryStatic;

@Component({
  selector: 'dueinator-app',
  directives: [NavbarComponent],
  pipes: [TimeAgoPipe],
  template: `<navbar [selectedTab]="selectedTab"
    (selectedTabChanged)="onSelectedTabChanged($event)"></navbar>
  <ul class="items">
    <li *ngFor="#item of items">
      {{item.name}}
      (<time>{{item.dateDue | amTimeAgo }}</time>)
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
        // For some reason the above date is off by a month and two days?
        // TODO investigate
        d.setMonth(d.getMonth() - 1);
        d.setDate(d.getDate() - 2);
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
    this.items = [];
  }

  onSelectedTabChanged(tab: NavbarTab) {
    this.items = this.allItems.filter(reminder => {
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
