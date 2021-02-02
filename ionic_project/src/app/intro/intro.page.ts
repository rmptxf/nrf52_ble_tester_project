import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
  
const isLogEnabled = true;

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage  {

    constructor(private diagnostic: Diagnostic,
                private nativeStorage : NativeStorage,
                public  navCtrl: NavController,        
                private toastCtrl: ToastController
            ) { }

  exitIntro() 
  {
    this.diagnostic.requestLocationAuthorization().then(
      ()=>
      {
        if(isLogEnabled) console.info('Location authorisation was requested!');

        if(isLogEnabled) console.log('Bluetooth is enabled.'); 
        if(isLogEnabled) console.info('Checking Location authorization ...');
        
        this.diagnostic.getLocationAuthorizationStatus().then( 
          (state) => 
          {
            if (state == this.diagnostic.permissionStatus.GRANTED)
            {
              if(isLogEnabled) console.log('Location permission was granted.');
              if(isLogEnabled) console.info('Checking Location status ...');

              if(isLogEnabled) console.info('Location authorisation was granted!');
              this.nativeStorage.setItem('intro-done', true).then(
                () => 
                {
                  if(isLogEnabled) console.info('intro done!')
                  if(isLogEnabled) console.info('Navigating to scanner page.')
                  this.navCtrl.navigateForward('scanner');
                },
                (error) => {
                  if(isLogEnabled) console.error("Error setting the (intro-done) variable to true.", error);
                });
            } else 
              {
                if(isLogEnabled) console.error('Location authorisation was Not granted.');
                this.showToast("Please grant the location access!", "light", 2000, "bottom");
              }
        }).catch(e => { if(isLogEnabled)  console.error(e) });
      },
      (error)=>
      {
        if(isLogEnabled) console.error('Error requesting the Location authorisation!', error);
      });
  }

  // show toast
  async showToast(msg, clr, dur, pos) 
  {
    let toast = await this.toastCtrl.create({
        message: msg,
        color: clr,
        duration: dur,
        position: pos,
        cssClass :'toast'
    });
    toast.present();
  }            
}
