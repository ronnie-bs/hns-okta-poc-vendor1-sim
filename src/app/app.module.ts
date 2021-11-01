import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { AuthGuardService } from './components/auth/auth-guard.service';
import { AuthService } from './components/auth/auth.service';
import { LoginCallbackComponent } from './components/auth/login-callback.component';
import { LoginComponent } from './components/auth/login.component';
import { HomeComponent } from './components/home/home.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
    declarations: [
        AppComponent,
        NavigationComponent,
        HomeComponent,
        ProfileComponent,
        AboutComponent,
        LoginComponent,
        LoginCallbackComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        AuthService,
        AuthGuardService,
    ],
    entryComponents: [
        NavigationComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
