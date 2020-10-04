import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssemblerService {
  assemblyCode: string[];
  instructions: string[];
  machineCode: string;

  constructor() {
  }

  assemble(blob) {
    this.assemblyCode = this.removeComments(blob.split('\n'));
    this.parseLabels();
    this.parseSymbols();
    this.machineCode = this.instructions.join('\n');
    return this.machineCode;
  }

  private removeComments(arr: string[]) {
    return arr.map((line: string) => {
      return line.slice(0, line.indexOf('/') > -1 ? line.indexOf('/') : line.length).trim();
    }).filter(line => line);
  }

  private parseLabels() {
    const symbols = [];
    const code = [];
    this.assemblyCode.forEach(line => {
      if (line.startsWith('(')) {
        symbols.push({label: line.replace(/[()]/g, ''), value: code.length});
      } else {
        code.push(line);
      }
    });
    this.instructions = code.map(line => {
      if (line.startsWith('@')) {
        const reference = symbols.find(symbol => line.slice(1) === symbol.label);
        if (reference) {
          return `@${ reference.value }`;
        }
      }
      return line;
    });
  }

  private parseSymbols() {
    this.instructions = this.instructions.map(instruction => {
      if (instruction.match(/[@][a-bA-B]/g)) {
        switch (instruction.slice(1)) {
          case 'R0':
          case 'R1':
          case 'R2':
          case 'R3':
          case 'R4':
          case 'R5':
          case 'R6':
          case 'R7':
          case 'R8':
          case 'R9':
          case 'R10':
          case 'R11':
          case 'R12':
          case 'R13':
          case 'R14':
          case 'R15':
            // this can't be right, can it? Need to look up exact values, since then you would have SP being the same address as R0...
            return `@${ instruction.slice(2) }`;
          case 'SP':
            return '@0';
          case  'LCL':
            return '@1';
          case  'ARG':
            return '@2';
          case  'THIS':
            return '@3';
          case  'THAT':
            return '@4';
          case 'SCREEN':
            return '@16384';
          case 'KBD':
            return '@24576';
          default:
            return this.parseVariable(instruction.slice(1));
        }
      }
    });
  }

  private parseVariable(s: string) {
    return undefined;
  }
}
