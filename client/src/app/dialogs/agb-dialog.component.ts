import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agb-dialog',
  standalone: true,
  template: `
    <div style="padding: 1rem;">
      <h2>Allgemeine Geschäftsbedingungen (AGB)</h2>
      <p><strong>für MiniTwitter (Stand: April 2025)</strong></p>

      <h3>1. Geltungsbereich</h3>
      <p>Diese AGB gelten für die Nutzung der Webanwendung <strong>MiniTwitter</strong>, die es registrierten Nutzern ermöglicht, kurze Textnachrichten (sog. „Posts“) zu veröffentlichen, zu kommentieren und zu bewerten.</p>

      <h3>2. Registrierung und Nutzerkonto</h3>
      <ul>
        <li>Die Nutzung von MiniTwitter erfordert eine Registrierung.</li>
        <li>Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen.</li>
        <li>Jeder Nutzer ist für die Sicherheit seiner Zugangsdaten selbst verantwortlich.</li>
      </ul>

      <h3>3. Inhalte und Verhalten</h3>
      <ul>
        <li>Nutzer dürfen keine Inhalte posten, die gegen geltendes Recht oder die guten Sitten verstoßen.</li>
        <li>Beleidigungen, Hassrede, Spam oder diskriminierende Inhalte sind untersagt.</li>
        <li>MiniTwitter behält sich das Recht vor, Inhalte ohne Vorankündigung zu löschen.</li>
      </ul>

      <h3>4. Nutzungsrechte</h3>
      <p>Der Nutzer räumt MiniTwitter das Recht ein, veröffentlichte Inhalte im Rahmen der Plattform darzustellen. Es erfolgt keine kommerzielle Verwertung durch MiniTwitter.</p>

      <h3>5. Datenschutz</h3>
      <p>Persönliche Daten werden vertraulich behandelt und nur im Rahmen der Funktionalität der Anwendung gespeichert und verarbeitet. Eine Weitergabe an Dritte erfolgt nicht.</p>

      <h3>6. Verfügbarkeit & Änderungen</h3>
      <ul>
        <li>MiniTwitter wird als Test- und Lernplattform ohne Garantie auf Verfügbarkeit betrieben.</li>
        <li>Die Betreiber behalten sich vor, Inhalte, Funktionen oder AGB jederzeit anzupassen.</li>
      </ul>

      <h3>7. Haftung</h3>
      <p>Die Nutzung erfolgt auf eigene Gefahr. Für Datenverluste oder Schäden übernimmt MiniTwitter keine Haftung.</p>

      <h3>8. Schlussbestimmungen</h3>
      <ul>
        <li>Es gilt das Recht des Sitzes der Betreiber (z. B. Deutschland oder Schweiz).</li>
        <li>Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</li>
      </ul>

      <p><em>💻 Diese Plattform dient ausschließlich zu Demonstrations- und Lernzwecken.</em></p>

      <div style="text-align: right; margin-top: 1rem;">
        <button mat-button mat-dialog-close>Schließen</button>
      </div>
    </div>
  `,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class AgbDialogComponent {}
