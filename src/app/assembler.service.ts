import { Injectable } from '@angular/core';

class Instruction {
}

@Injectable({
  providedIn: 'root'
})
export class AssemblerService {
  assemblyCode: string[];
  instructions: Instruction[];
  machineCode: string;

  constructor() {}

  assemble(blob) {
    this.assemblyCode = this.removeComments(blob.split('\n'));
    this.machineCode = this.assemblyCode.join('\n');
    return this.machineCode;
  }

  private removeComments(arr: string[]) {
    return arr.map((line: string) => {
      return line.slice(0, line.indexOf('/') > -1 ? line.indexOf('/') : line.length).trim();
    }).filter(line => line);
  }
}
