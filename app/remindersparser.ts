import {Reminder} from './reminder';

var fs = require('fs');
var path = require('path');
var os = require('os');
var zlib = require('zlib');
var bplist = require('bplist-parser');
var plist = require('simple-plist');

export class RemindersParser {
  pathToReminders(pathStr: string) {
    var dueGzBuf = fs.readFileSync(pathStr);
    var dueBplistBuf = zlib.unzipSync(dueGzBuf);
    var dueBplistObj = bplist.parseBuffer(dueBplistBuf);
    var duePlistDict = dueBplistObj[0];
    var dueObjects = duePlistDict["$objects"];
    console.log(dueObjects);

    // Find Due Reminder objects.
    var dueReminders = [];
    for (var i = 0; i < dueObjects.length; i++) {
      if (dueObjects[i].hasOwnProperty("$class") &&
          dueObjects[i]["$class"]["UID"] == 16) {  // magic number FIXME
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
    var reminders = dueReminders.map(function(x) {
      return <Reminder>{
        name: <string>
            dueObjects[x["name"]["UID"]],
        dateDue: nsTimeToDate(dueObjects[x["dateDue"]["UID"]]["NS.time"]),
        status: <number | BigInteger>x["status"],
        data: x,
        snoozeIntervalMs: <number>x["snoozeInterval"] * 1000
      };
    });

    return reminders;
  }
}
