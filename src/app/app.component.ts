import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionUtils } from 'src/app/common/utils/session-utils';
import { AuthService } from './components/auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    user: string = "";
    subs$: Subscription[] = [];
    
    public isAuthenticated = false;

    constructor(
        private auth: AuthService
    ) {}

    ngOnInit() {
        const sub$ = this.auth.isAuthenticated().subscribe((isAuthenticated: boolean) => {
            if (isAuthenticated) {
                this.isAuthenticated = isAuthenticated;
                const sessionInfo = SessionUtils.getSessionInfo();
                if (sessionInfo) {
                    this.user = sessionInfo.user || "";
                }
            }
        });
        this.subs$.push(sub$);
    }

    ngOnDestroy() {
        this.subs$.forEach(sub$ => {
            if (!sub$.closed) {
                sub$.unsubscribe();
            }
        });
    }
}
