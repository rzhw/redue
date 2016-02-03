import {Reminder} from './reminder';
import {RemindersParser} from './remindersparser';

var fs = require('fs');
var path = require('path');
var os = require('os');
var notifier = require('node-notifier');
var chokidar = require('chokidar');

export class RemindersManager {
  public allReminders: Reminder[];
  private timers: NodeJS.Timer[];
  private overdueTimers: NodeJS.Timer[];
  private remindersChangedCallbacks: ((reminders: Reminder[]) => void)[];
  private fileWatcher;

  // A fun tidbit of note: an overdue status may indeed be of status 2, but
  // take an upcoming reminder which passed. Its status is of course still 1!
  public static get OVERDUE_STATUS(): number { return 2 }
  public static get UPCOMING_STATUS(): number { return 1 }
  public static get TIMER_STATUS(): number { return 0 }

  constructor(reminders?: Reminder[]) {
    reminders = reminders || [];

    this.allReminders = reminders;
    this.timers = [];
    this.overdueTimers = [];
    this.remindersChangedCallbacks = [];

    this.updateTimers();
  }

  onRemindersChanged(callback: (reminders: Reminder[]) => void) {
    this.remindersChangedCallbacks.push(callback);
  }

  static fromPath(pathStr: string) {
    var remindersManager = new RemindersManager();
    remindersManager.fileWatcher = chokidar.watch(pathStr).on('all', (event, path) => {
      console.log('File changed!');
      var reminders = new RemindersParser().pathToReminders(pathStr);
      remindersManager.updateReminders(reminders);
    });
    return remindersManager;
  }

  private updateReminders(reminders: Reminder[]) {
    this.allReminders = reminders;
    this.updateTimers();
    this.remindersChangedCallbacks.forEach(x => x(this.allReminders));
  }

  // FIXME this is really inefficient if there's lots of reminders
  // (Though fixing this requires a rethink of how reminders are loaded
  // and particularly, updated on sync)
  // TODO curious about a race condition; what would happen if the clear
  // happens, but a reminder is in the process of being triggered and creating
  // an interval? is that even possible?
  private updateTimers() {
    // Stop all existing timers
    this.timers.forEach(x => clearTimeout(x));
    this.overdueTimers.forEach(x => clearInterval(x));
    this.timers = [];
    this.overdueTimers = [];

    // Go through all active reminders
    this.allReminders
        .filter(
            x => x.status == RemindersManager.UPCOMING_STATUS ||
                x.status == RemindersManager.OVERDUE_STATUS)
        .forEach(reminder => {
          // Get the timeout.
          var timeout = reminder.dateDue.getTime() - (new Date()).getTime();
          var snoozed = timeout < 0;

          // If this reminder is snoozed, find the next instance and use that
          // as the next timeout.
          if (snoozed) {
            var mult = -Math.ceil(timeout / reminder.snoozeIntervalMs) + 1;
            timeout += mult * reminder.snoozeIntervalMs;
          }

          var notifyObject = {
            title: 'Reminder' + (snoozed ? ' (snoozed)' : ''),
            message: reminder.name
          };

          // Set up the timer for the first notification.
          this.timers.push(setTimeout(() => {
            notifier.notify(notifyObject);
            // Set up the interval for following notifications.
            this.overdueTimers.push(
                setInterval(() => { notifier.notify(notifyObject); }, reminder.snoozeIntervalMs));
          }, timeout));
        });
    console.log(this.timers);
  }
}
