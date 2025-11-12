import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { LoadingOverlayComponent } from './shared/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Revisamos si el usuario está loggeado
    if(this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']); // si está loggeado, al dashboard
    } else {
      this.router.navigate(['/login']); // si no, al login
    }
  }
}
