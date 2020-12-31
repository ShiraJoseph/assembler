import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import {fs} from 'node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'assembler';
  form: FormGroup;
  fileInput: FormControl;
  textInput: FormControl;
  output: FormControl;
  files;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.fileInput = new FormControl();
    this.textInput = new FormControl();
    this.output = new FormControl();
    this.form = this.fb.group({
      fileInput: this.fileInput,
      textInput: this.textInput,
      output: this.output
    });
  }

  // It may be unreadable, but it makes me happy :)
  assemble() {
    let counter = 16;
    const c = [];
    const cMap = {
      '0': '0101010', '1': '0111111', '-1': '0111010', 'D': '0001100', 'A': '0110000', 'M': '1110000', '!D': '0001101',
      '!A': '0110001', '!M': '1110001', '-D': '0001111', '-A': '0110011', '-M': '1110011', 'D+1': '0011111', 'A+1': '0110111',
      'M+1': '1110111', 'D-1': '0001110', 'A-1': '0110010', 'M-1': '1110010', 'D+A': '0000010', 'D+M': '1000010', 'D-A': '0010011',
      'D-M': '1010011', 'A-D': '0000111', 'M-D': '1000111', 'D&A': '0000000', 'D&M': '1000000', 'D|A': '0010101', 'D|M': '1010101'
    };
    const dMap = {'': '000', 'M': '001', 'D': '010', 'MD': '011', 'A': '100', 'AM': '101', 'AD': '110', 'AMD': '111'};
    const jMap = {'': '000', 'JGT': '001', 'JEQ': '010', 'JGE': '011', 'JLT': '100', 'JNE': '101', 'JLE': '110', 'JMP': '111'};
    const ls = [{k: 'SP', v: 0}, {k: 'LCL', v: 1}, {k: 'ARG', v: 2}, {k: 'THIS', v: 3}, {k: 'THAT', v: 4}, {k: 'SCREEN', v: 16384},
      {k: 'KBD', v: 24576}, ...(Array.from({length: 16}, (v, k) => k).map(n => ({k: `R${ n }`, v: n})))];
    this.textInput.value.split('\n').map(s => s.slice(0, s.includes('/') ? s.indexOf('/') : s.length).trim()).filter(s => s)
      .forEach(s => {
        if (s.startsWith('(')) {
          ls.push({k: s.replace(/[()]/g, ''), v: c.length});
        } else {
          c.push(s);
        }
      });
    this.output.patchValue(c.map(s => {
        if (this.isV(s) && !this.val(ls, s)) {
          ls.push({k: s.slice(1), v: counter});
          counter++;
        }
        return s;
      }).map(s => this.isV(s) ? `@${ this.val(ls, s).v }` : s).map(s => s.startsWith('@') ? (+(s.slice(1))).toString(2).padStart(16, '0') :
      `111${ cMap[s.slice(s.includes('=') ? s.indexOf('=') + 1 : 0, s.includes(';') ? s.indexOf(';') : s.length)] }${ dMap[s.slice(0,
        s.includes('=') ? s.indexOf('=') : 0)] }${ jMap[s.slice(s.includes(';') ? s.indexOf(';') + 1 : s.length)] }`).join('\n'));
  }

  isV(s) {
    return s.startsWith('@') && (/[\D]/).test(s.slice(1));
  }

  val(ls, s) {
    return ls.find(v => s.slice(1) === v.k);
  }

  onFileChange(e) {
    const reader = new FileReader();
    if (e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      reader.readAsText(file);
      reader.onload = () => {
        this.textInput.patchValue(reader.result);
      };
      this.cdr.markForCheck();
    }
  }

  onDownload() {
    const data = this.output.value;

    FileReader.writeFile('Output.txt', data, (err) => {

      if (err) {
        throw err;
      }
    });
  }
}
