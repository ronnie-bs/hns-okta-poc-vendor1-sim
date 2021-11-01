import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { AuthGuardService as AuthGuard } from './components/auth/auth-guard.service';
import { LoginCallbackComponent } from './components/auth/login-callback.component';
import { LoginComponent } from './components/auth/login.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
    {  path: "login/callback", component: LoginCallbackComponent },
    {  path: "login", component: LoginComponent },
    {  path: "home", component: HomeComponent, canActivate: [AuthGuard] },
    {  path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
    {  path: "about", component: AboutComponent, canActivate: [AuthGuard] },
    {  path: "", redirectTo: "/home", pathMatch: "full" }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
