import { Component } from '@angular/core';
import { Platform, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Config } from '../../service/config.service';
import { CallNumber } from '@ionic-native/call-number';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Device } from '@ionic-native/device';

//custom
import { CoreValidator } from '../../validator/core';
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { TranslateService } from 'ng2-translate';
import { LinkProvider } from '../../providers/link/link';

declare var google;

import { FADEIN_LONGER } from '../../app/loading-animation';

@Component({
    selector: 'page-contactus',
    templateUrl: 'contactus.html',
    providers: [Core, CallNumber, Geolocation, LocationAccuracy, Diagnostic],
    animations: FADEIN_LONGER,
})
export class ContactusPage {
    check: boolean = true;
    checkselect: any;
    formContact: FormGroup;
    trans: Object;
    open_target_blank: boolean;
    submitAttempt = false;
    lat = 0;
    lng = 0;
    distance_km: any;
    textStatic: Object = {};
    wordpress_url = '';
    loading_distance = false;

    constructor(
        public navParams: NavParams,
        public formBuilder: FormBuilder,
        public http: Http,
        public storage: Storage,
        public platform: Platform,
        public translate: TranslateService,
        public config: Config,
        public core: Core,
        public callNumber: CallNumber,
        public geolocation: Geolocation,
        public locationAccuracy: LocationAccuracy,
        public diagnostic: Diagnostic,
        public device: Device,
        public linkProvider: LinkProvider
    ) {
        this.wordpress_url = config['wordpress_url'];
        this.formContact = formBuilder.group({
            name: ['', CoreValidator.required],
            email: ['', Validators.compose([CoreValidator.required, CoreValidator.isEmail])],
            subject: ['', CoreValidator.required],
            message: ['', CoreValidator.required]
        });
        this.textStatic = config['text_static'];
        if (config['text_static']['cellstore_location_gmap']) {
            this.lat = Number(config['text_static']['cellstore_location_gmap']['latitude']);
            this.lng = Number(config['text_static']['cellstore_location_gmap']['longitude']);
        }
    }

    ionViewDidEnter() {
        let scrollMap = false;
        scrollMap = this.navParams.get("scrollMap");

        if (scrollMap == true) {
            this.scrollToView('contact-us-map');
        }
    }

    configMap() {
        let shop_position = {
            'latitude': this.lat,
            'longitude': this.lng
        }

        if(this.device.platform) {
            this.locationAccuracy.canRequest().then((can: boolean) => {
                if (can || (this.device.platform.toLowerCase() == 'ios')) {
                    console.log('can get location');
                    this.loading_distance = true;
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
                        console.log('into location accuracy')
                        this.geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(
                            data => {
                                // if(data) {
                                    console.log(data);
                                    let coords = data['coords'];
                                    let distance = google.maps.geometry.spherical
                                        .computeDistanceBetween(new google.maps.LatLng(coords['latitude'], coords['longitude']),
                                        new google.maps.LatLng(this.lat, this.lng));
                                    this.distance_km = (distance / 1000).toFixed(2);
                                    let user_position = {
                                        'latitude': coords['latitude'],
                                        'longitude': coords['longitude']
                                    }
                                    this.initialMap(shop_position, user_position);
                                // } 
                                // else {
                                //     this.initialMap(shop_position, null);
                                // }
                                this.loading_distance = false;
                            })
                        //     .catch((error) => {
                        //         console.log('Can not get Latitude and Longitude.', error);
                        //         this.loading_distance = false;
                        //         this.initialMap(shop_position, null);
                        //     }
                        // );
                    }, err => {
                        console.log('Can not request locationAccuracy.', err);
                        this.loading_distance = false;
                        this.initialMap(shop_position, null);
                    })
                } else {
                    console.log('Cant request');
                    this.diagnostic.requestLocationAuthorization('always').then(res => {
                        console.log(res);
                        if (res == "GRANTED" || res == "authorized_when_in_use"
                            || res == "authorized") {
                            console.log("Granted")
                            this.configMap();
                        } else {
                            this.initialMap(shop_position, null);
                        }
                    });
                }
            })
        }
    }

    ionViewDidLoad() {
        if(this.lat !=0 && this.lng !=0) {
            this.configMap();
        }
    }

    initialMap(shopLocation, userLocation) {
        let element = document.getElementById('map_canvas');
        let shop_location = new google.maps.LatLng(shopLocation['latitude'], shopLocation['longitude']);
        let mapOptions = {
            center: shop_location,
            zoom: 10
        }

        let directionsDisplay = new google.maps.DirectionsRenderer();
        let directionsService = new google.maps.DirectionsService();

        let map = new google.maps.Map(element, mapOptions);
        directionsDisplay.setMap(map);

        calcRoute(shopLocation, userLocation);

        function calcRoute(startCoordinator, endCordinator) {
            let start = new google.maps.LatLng(startCoordinator['latitude'], startCoordinator['longitude']);
            let end = new google.maps.LatLng(0, 0);
            if(endCordinator) end = new google.maps.LatLng(endCordinator['latitude'], endCordinator['longitude']);

            let request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(response, status) {
                console.log(status);
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                } else {
                    console.log("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                    let marker_shop = new google.maps.Marker({
                        // title: this.textStatic['cellstore_contact_us_title'],
                        label: 'A',
                        position: shop_location,
                        map: map
                    });
                    console.log("Marker shop", marker_shop);

                    if(endCordinator) {
                        let user_location = new google.maps.LatLng(userLocation['latitude'], userLocation['longitude']);
                        let marker_user = new google.maps.Marker({
                            label: 'B',
                            position: user_location,
                            map: map
                        });
                        console.log("Marker user", marker_user);
                    }
                    directionsDisplay.setMap(map);
                }
            });
        }
    }

    callNow(phone) {
        if (phone) {
            this.callNumber.callNumber(phone, true)
            .then(() => console.log('Launched dialer!'))
            .catch(() => console.log('Error launching dialer'));
        }
    }

    openLink(url: string) {
        this.linkProvider.openExternal(url);
    }

    scrollToView(element) {
        this.core.scrollToView(element);
    }

    send() {
        if (this.formContact.invalid) {
            this.submitAttempt = true;
        } else {
            this.core.showLoading();
            let params = this.formContact.value;
            let send_params = this.core.objectToURLParams(params);
            this.http.post(this.wordpress_url + '/wp-json/wooconnector/contactus/sendmail', send_params)
                .subscribe(res => {
                    if (res.json()['result'] == 'success') {
                        this.core.hideLoading();
                        this.formContact.patchValue({ subject: null });
                        this.formContact.patchValue({ message: null });
                        this.core.showToastBottom(this.trans["success"]);
                        this.submitAttempt = false;
                    } else {
                        this.core.hideLoading();
                        this.core.showLoading(this.trans["error"]);
                    }
                });
        }
    }

    showtime() {
        this.check = !this.check;
    }
}

