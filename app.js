import React, {AppRegistry, Navigator, StyleSheet, Text, View, StatusBar, AppState, DeviceEventEmitter, NativeModules, PushNotificationIOS} from 'react-native'
import {Scene, Reducer, Router, Switch, TabBar, Modal, Schema, Actions} from 'react-native-router-flux'
import Catalog from './components/Catalog'
import LeftMenu from './components/LeftMenu'
import BallView from './components/BallView'
import NavigationDrawer from './components/NavigationDrawer'
import NavigationDrawerForBall from './components/NavigationDrawerForBall'
import MyRouter from './components/Router'
import Guide from './components/Guide'
import Detail from './components/Detail'
import MyCustView from './components/MyCustView'
const EventEmitterMixin = require('react-event-emitter-mixin');
const RNFS = require('react-native-fs');
var SplashScreen = require('@remobile/react-native-splashscreen');
const TimerMixin = require('react-timer-mixin');
var Sound = require('react-native-sound');
const RNS = NativeModules.RNSound;
const RealmRepo = require("./components/RealmRepo.js");
var _ = require('lodash');

class TabIcon extends React.Component {
    render(){
        return (
            <Text style={{color: this.props.selected ? "red" :"black"}}>{this.props.title}</Text>
        );
    }
}

class Right extends React.Component {
    render(){
        return <Text style={{
        width: 80,
        height: 37,
        position: "absolute",
        bottom: 4,
        right: 2,
        padding: 8,
    }}>Right</Text>
    }
}

const styles = StyleSheet.create({
    container: {flex:1, backgroundColor:"transparent",justifyContent: "center",
        alignItems: "center",}

});

const reducerCreate = params=>{
    const defaultReducer = Reducer(params);
    return (state, action)=> {
        //console.log("ACTION:", action);
        if (action.key === 'ball') {
            canReceiveSignal = true;
        } else if (action.key === 'home') {
            canReceiveSignal = false;
        }
        return defaultReducer(state, action);
    }
};

//hidden status bar
StatusBar.setHidden(true);

// Require react-native-ibeacon module
var Beacons = require('react-native-ibeacon');

// Define a region which can be identifier + uuid,
// identifier + uuid + major or identifier + uuid + major + minor
// (minor and major properties are numbers)
var region = {
    identifier: 'Sensoros',
    uuid: '23A01AF0-232A-4518-9C0E-323FB773F5EF'
};

// Request for authorization while the app is open
Beacons.requestAlwaysAuthorization();

// Range for beacons inside the region
Beacons.startRangingBeaconsInRegion(region);

Beacons.startUpdatingLocation();

AppState.addEventListener('change', ()=> {
    //console.log(AppState.currentState == 'background');
});

var beaconState = [];
var headState = {};
var openHeadState = {};
var lastBeaconId = "";
var modalState = false;
var s = null;
var canReceiveSignal = false;

