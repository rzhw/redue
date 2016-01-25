import {Component} from 'angular2/core';
import {NavbarComponent} from './navbar.component';
import {Item} from './item';

@Component({
  selector: 'dueinator-app',
  directives: [NavbarComponent],
  template: `<navbar></navbar>
  <ul class="items">
    <li *ngFor="#item of items">
      {{item.name}}
    </li>
  </ul>`
})
export class AppComponent {
  public items: Item[];

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

      // Now go through this subset. We can combine this code w/above FIXME
      return dueReminders.map(function(x) {
        return <Item>{
          name: <string>dueObjects[x["name"]["UID"]],
          status: <number|BigInteger>x["status"],
          data: x
        };
      })
    })();

    console.log(dueTuples);

    this.items = dueTuples;
  }
}
