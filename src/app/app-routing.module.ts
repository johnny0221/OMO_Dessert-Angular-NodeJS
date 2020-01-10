import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SliderComponent } from './landing/slider.component';
const routes: Routes = [
  { path: '', component: SliderComponent, pathMatch: 'full' },
  { path: 'chinese', loadChildren: './MainPage/main.module#MainPageModule', data: { depth: 1 } },
  { path: 'about', loadChildren: './AboutPage/about.module#AboutModule', data: { depth: 2 } },
  { path: 'product', loadChildren: './Product/product.module#ProductModule', data: { depth: 2 } },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule', data: { depth: 2 } },
  { path: 'cart', loadChildren: './ShoppingCartPage/shopping-cart.module#ShoppingCartModule', data: { depth: 2 } },
  { path: 'contact', loadChildren: './ContactPage/contact.module#ContactModule', data: { depth: 2 } },
  { path: 'forget', loadChildren: './PasswordResetPage/PasswordReset.module#PasswordResetModule', data: { depth: 3 } },
  { path: 'activity', loadChildren: './activity/activity.module#ActivityModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
