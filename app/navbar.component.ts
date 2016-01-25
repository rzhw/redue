import {Component} from 'angular2/core';

@Component({
  selector: 'navbar',
  template: `<nav class="navbar">
    <div class="nav">
      <a class="active" href="#">Reminders</a>
      <a href="#">Timers</a>
      <a href="#">Logged</a>
    </div>
  </nav>`
})
export class NavbarComponent { }
