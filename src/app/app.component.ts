import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AssemblerService } from './assembler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'assembler';
  form: FormGroup;
  fileInput: FormControl;
  textInput: FormControl;
  output: FormControl;
  files;

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef, private assemblerService: AssemblerService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.fileInput = new FormControl();
    this.textInput = new FormControl();
    this.output = new FormControl();
    this.form = this.fb.group({
      fileInput: this.fileInput,
      textInput: this.textInput,
      output: this.output
    });
  }

  assemble() {
    const machineCode = this.assemblerService.assemble(this.textInput.value);
    this.output.patchValue(machineCode);
  }

  onFileChange(e) {
    const reader = new FileReader();

    if (e.target.files && e.target.files.length) {
      const [file] = e.target.files;
      reader.readAsText(file);

      reader.onload = () => {
        this.textInput.patchValue(reader.result);
      };

        // need to run CD since file load runs outside of zone
        this.cdr.markForCheck();
    }

    console.log(this.files);
  }
}
