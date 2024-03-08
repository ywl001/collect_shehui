import { Component } from '@angular/core';

import { ActivatedRoute, Route, Router } from '@angular/router';
import { Location, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


import { Subscription, forkJoin, mergeMap, take, tap } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';

import { MatDialog } from '@angular/material/dialog';

import { People } from '../../Person';
import { DataService, MessageType } from '../../services/data.service';
import { Person_building, TableName, Work } from '../../app-type';

import { GVar } from '../../global-variables';
import toastr from 'toastr'
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../services/db.service';
import { RoomPersonComponent } from './room-person/room-person.component';
import { AddPeopleComponent } from '../../components/add-people/add-people.component';
import { User } from '../../User';

@Component({
  selector: 'app-person-page',
  standalone: true,
  imports: [MatButtonModule, NgFor, NgIf, MatRadioModule, FormsModule, RoomPersonComponent],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.scss'
})
export class RoomPageComponent {

  persons: People[] = [];

  showPersons: People[] = [];

  hidePersons: People[] = [];

  building_id: number;
  room_number: string;
  hosingName: string = '';
  buildingName: string;

  hidePersonInfo = ''

  residence_types = [
    '自住', '租住', '经商', '其他',
  ]

  residence_type: string = '自住';

  constructor(private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dbService: DbService,
    private location: Location) {

    this.route.params.subscribe(res => {
      const data = JSON.parse(decodeURIComponent(res['room']))
      this.building_id = data.building_id;
      this.buildingName = data.building_number + '号楼'
      this.hosingName = data.hosing_name
      this.room_number = data.room_number
    })
  }

  private sub1: Subscription
  private sub2: Subscription
  ngOnInit() {
    this.getRoomPeoples();
    this.getRoomWorkInfo();

    /**删除房间人员*/
    this.sub2 = this.dataService.deleteBuildingPerson$.subscribe(delPersonId => {
      //视图删除显示人员
      const pindex = this.showPersons.findIndex(p => p.id === delPersonId)
      this.showPersons.splice(pindex, 1);

      //从总人员中也删除该人员
      const pindex2 = this.persons.findIndex(p => p.id === delPersonId)
      this.persons.splice(pindex2, 1);

      //更新房屋状态
      this.insertOrUpdateWork().subscribe(res => {
        toastr.info('更新房屋状态信息')
      });
    })

    /**添加房间人员 */
    this.sub1 = this.dataService.person$.subscribe(p => {
      console.log('收到插入人员到房屋的消息')
      if (this.checkPersonIsExist(p)) {
        //人员已经存在
        toastr.info('人员已经存在')
      } else {
        //插入人员到人员房屋表
        this.insertPeopleToBuilding(p).subscribe(res => {
          console.log(res)
          if (res > 0) {
            p.pb_id = res.insertedId;
            this.persons.push(p);
            this.showPersons.push(p)
            //更新房屋状态
            this.insertOrUpdateWork().subscribe(res => {
              toastr.success('更新房屋状态');
              // this.getRoomPeoples()
            })
          } else {
            toastr.warning('插入人员失败')
          }
        })
      }
    })
  }

  ngOnDestroy() {
    console.log('room page on destory')
    if (this.sub1) this.sub1.unsubscribe();
    if (this.sub2) this.sub2.unsubscribe();
  }

  //获取房间人员
  private getRoomPeoples() {
    this.dbService.getRoomPeoples(this.building_id, this.room_number, User.id).subscribe(res => {
      // console.log('room peoples', res)
      this.persons = res;
      this.showPersons = [];
      this.persons.forEach(p => {
        if (p.user_id == User.id) {
          this.showPersons.push(p)
        }
      })
      this.hidePersonInfo = this.getHidePersonInfo()
    })
  }

  private getHidePersonInfo() {
    this.hidePersons = this.persons.filter(p => !this.showPersons.includes(p));
    let str = '已经录入人员';
    this.hidePersons.forEach(p => {
      str+=this.formatName(p.name)+'，'
    })
    return str.substring(0,str.length-1)
  }

  private formatName(name) {
    var newStr;
    if (name.length === 2) {
      newStr = name.substr(0, 1) + '*';
    } else if (name.length > 2) {
      var char = '';
      for (var i = 0, len = name.length - 2; i < len; i++) {
        char += '*';
      }
      newStr = name.substr(0, 1) + char + name.substr(-1, 1);
    } else {
      newStr = name;
    }
    return newStr;
  }

  //为单选按钮赋值
  private getRoomWorkInfo() {
    console.log(this.building_id, this.room_number)
    this.dbService.getRoomWorkInfo(this.building_id, this.room_number).subscribe(res => {
      // console.log('get room work info', res)
      if (res.length > 0) {
        const workInfo = res[0]
        this.residence_type = workInfo.use_for;
      }
    })
  }

  checkPersonIsExist(p) {
    return this.persons.findIndex(v => v.id == p.id) > -1
  }

  onBack() {
    this.location.back();
  }

  onChange() {
    console.log('on change')
    this.insertOrUpdateWork().subscribe(res => {
      toastr.info('更新房屋信息成功')
    })
  }

  //插入人员到楼栋房间
  private insertPeopleToBuilding(p: People) {
    const tableData: Person_building = {
      building_id: this.building_id,
      room_number: this.room_number,
      person_id: p.id,
      is_host: p.is_host,
      user_id: User.id,
      is_huji: p.is_huji
    }
    console.log('insert person_building', tableData)
    return this.dbService.insert(TableName.person_building, tableData)
  }

  private insertOrUpdateWork() {
    console.log('更新房屋状态信息')
    return this.dbService.getRoomWorkIsExists(this.building_id, this.room_number).pipe(
      mergeMap(id => {
        if (id > 0) {
          return this.updateWork(id)
        } else {
          return this.insertWork()
        }
      })
    )
  }

  private insertWork() {
    let tableData: Work = {
      building_id: this.building_id,
      room_number: this.room_number,
      result_message: this.persons.length + '人',
      result: 1,
      user_id: User.id,
      use_for: this.residence_type
    }
    console.log('插入work table', tableData)
    return this.dbService.insert(TableName.collect_work, tableData)
  }

  private updateWork(id) {
    let tableData: Work = {
      result_message: this.persons.length + '人',
      result: 1,
      user_id: User.id,
      use_for: this.residence_type
    }
    if (tableData.result_message == '0人') {
      tableData.result = 0;
    }
    console.log('更新 work table', tableData)
    return this.dbService.update(TableName.collect_work, tableData, id)
  }

  onAddPeople() {
    this.dialog.open(AddPeopleComponent)
  }

}
