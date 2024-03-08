import { Component, Input } from '@angular/core';
import toastr from 'toastr';
import { People } from '../../Person';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import IDValidator from 'id-validator'
import { DbService } from '../../services/db.service';
import { TableName } from '../../app-type';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import moment from 'moment';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-add-people',
  standalone: true,
  imports: [MatFormFieldModule, FormsModule, NgIf, MatCheckboxModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './add-people.component.html',
  styleUrls: ['./add-people.component.scss']
})
export class AddPeopleComponent {
  pName: string = '';

  tel: string = '';
  work_place: string = '';

  is_host: boolean = false;
  is_huji: boolean = true;


  private _pid: string = '';
  public get pid(): string {
    return this._pid;
  }
  public set pid(value: string) {
    this._pid = value;
  }

  constructor(private dialogRef: MatDialogRef<AddPeopleComponent>,
    private dataService: DataService,
    private deService: DbService) { }


  private sub1:Subscription
  private sub2:Subscription
  private sub3:Subscription

  onSubmit() {
    if (this.validate()) {
      // 1 判断人员是否在库
      this.sub3 = this.checkPersonIsExists(this.pid).pipe(take(1))
      .subscribe(res => {
        //人员已经在库
        if (res.length > 0) {
          console.log('people is already exist')
          let p: People = res[0];
          p.is_host = this.is_host ? 1 : 0;
          p.is_huji = this.is_huji ? 1 : 0

          let data: any = {}
          if (!this.isEmpty(this.tel) && this.isValidPhoneNumber(this.tel)) {
            if (p.telephone.indexOf(this.tel) == -1) {
              data.tel = this.tel;
            }
          }
          if (!this.isEmpty(this.work_place) && this.work_place != p.work_place) {
            data.work_place = this.work_place
          }
          p.telephone = this.tel;
          p.work_place = this.work_place;
          p.name = this.pName;

          //如果工作单位或电话有更新
          if (Object.keys(data).length > 0) {
            console.log('update people info', data)
            this.sub1 = this.updatePerson(data, p.id).pipe(take(1))
            .subscribe(res => {
              console.log('update people send message')
              this.dataService.person(p)
              this.dialogRef.close();
            })
          } else {
            console.log('no update people send message',p)
            this.dataService.person(p)
            this.dialogRef.close();
          }
        } else {
          //新插入人员
          console.log('insert new people')
          let data = this.getData()
          this.sub2 = this.deService.insert(TableName.people, data).pipe(take(1))
          .subscribe(res => {
            //插入新人员
            data.id = res;
            data.is_host = this.is_host ? 1 : 0;
            data.is_huji = this.is_huji ? 1 : 0
            console.log('insert new people send message')
            this.dataService.person(data)
            this.dialogRef.close();
          })
        }
      })
    }
  }

  ngOnDestroy() {
    console.log('add people ng on destroy')
    if (this.sub1) {
      this.sub1.unsubscribe();
    }

    if (this.sub2) {
      this.sub2.unsubscribe();
    }

    if (this.sub3) {
      this.sub3.unsubscribe();
    }
  }

  private checkPersonIsExists(pid: string) {
    return this.deService.getPeople({ inputType: 1, input: pid })
  }

  private updatePerson(data: any, id: number) {
    return this.deService.update(TableName.people, data, id)
  }

  private getUpdateData() {
    let data: any = {}
    if (!this.isEmpty(this.tel) && this.isValidPhoneNumber(this.tel)) {
      data.telephone = this.tel
    }
    if (this.isEmpty(this.work_place)) {
      data.work_place = this.work_place
    }
    if (Object.keys(data).length == 0)
      return null;
    return data;
  }

  private isEmpty(str: string) {
    // console.log(str)
    return str === null || str === undefined || str.trim() === '';
  }

  private isValidPhoneNumber(phoneNumber: string) {
    // 中国大陆地区手机号正则表达式
    var regex = /^1[3456789]\d{9}$/;
    return regex.test(phoneNumber);
  }

  onCancel() {
    this.dialogRef.close();
  }

  private getSex() {
    return Number(this.pid.substring(16, 17)) % 2 == 0 ? '女' : '男';
  }

  private validate() {
    if (!People.isChinese(this.pName)) {
      toastr.info('姓名应该是中文字符')
      return false;
    }
    if (this.pName?.length < 2) {
      toastr.info('姓名需要两个字以上')
      return false;
    }

    const validator = new IDValidator();
    if (!validator.isValid(this.pid)) {
      toastr.warning('身份证号输入有误');
      return false;
    }
    return true;
  }

  private getData() {
    let data: any = {
      name: this.pName,
      pid: this.pid,
      sex: this.getSex(),
      work_place: this.work_place,
      birthday: this.getBirthday(this.pid)
    };
    if (!this.isEmpty(this.tel)) {
      data.telephone = this.tel;
    }
    return data;
  }

  private getBirthday(pid: string) {
    return moment(pid.substring(6, 14)).format('yyyy-MM-DD')
  }
}
