import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssemblerService {
  assemblyCode: string[];
  instructions: string[];
  labels: { key, value }[];
  variables: { key, value }[];
  machineCode: string;

  assemble(blob) {
    this.refineAssemblyCode(blob);
    this.translate();
    return this.machineCode;
  }

  private refineAssemblyCode(blob) {
    this.assemblyCode = blob.split('\n');
    this.removeComments();
    this.parseLabels();
    this.parseSymbols();
    this.parseVariables();
  }

  private removeComments() {
    this.assemblyCode = this.assemblyCode.map((line: string) => {
      return line.slice(0, line.indexOf('/') > -1 ? line.indexOf('/') : line.length).trim();
    }).filter(line => line);
  }

  private parseLabels() {
    this.collectLabels();
    this.instructions = this.instructions.map(line => {
      if (line.startsWith('@')) {
        const reference = this.labels.find(label => line.slice(1) === label.key);
        if (reference) {
          return `@${ reference.value }`;
        }
      }
      return line;
    });
  }

  private collectLabels() {
    this.labels = [];
    this.instructions = [];
    this.assemblyCode.forEach(line => {
      if (line.startsWith('(')) {
        this.labels.push({key: line.replace(/[()]/g, ''), value: this.instructions.length});
      } else {
        this.instructions.push(line);
      }
    });
  }

  private parseSymbols() {
    this.instructions = this.instructions.map(instruction => {
      if (instruction.match(/[@][a-zA-Z]+/g)) {
        if (instruction.slice(1).match(/[R][0-15]/g)) {
          return `@${ instruction.slice(2) }`;
        }
        switch (instruction.slice(1)) {
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
        }
      }
      return instruction;
    });
  }

  private parseVariables() {
    this.variables = [];
    this.instructions = this.instructions.map((instruction) => {
      if (instruction.match(/[@][a-zA-Z]+/g)) {
        const variable = this.variables.find(v => instruction.slice(1) === v.key);
        if (variable) {
          return `@${ variable.value }`;
        }
        this.variables.push({key: instruction.slice(1), value: this.variables.length + 16});
        return `@${ this.variables[this.variables.length - 1].value }`;
      }
      return instruction;
    });
  }

  private translate() {
    this.machineCode = this.instructions.map(instruction => {
      instruction.replace(' ', '');
      if (instruction.startsWith('@')) {
        return this.translateAInstruction(instruction.slice(1));
      }
      return this.translateCInstruction(instruction);
    }).join('\n');
  }

  private translateAInstruction(instruction) {
    if (!instruction.match(/\d+/gm)) {
      return 'error - ' + instruction;
    }
    return (+instruction).toString(2).padStart(16, '0');
  }

  private translateCInstruction(instruction: string) {
    let jump;
    let comp;
    let dest;
    if (instruction.includes(';')) {
      jump = instruction.slice(instruction.indexOf(';') + 1);
      instruction = instruction.slice(0, instruction.indexOf(';'));
    } else {
      jump = '';
    }
    if (instruction.includes('=')) {
      dest = instruction.slice(0, instruction.indexOf('='));
      instruction = instruction.slice(instruction.indexOf('=') + 1);
    } else {
      dest = '';
    }
    comp = instruction;
    return `111${ this.translateComp(comp) }${ this.translateDest(dest) }${ this.translateJump(jump) }`;
  }

  private translateComp(comp: any) {
    switch (comp) {
      case '0':
        return '0101010';
      case '1':
        return '0111111';
      case '-1':
        return '0111010';
      case 'D':
        return '0001100';
      case 'A':
        return '0110000';
      case 'M':
        return '1110000';
      case '!D':
        return '0001101';
      case '!A':
        return '0110001';
      case '!M':
        return '1110001';
      case '-D':
        return '0001111';
      case '-A':
        return '0110011';
      case '-M':
        return '1110011';
      case 'D+1':
        return '0011111';
      case 'A+1':
        return '0110111';
      case 'M+1':
        return '1110111';
      case 'D-1':
        return '0001110';
      case 'A-1':
        return '0110010';
      case 'M-1':
        return '1110010';
      case 'D+A':
        return '0000010';
      case 'D+M':
        return '1000010';
      case 'D-A':
        return '0010011';
      case 'D-M':
        return '1010011';
      case 'A-D':
        return '0000111';
      case 'M-D':
        return '1000111';
      case 'D&A':
        return '0000000';
      case 'D&M':
        return '1000000';
      case 'D|A':
        return '0010101';
      case 'D|M':
        return '1010101';
    }
  }

  private translateDest(dest: any) {
    switch (dest) {
      case '':
        return '000';
      case 'M':
        return '001';
      case 'D':
        return '010';
      case 'MD':
        return '011';
      case 'A':
        return '100';
      case 'AM':
        return '101';
      case 'AD':
        return '110';
      case 'AMD':
        return '111';
    }
  }

  private translateJump(jump: any) {
    switch (jump) {
      case '':
        return '000';
      case 'JGT':
        return '001';
      case 'JEQ':
        return '010';
      case 'JGE':
        return '011';
      case 'JLT':
        return '100';
      case 'JNE':
        return '101';
      case 'JLE':
        return '110';
      case 'JMP':
        return '111';
    }
  }
}
