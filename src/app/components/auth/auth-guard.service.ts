import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, Observer, Subscription } from "rxjs";
import { AuthService } from "./auth.service";


@Injectable()
export class AuthGuardService implements CanActivate {
    subs$: Subscription[] = [];

    constructor(
        public auth: AuthService,
        public router: Router
    ) {}

    canActivate(): Observable<boolean> {
        return new Observable((observer: Observer<boolean>) => {
            const sub$ = this.auth.isAuthenticated().subscribe((isAuthenticated: boolean) => {
                if (!isAuthenticated) {
                    this.router.navigate(['login']);
                }
                observer.next(isAuthenticated);
            });
            this.subs$.push(sub$);
        });
    }

    ngOnDestroy() {
        this.subs$.forEach(sub$ => {
            if (!sub$.closed) {
                sub$.unsubscribe();
            }
        });
    }
}
