'use babel';

import ShowOrigin from './show-origin';
import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate() {
    let disposables = atom.commands.add(
      'atom-workspace', { 'show-origin:show': this.showOrigin }
    );

    this.subscriptions = new CompositeDisposable(disposables);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  showOrigin() {
    let origin = new ShowOrigin();
    origin.show();
  }
};
