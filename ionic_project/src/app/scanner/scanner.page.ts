import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular'; 
import { NavigationExtras } from "@angular/router";
import { BLE } from '@ionic-native/ble/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

const isLogEnabled = true;
const defaultDeviceName =  "nRF52-devkit";

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})

export class ScannerPage  {

  scannedDevices: any[] = [];

  constructor(private ble: BLE,
              private diagnostic: Diagnostic,
              private nativeStorage : NativeStorage,
              public  navCtrl: NavController,   
              public  platform: Platform,        
              private toastCtrl: ToastController,  
              private alertCtrl: AlertController,
              private loadingController: LoadingController,
              private ngZone: NgZone ) { }


  // app view about to display this page (scanner)
  ionViewWillEnter() 
  {
    this.nativeStorage.getItem('intro-done').then(
    (done) => 
    {
      if(!done) 
      {
        this.onIntroNotYetDone();
      }
      else 
      {  
        if(isLogEnabled) console.info('intro done!')
      }     
    },   
    (error) => 
    {
      if(isLogEnabled) console.error('Error getting the (intro-done) value from the native storage.', error);
      this.onIntroNotYetDone();
    }); 
  }

  // on into page not yet displayed (done)
  onIntroNotYetDone()
  {
    if(isLogEnabled) console.warn('intro not yet done! Navigating to [intro] page.')
    if(isLogEnabled) console.info('Navigating to the [intro] page.')
    this.navCtrl.navigateRoot('intro');
  }

// start the BLE scan
async startBleScan()
{
  let scanSpinner = await this.loadingController.create({
      spinner : "bubbles",
      animated : true,
      message : "Scanning ...",
      duration : 3000,
      translucent : true
    });
  
  this.ngZone.run(()=> { 
      this.scannedDevices = [];
  });

  // is the Bluetooth enabled?
  this.ble.isEnabled().then(
    () =>
    { // Bluetooth is enabled.
      // is the location enabled?
      this.ble.isLocationEnabled().then(
        () =>
        { // location is enabled.
          scanSpinner.present().then(
            () => 
            { 
              if(isLogEnabled) console.info('Scanning ....');
              
              // start the BLE scanning.
              this.ble.scan([], 3).subscribe(
                (device) => 
                {
                  this.onDiscoveredDevice(device);
                }, 
                (error)  =>  
                {
                  if(isLogEnabled) console.error('Error scanning.', error);
                  scanSpinner.dismiss().then(() => { 
                            this.showAlert('Error scanning.', error); 
                  });
                }); 
            });
        },
        // location is not enabled.
        (error) =>
        {
          if(isLogEnabled) console.error('Error isLocationEnabled.', error);
          this.showLocationEnableAlert('Ooops!', 'The Location is Not enabled. Please enable it and try again.'); 
        });  
    },
    // Bluetooth is not enabled.
    (error) => 
    {
      if(isLogEnabled) console.error('Error isBluetoothEnabled.', error);
      this.showBluetoothEnableAlert('Ooops!', 'The Bluetooth is Not enabled. Please enable it and try again.'); 
    });
  } 

  // con discovered device
  onDiscoveredDevice(device)
  {
    var scannedDevice = 
    { 
      name: device.name, 
      id: device.id, 
      mac: this.platform.is("android") ? device.id : '', 
      rssi : device.rssi
    }; 
  
    this.ngZone.run(() => {
      if(device.name === defaultDeviceName)
      {
        this.scannedDevices.push(scannedDevice);
      }
    });

    if(isLogEnabled) console.log('Scanned device  : '+ JSON.stringify(scannedDevice));  
  }

  // connect to a device
  connectToDevice(device) 
  {    
    this.showToast('Connecting to '+device.name+' ...', 'medium', 2000, 'bottom');
    this.ble.connect(device.id).subscribe(
      () => this.onConnected(device),
      (error) => this.onErrorConecting(device, error)
    );
  } 

  // on connected 
  onConnected(device)
  {
    if(isLogEnabled) console.log('Connected to '+device.name+'.');
    this.showToast('Connected to '+device.name+'.', 'success', 2000, 'bottom');
    this.ngZone.run(()=> {
      let navigationExtras: NavigationExtras = {
        queryParams: { 
          device: JSON.stringify(device)
        }
      }; 
      if(isLogEnabled) console.info('Navigating to the [dashboard] page');
      if(isLogEnabled) console.log('Navigation extras: device = '+JSON.stringify(device));
      this.scannedDevices = [];
      this.navCtrl.navigateForward(['dashboard'], navigationExtras);
    });
  }

  // on error connecting
  onErrorConecting(device, error)
  {
    this.showToast('Unexpectedly disconnected from '+device.name+'.', 'danger', 2000, 'bottom');
    if(isLogEnabled) console.error('Unexpectedly disconnected from '+device.name+'.', error);
    if(isLogEnabled) console.info('navigating to the [scanner] page');
    this.navCtrl.navigateBack(['scanner']);
  }  

  // show alert
  async showAlert(title, message) 
  {               
    let alert = await this.alertCtrl.create({
        header: title,
        subHeader: message,
        buttons: ['OK'],
        cssClass : 'alert'
    });        
    alert.present()
  }

  // show the bluetooth enable alert
  async showBluetoothEnableAlert(title, message) 
  {               
    let alert = await this.alertCtrl.create({
        header: title,
        subHeader: message,
        buttons: [
          {
            text: 'Settings',
            handler: () => {
              this.diagnostic.switchToBluetoothSettings();
            }
          },
          {
            text: 'OK',
            role: 'cancel',
          }
        ],
        cssClass: 'alert',
        backdropDismiss : false
    });        
    alert.present()
  }
  
  // show the location enable alert
  async showLocationEnableAlert(title, message) 
  {
    let alert = await this.alertCtrl.create({
        header: title,
        subHeader: message,
        buttons: [
          {
            text: 'Settings',
            handler: () => {
              this.diagnostic.switchToLocationSettings();
            }
          },
          {
            text: 'OK',
            role: 'cancel',
            cssClass: 'alert-buttons'
          }
        ],
        cssClass: 'alert',
        backdropDismiss : false
    });        
    alert.present()
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