var App = React.createClass({
    mixins:[EventEmitterMixin,TimerMixin],
    _sendNotification(message) {
        if(message) {
            PushNotificationIOS.cancelAllLocalNotifications();
            PushNotificationIOS.presentLocalNotification({
                alertBody: message
            });
        }
    },
    playSound(){
        s = new Sound(openHeadState.audioPath, null, (e) => {
            if (e) {
                console.log('error', e);
            } else {
                RNS.headsetDeviceAvailable((v)=>{
                    if(v) {
                        let user = RealmRepo.getUser();
                        if (user) {
                            if (user.autoPlay == 1) {
                                if (s && s.isLoaded()) {
                                    s.setPan(0);
                                    s.play();
                                }
                            }
                        }
                    }
                });
            }
        });
    },
    stopSound(){
        RNS.headsetDeviceAvailable((v)=>{
            if(v) {
                if (s && s.isLoaded()) {
                    s.stop();
                    s.release();
                }
            }
        });
    },
    componentDidMount(){
        PushNotificationIOS.requestPermissions();
        this.setTimeout(()=> {
            SplashScreen.hide();
        },1000);

        // Listen for beacon changes
        var subscription = DeviceEventEmitter.addListener(
            'beaconsDidRange',
            (data) => {
                // Set the dataSource state with the whole beacon data
                // We will be rendering all of it throug <BeaconView />
                if (data.beacons.length > 0) {
                    let filterList = _.filter(data.beacons, function (o) {
                        return o.rssi !== 0;
                    });
                    let orderList = _.orderBy(filterList, ['rssi'], ['desc']);

                    //active
                    if (AppState.currentState === 'active') {
                        if(canReceiveSignal) {
                            this.eventEmitter('emit', 'beaconCountChanged', orderList);
                        }
                    } else {
                        //background
                        var title = null;
                        orderList.forEach((item)=> {
                            let beacon = RealmRepo.getBeaconInfo(item.major, item.minor);
                            if (beacon) {
                                let audio = beacon.triggercontent[1];
                                let rssi = item.rssi;
                                let effectiveRangeIn = beacon.effectiverangein;
                                var state = 0;
                                let content = beacon.triggercontent[0].content;
                                title = content ? content['title_' + RealmRepo.Locale().displayLang] : "";

                                if (audio) {
                                    let audioContent = audio.content;
                                    if (audioContent) {
                                        refAudioId = audioContent.contentid;
                                        audioPath = RNFS.DocumentDirectoryPath
                                        + audioContent.clientpath
                                        + audioContent.filename.replace(".mp3", `_${RealmRepo.Locale().voiceLang}.mp3`);
                                    }
                                }

                                if (rssi >= effectiveRangeIn) {
                                    state = 1;
                                }

                                var findBeacon = _.find(beaconState, (o)=> {
                                    return o.beaconId == beacon.beaconid;
                                });

                                if (findBeacon) {
                                    findBeacon.state = state;
                                    if (state == 1) {
                                        findBeacon.audioPath = audioPath;
                                    }
                                }
                                else {
                                    let newBeacon = {
                                        state: state,
                                        beaconId: beacon.beaconid,
                                        extag: beacon.extag
                                    };

                                    if (state == 1) {
                                        newBeacon.audioPath = audioPath;
                                    }

                                    beaconState.push(newBeacon);
                                }
                            }

                        });

                        headState = beaconState[0];
                        if (!modalState) {
                            openHeadState = headState;
                        }

                        beaconState = _.drop(beaconState);
                        if (headState) {
                            let user = RealmRepo.getUser();
                            //in state
                            if (headState.state == 1) {
                                //init
                                if (lastBeaconId == "") {
                                    modalState = true;
                                    if(user) {
                                        RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                                    }
                                    console.log('open', headState.beaconId);
                                    this._sendNotification(title);
                                    this.playSound();
                                    lastBeaconId = headState.beaconId;
                                }
                                else {
                                    if (headState.beaconId != lastBeaconId) {
                                        //other beacon in
                                        //close first
                                        modalState = false;
                                        if(user) {
                                            RealmRepo.addLog(user.userId, headState.beaconId, '1', headState.extag, ()=> {});
                                        }
                                        console.log('close', lastBeaconId);
                                        this.stopSound();
                                        lastBeaconId = "";

                                        this.setTimeout(()=> {
                                            //then open
                                            modalState = true;
                                            if(user) {
                                                RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                                            }
                                            console.log('open', headState.beaconId);
                                            this._sendNotification(title);
                                            this.playSound();
                                            lastBeaconId = headState.beaconId;
                                        }, 100);
                                    }
                                    else {
                                        //the same beacon then keep the state(do nothing)
                                    }
                                }
                            }
                            else {
                                //out state
                                if (lastBeaconId == headState.beaconId) {
                                    //the same beacon then close
                                    modalState = false;
                                    if(user) {
                                        RealmRepo.addLog(user.userId, headState.beaconId, '1', headState.extag, ()=> {});
                                    }
                                    console.log('close', lastBeaconId);
                                    this.stopSound();
                                    lastBeaconId = ""
                                }
                                else {
                                    //do nothing
                                }

                            }
                        }
                    }
                }
                else {
                    if (AppState.currentState !== 'active') {
                        this.eventEmitter('emit', 'beaconCountChanged', null);
                    }
                }
            });
    },
    render() {
        return <Router createReducer={reducerCreate}>
            <Scene key="modal" component={Modal} >
                <Scene key="root" hideNavBar={true}>
                    <Scene key="tabBar" tabs={true} initial={true}>
                        <Scene key="myRouter" component={MyRouter} initial={true} hideNavBar={true}/>
                        <Scene key="guide" component={Guide} hideNavBar={true}/>
                        <Scene key="home" component={NavigationDrawer}>
                            <Scene key="main" initial={true} hideNavBar={true}>
                                <Scene key="catalog" component={Catalog}/>
                            </Scene>
                        </Scene>
                        <Scene key="ball" component={NavigationDrawerForBall}>
                            <Scene key="monitor" initial={true} hideNavBar={true}>
                                <Scene key="ballView" component={BallView}/>
                            </Scene>
                        </Scene>
                    </Scene>
                    <Scene key="detail">
                        <Scene key="detailModal" component={Detail} hideNavBar={true}/>
                    </Scene>
                    {/*
                    <Scene key="customView">
                        <Scene key="myCustomView" component={MyCustView} hideNavBar={true}/>
                    </Scene>
                    */}
                </Scene>
            </Scene>
        </Router>;
    }
});

module.exports = App;