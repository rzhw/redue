# Redue

A Linux (possibly Windows in the future) [Due](http://www.dueapp.com/) desktop client. Written using Electron, Angular 2, and TypeScript.

If you have a Mac, you should use the [official Mac app](https://itunes.apple.com/us/app/due/id524373870?mt=12).

## Progress

If you've got Dropbox installed to the default path on Linux, Redue can already sit there in the background and nag you when needed. So the biggest selling point of Due is covered :) Of course, what fun is a read-only client!

This list covers just the baseline requirements, and ignores finer details. For more detailed TODOs, polishing, bugs, etc., head over to the issue tracker.

* Baby steps
  - **DONE** ~~Launch something!~~
  - **DONE** ~~Show the list of reminders~~
  - **DONE** ~~Notify once a reminder is due~~
  - **DONE** ~~Most importantly, nag when a reminder is overdue!~~
  - Starting and stopping timers (read-only)
* Edit functionality
  - Marking reminders as done
  - Editing reminder due date
  - Editing reminder repeat interval
  - Starting and stopping timers (read/write)
* Create functionality
  - Creating new reminders
  - Creating new timers
* User friendliness
  - Linux packaging
  - Windows packaging
* Things I want
  - GtkHeaderBar on Linux (if possible)
  - UWP-style look on Windows
