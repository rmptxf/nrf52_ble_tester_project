import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ToastController} from '@ionic/angular';
import { ActivatedRoute} from "@angular/router";
import { Platform } from '@ionic/angular'; 
import { BLE } from '@ionic-native/ble/ngx';

const CUSTOM_SERVICE_UUID       = '00001000-1112-1314-1516-171819202122';
const BUTTONS_STATES_CHAR_UUID  = '00001001-1112-1314-1516-171819202122';
const POTENTIO_LEVEL_CHAR_UUID  = '00001002-1112-1314-1516-171819202122';
const LEDS_STATES_CHAR_UUID     = '00001003-1112-1314-1516-171819202122';

const BATTERY_SERVICE_UUID      = '180F';
const BATTERY_LEVEL_CHAR_UUID   = '2A19';

const isLogEnabled = true

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage  {

  connectedDevice : any = {}; 

  button1State : number = 0;
  button2State : number = 0;
  button3State : number = 0;
  button4State : number = 0;

  led3IsOn : boolean = false;
  led4IsOn : boolean = false;

  potentioLevel : number = 0;
  batteryLevel : number = 0;

  constructor(  private ble: BLE,
                public  navCtrl: NavController,  
                private route: ActivatedRoute, 
                private alertCtrl: AlertController,      
                private toastCtrl: ToastController,
                public  platform: Platform,
                private ngZone: NgZone ) 
                {
                  this.route.queryParams.subscribe(params => {
                    let device = JSON.parse(params['device']);
    
                    if(isLogEnabled) console.log('Route navigationExtra: device = '+JSON.stringify(device)); 
    
                    this.ble.isConnected(device.id).then(
                      () => this.onConnected(device),
                      () => this.onNotConnected(device)
                    );  
                  });
                }

  // on connected to a device
  onConnected(device)
  {
    this.ngZone.run(() => { 

      this.connectedDevice = device;

      this.readButtonsStates();
      this.readLedsStates();
      this.readPotentioLevel();
      this.readBatteryLevel();

      this.startBleNotificationsOnButtonChar();
      this.startBleNotificationsOnPotentioChar();
      this.startBleNotificationsOnBatteryChar();
      
    });
  } 

  // on not connected to a device
  onNotConnected(device)
  {
    this.ble.connect(device.id).subscribe(
      () => this.onConnected(device),
      () => this.onErrorConneted(device) 
    );
  }  

  // on error connected
  onErrorConneted(device)
  {
    if(isLogEnabled) console.error('Error connecting to '+device.name+'.');
    this.showToast('Error connecting to '+device.name,'danger',2000,'bottom');
   
    if(isLogEnabled) console.info('navigating back to [scanner] page.');
    this.navCtrl.navigateBack('scanner');
  }

  // read the buttons states on the BLE buttons states characteristic
  readButtonsStates()
  {
    if(isLogEnabled) console.log('Reading the buttons states from the BLE buttons states characteristic ...');        
    this.ble.read(this.connectedDevice.id, CUSTOM_SERVICE_UUID, BUTTONS_STATES_CHAR_UUID).then(
      buffer => {           
      var data = new Uint8Array(buffer); 
      if(isLogEnabled) console.log('Data read from the buttons states characteristic : '+ data);

      this.ngZone.run(() => { 
        this.button1State = data[0];
        this.button2State = data[1];
        this.button3State = data[2];
        this.button4State = data[3];
        });
      },
      error => { if(isLogEnabled) console.error('Error reading the buttons states from the BLE buttons states characteristic.', error);}
    ); 
  } 
 // read the leds states on the BLE leds states characteristic
 readLedsStates()
 {
   if(isLogEnabled) console.log('Reading the leds states from the BLE leds states characteristic ...');   
   this.ble.read(this.connectedDevice.id, CUSTOM_SERVICE_UUID, LEDS_STATES_CHAR_UUID).then(
     buffer => {           
     var data = new Uint8Array(buffer); 
     if(isLogEnabled) console.log('Data read from the leds states characteristic : '+ data);

     this.ngZone.run(() => { 
       this.led3IsOn = data[0] === 0 ? false : true;
       this.led4IsOn = data[1] === 0 ? false : true;
       });
     },
     error => { if(isLogEnabled)console.error('Error reading the leds states from the BLE leds states characteristic.', error); }
   );
 }

  // read the potentio level on the BLE potentio level characteristic
  readPotentioLevel()
  {
    if(isLogEnabled) console.log('Reading the potentio level from the BLE potentio level characteristic ...');     
    this.ble.read(this.connectedDevice.id, CUSTOM_SERVICE_UUID, POTENTIO_LEVEL_CHAR_UUID).then(
      buffer => {           
      var data = new Uint8Array(buffer); 
      if(isLogEnabled) console.log('Data read from the potentio level characteristic : '+ data);

      this.ngZone.run(() => { 
        this.potentioLevel = data[0];
        });
      },
      error => { if(isLogEnabled)console.error('Error reading the potentio level from the BLE potentio level characteristic.', error);}
    ); 
  }

  // read the battery level on the BLE battery level characteristic
  readBatteryLevel()
  {
    if(isLogEnabled) console.log('Reading the battery level from the BLE battery level characteristic ...');     
    this.ble.read(this.connectedDevice.id, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR_UUID).then(
      buffer => {           
      var data = new Uint8Array(buffer); 
      if(isLogEnabled) console.log('Data read from the battery level characteristic : '+ data);

      this.ngZone.run(() => { 
        this.batteryLevel = data[0];
        });
      },
      error => { if(isLogEnabled) console.error('Error reading the battery level from the BLE battery level characteristic.', error); }
    ); 
  }

  // start notifications on custom service buttons characteristic
  startBleNotificationsOnButtonChar()
  {
    if(isLogEnabled) console.log('starting BLE Notifications on the buttons characteristic.');        
    this.ble.startNotification(this.connectedDevice.id, CUSTOM_SERVICE_UUID, BUTTONS_STATES_CHAR_UUID).subscribe(
      buffer => {           
      var data = new Uint8Array(buffer[0]); 
      if(isLogEnabled) console.log('data received in the buttons characteristic : '+ data);

      this.ngZone.run(() => { 
        this.button1State = data[0];
        this.button2State = data[1];
        this.button3State = data[2];
        this.button4State = data[3];
        });
      },
      error => { if(isLogEnabled) console.error('Error starting notifications on the buttons characteristic.', error);}
    );
  }

  // start notifications on custom service potentio characteristic
  startBleNotificationsOnPotentioChar()
  {
    if(isLogEnabled) console.log('starting BLE Notifications on the potentio characteristic.');        
    this.ble.startNotification(this.connectedDevice.id, CUSTOM_SERVICE_UUID, POTENTIO_LEVEL_CHAR_UUID).subscribe(
      buffer => {           
      var data = new Uint8Array(buffer[0]); 
      if(isLogEnabled) console.log('data received in the potentio characteristic : '+data);
  
      this.ngZone.run(() => { 
        this.potentioLevel = data[0];
        });
      },
      error => { if(isLogEnabled) console.error('Error starting notifications on the potentio characteristic.', error);}
    );
  }  
  
  // start notifications on battery service battery level characteristic
  startBleNotificationsOnBatteryChar()
  {
    if(isLogEnabled) console.log('starting BLE Notifications on the battery level characteristic.');        
    this.ble.startNotification(this.connectedDevice.id, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR_UUID).subscribe(
      buffer => {           
      var data = new Uint8Array(buffer[0]); 
      if(isLogEnabled) console.log('data received in the battery level characteristic : '+data);
  
      this.ngZone.run(() => { 
        this.batteryLevel = data[0];
        });
      },
      error => { if(isLogEnabled) console.error('Error starting notifications on the battery level characteristic.', error); }
    );
  }

  onToggleChange()
  {
    let data = new Uint8Array([this.led3IsOn === false ? 0 : 1, this.led4IsOn === false ? 0 : 1]);

    this.ble.write(this.connectedDevice.id, CUSTOM_SERVICE_UUID, LEDS_STATES_CHAR_UUID, data.buffer as ArrayBuffer).then(
      () => {           
      if(isLogEnabled) console.log('The new leds states ('+ data +') were written to the BLE leds states characteristic successfully.');
      },
      error => { if(isLogEnabled) console.error('Error writing the new leds states to the BLE leds states characteristic.', error);}
    );
  }  

  // on error disconnecting from device
  onErrorDisconnecting(device, error)
  {
    if(isLogEnabled) console.error('Error disconnecting from '+device.name+'.', error);
    if(isLogEnabled) console.info('Checking if'+device.name+' is still connected ...');

    this.ble.isConnected(device.id).then(() => 
    { 
      if(isLogEnabled) console.log(device.name+' is still connected.');
      this.showAlert('Error disconnecting ..', device.name+ 'is still connected. Please try again!');
    },
    () =>
    {
      this.onDisconnecting(device);
    });
  }
 
  // on disconnecting from device
  onDisconnecting(device)
  {
    if(isLogEnabled) console.log(device.name+' is disconnected.');
    if(isLogEnabled) console.info('Navigating to [scanner] page.');
    this.showToast('Disconneced from '+device.name+'.', 'danger', 2000, 'bottom');
    this.navCtrl.navigateBack('scanner');
  }

  // Function to disconnect from the device
  disconnect(device)
  {
    this.ble.disconnect(device.id).then(
      () => this.onDisconnecting(device),
      error => this.onErrorDisconnecting(device, error)
    );
  }
  
  // show toast
  async showToast(msg, clr, dur, pos) 
  {
    let toast  = await this.toastCtrl.create({
        message: msg,
        color: clr,
        duration: dur,
        position: pos,
        cssClass :'toast'
    });

    toast.present();
  }

  // show alert
  async showAlert(title, message) 
  {               
    let alert = await this.alertCtrl.create({
          header: title,
          subHeader: message,
          buttons: ['OK'],
          cssClass : 'alert'
          })         
    await alert.present()
  }    
}
