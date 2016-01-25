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
      var dueObj = dueBplistObj[0];

      // Convert it to XML so we can use XPath search on it. Takes time.
      var dueXml = plist.stringify(dueObj);
      var dueDoc = new DOMParser().parseFromString(dueXml, 'text/xml');

      // Now look for items. We do this by looking for the status field.
      // (Method from https://gist.github.com/maxjacobson/1b72ae7fe658ca8bd60b)
      var dueNodes: Node[] = [];
      var it = dueDoc.evaluate("//key[text()='status']", dueDoc, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
      try {
        var thisNode = it.iterateNext();
        while (thisNode) {
          dueNodes.push(thisNode);
          thisNode = it.iterateNext();
        }
      } catch (e) {
        console.log('OH NO');
        throw e;
      }
      var dueTuples: Item[] = dueNodes.map(function(x) {
        var dueItem: Item = { name: '', status: -1, data: null };
        var parent = x.parentNode;

        // Get the status. It can be an integer or some NSKeyedArchiver data.
        var statusValueNode = x.nextSibling;
        while (statusValueNode.nodeName == "#text") {
          statusValueNode = statusValueNode.nextSibling;
        }
        if (statusValueNode.nodeName == "integer") {
          dueItem.status = parseInt(statusValueNode.textContent);
        } else if (statusValueNode.nodeName == "dict") {
          dueItem.status = (<HTMLElement>statusValueNode).innerHTML;
        }

        // Get the name. It is the next sibling of the status parent node.
        // Most items should have a name, but there sometimes can be nameless
        // items for some reason.
        var parentNextSibling = parent.nextSibling;
        while (parentNextSibling.nodeName == "#text") {
          parentNextSibling = parentNextSibling.nextSibling;
        }
        if (parentNextSibling.nodeName == "string") {
          dueItem.name = parentNextSibling.textContent;
        } else {
          dueItem.name = '???';
        }

        // Get other info...
        var parentNextDict = parentNextSibling.nextSibling;
        while (parentNextDict.nodeName != "dict") {
          parentNextDict = parentNextDict.nextSibling;
          dueItem.data = [parent, parentNextDict];
        }
        return dueItem;
      });

      return dueTuples;
    })();

    console.log(dueTuples);

    this.items = dueTuples;
  }
}
