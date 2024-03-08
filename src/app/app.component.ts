import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import moment from 'moment';
import { User } from './User';
import { LocalStorgeService } from './services/local-storge.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '孟津实有人口采集';

  finger:any;

  constructor(private local:LocalStorgeService){}

  ngOnInit(){
    
    let user_id = this.local.get('user_id')
    if(!user_id){
      user_id = new Date().getTime()+'';
      this.local.set('user_id',user_id)
      User.id = parseInt(user_id);
    }else{
      User.id = parseInt(user_id)
    }

    console.log(User.id)
  }
}
