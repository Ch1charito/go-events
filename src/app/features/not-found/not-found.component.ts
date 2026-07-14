import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="not-found">
      <h1>404</h1>
      <p>Diese Seite gibt es nicht.</p>
      <a routerLink="/">Zurück zum Feed</a>
    </section>
  `,
  styles: `
    @use 'variables' as v;

    .not-found {
      min-height: 60dvh;
      display: grid;
      place-content: center;
      text-align: center;
      gap: 8px;

      h1 {
        font-size: 48px;
        font-weight: 800;
        color: v.$accent;
      }

      p {
        color: v.$text-secondary;
      }
    }
  `,
})
export class NotFoundComponent {}
