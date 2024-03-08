import { Routes } from '@angular/router';
import { XiaoquPageComponent } from './pages/xiaoqu_page/xiaoqu-page.component';
import { XiaoquListPageComponent } from './pages/xiaoqu-list-page/xiaoqu-list-page.component';
import { BuildingPageComponent } from './pages/building-page/building-page.component';
import { RoomPageComponent } from './pages/room-page/room-page.component';

export const routes: Routes = [
    {path:'xiaoqu_list',component:XiaoquListPageComponent},
    {path:'xiaoqu',component:XiaoquPageComponent},
    {path:'building/:building',component:BuildingPageComponent},
    {path:'room/:room',component:RoomPageComponent},
    { path: '',   redirectTo: '/xiaoqu_list', pathMatch: 'full' },
];
