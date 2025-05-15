import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar'
import { MatAnchor, MatButton } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { AgbDialogComponent } from '../dialogs/agb-dialog.component'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [MatToolbar, MatAnchor, RouterLink, MatButton],
  styleUrls: ['./footer.component.html'],
})
export class FooterComponent {
  constructor(private dialog: MatDialog) {}

  openAgbDialog() {
    this.dialog.open(AgbDialogComponent, {
      width: '600px',
      maxHeight: '80vh',
    })
  }
}
