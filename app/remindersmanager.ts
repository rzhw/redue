import {Reminder} from './reminder';

var fs = require('fs');
var path = require('path');
var os = require('os');
var zlib = require('zlib');
var bplist = require('bplist-parser');
var plist = require('simple-plist');

export class RemindersManager {
  public allReminders: Reminder[];
  public currentReminders: Reminder[];
  public timers: NodeJS.Timer[];
  public overdueTimers: NodeJS.Timer[];

  public static get OVERDUE_STATUS(): number { return 2 }
  public static get UPCOMING_STATUS(): number { return 1 }
  public static get TIMER_STATUS(): number { return 0 }

  constructor(reminders: Reminder[]) {
    this.allReminders = reminders;
    this.currentReminders = [];
    this.timers = [];
    this.overdueTimers = [];

    this.updateTimers();
  }

  // TODO consider moving this into a RemindersParser or similarly named class
  static fromPath(pathStr: string) {
    var dueGzBuf = fs.readFileSync(pathStr);
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
    var reminders = dueReminders.map(function(x) {
      return <Reminder>{
        name: <string>dueObjects[x["name"]["UID"]],
        dateDue: nsTimeToDate(dueObjects[x["dateDue"]["UID"]]["NS.time"]),
        status: <number|BigInteger>x["status"],
        data: x
      };
    });

    return new RemindersManager(reminders);
  }

  // FIXME this is really inefficient if there's lots of reminders
  // (Though fixing this requires a rethink of how reminders are loaded
  // and particularly, updated on sync)
  // TODO curious about a race condition; what would happen if the clear
  // happens, but a reminder is in the process of being triggered and creating
  // an interval? is that even possible?
  private updateTimers() {
    // Stop all existing timers
    for (var i = 0; i < this.timers.length; i++) {
      clearTimeout(this.timers[i]);
    }
    for (var i = 0; i < this.overdueTimers.length; i++) {
      clearInterval(this.overdueTimers[i]);
    }

    // Go through all the reminders
    for (var i = 0; i < this.allReminders.length; i++) {
      var reminder = this.allReminders[i];
      if (reminder.status == RemindersManager.UPCOMING_STATUS) {
        // TODO clean me up
        var timeout = reminder.dateDue.getTime() - (new Date()).getTime();
        this.timers.push(setTimeout(() => {
          alert('Reminder triggered: ' + reminder.name);
        }, timeout));
      }
      // TODO overdue statuses
    }
    console.log(this.timers);
  }
}
