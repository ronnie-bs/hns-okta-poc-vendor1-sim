import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
    selector: 'login',
    template: ''
})
export class LoginComponent implements OnInit {
    constructor (
        private authSvc: AuthService
    ) {}

    async ngOnInit() {
        await this.authSvc.redirectToAuthUrl();
    }
}

