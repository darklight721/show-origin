'use babel';

import { execSync } from 'child_process';

function getFirstWord(text) {
  if (!text) return;
  return text.substr(0, text.indexOf(' '));
}

export default class {
  constructor() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.projectPath = atom.project.getPaths()[0];
  }

  show() {
    let blameResult = this.blameCurrentLine();
    if (!blameResult) return;

    let sha1 = getFirstWord(blameResult);
    let originResult = this.getOrigin(sha1);
    if (!originResult) return;

    this.display(originResult);
  }

  blameCurrentLine() {
    if (!this.editor) return;

    let filePath = this.editor.getPath();
    let { row } = this.editor.getCursorBufferPosition();
    if (!filePath || !row) return;

    let command = `git blame ${filePath} -L ${row+1},${row+1} --root`;
    return this.tryExec(command);
  }

  getOrigin(sha1) {
    if (!sha1) return;

    let command = `git show ${sha1}`;
    return this.tryExec(command);
  }

  display(result) {
    if (!this.editor) return;

    let fileName = this.editor.getTitle();
    let { row } = this.editor.getCursorBufferPosition();
    let resultFileName = `Origin of ${fileName}:${row+1}`;

    atom.workspace.open(resultFileName).then(editor => editor.setText(result));
  }

  tryExec(command) {
    if (!this.projectPath) return;

    let opts = { cwd: this.projectPath, encoding: 'utf8' };

    try       { return execSync(command, opts); }
    catch (e) { console.log(e); }
  }
};
