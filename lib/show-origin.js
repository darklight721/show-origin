'use babel';

import { execSync } from 'child_process';

function getFirstWord(string) {
  return string.substr(0, string.indexOf(' '));
}

// taken from MDN
function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default class {
  constructor() {
    this.projectPath = atom.project.getPaths()[0];
    this.editor = atom.workspace.getActiveTextEditor();
    if (!this.editor) return;

    this.title = this.editor.getTitle();
    this.path = this.editor.getPath();

    let position = this.editor.getCursorBufferPosition();
    if (!position) return;

    this.row = position.row + 1;
    this.line = this.editor.lineTextForBufferRow(position.row);
  }

  show() {
    let blameResult = this.blameCurrentLine();
    if (!blameResult) return;

    let sha1 = getFirstWord(blameResult);
    let originResult = this.getOrigin(sha1);
    if (!originResult) return;

    let resultPromise = this.openResultEditor();
    if (!resultPromise) return;

    resultPromise.then(editor => {
      editor.setText(originResult);
      this.highlightLine(editor);
    });
  }

  blameCurrentLine() {
    if (!this.path || !this.row) return;

    let command = `git blame ${this.path} -L ${this.row},${this.row} --root`;
    return this.tryExec(command);
  }

  getOrigin(sha1) {
    if (!sha1) return;

    let command = `git show ${sha1}`;
    return this.tryExec(command);
  }

  openResultEditor() {
    if (!this.title || !this.row) return;

    let resultFileName = `Origin of ${this.title}:${this.row}`;
    return atom.workspace.open(resultFileName);
  }

  highlightLine(editor) {
    if (!this.title || !this.line) return;

    let title = escapeRegExp(this.title);
    let line = escapeRegExp(this.line.trim());
    let term = String.raw`^diff --git a\/${title}[\s\S]*?\+\s*?${line}`;
    let scanRx = new RegExp(term, 'm');

    editor.scan(scanRx, ({ range }) => {
      editor.setCursorBufferPosition(range.end);
      editor.selectToBeginningOfLine();
    });
  }

  tryExec(command) {
    if (!this.projectPath) return;

    let opts = { cwd: this.projectPath, encoding: 'utf8' };

    try       { return execSync(command, opts); }
    catch (e) { console.log(e); }
  }
};
