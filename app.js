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
const History  = require("./components/History.js");
import Help from "./components/Help";
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
        padding: 8
    }}>Right</Text>
    }
}

const styles = StyleSheet.create({
    container: {flex:1, backgroundColor:"transparent",justifyContent: "center",
        alignItems: "center"}

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

/*
AppState.addEventListener('change', ()=> {
    //console.log(AppState.currentState == 'background');
});*/

var beaconState = [];
var headState = {};
var openHeadState = {};
var lastBeaconId = "";
var modalState = false;
var s = null;
var canReceiveSignal = false;
var orderState = null;

/*
RCTPushNotificationManager.m

//notification.soundName = [RCTConvert NSString:details[@"soundName"]] ?: UILocalNotificationDefaultSoundName;

RCTSplashScreen.m

UIImageView *view = [[UIImageView alloc]initWithFrame:[UIScreen mainScreen].bounds];
view.image = [UIImage imageNamed:@"icon_logo"];
view.contentMode = UIViewContentModeScaleAspectFill;

CGSize mainScreenBoundsSize = [UIScreen mainScreen].bounds.size;
UILabel *label = [[ UILabel alloc] init];
NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
NSString *appVersion = [infoDictionary objectForKey:@"CFBundleShortVersionString"];
NSString *appBuild = [infoDictionary objectForKey:@"CFBundleVersion"];
label.text = [NSString stringWithFormat:@"VERSION:%@.%@", appVersion, appBuild];
UIFont *font = [UIFont fontWithName:@"Arial" size:18.0f];
label.font = font;
label.textAlignment = NSTextAlignmentCenter;
label.frame = CGRectMake(0, mainScreenBoundsSize.height-50, mainScreenBoundsSize.width, 50);
label.backgroundColor = [UIColor clearColor];
[label setTextColor:[UIColor whiteColor]];
[view addSubview:label];

*/
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
    playSound(audioPath){
        //var audioPath = openHeadState.audioPath;
        if(s){
            s.release();
        }
        s = new Sound(audioPath, null, (e) => {
            if (e) {
                console.log('error', e);
            } else {
                RNS.headsetDeviceAvailable((v)=> {
                    let user = RealmRepo.getUser();
                    if (user) {
                        if (user.autoPlay == 1) {
                            if (user.earphonePlay == 1) {
                                if (v) {
                                    if (s && s.isLoaded()) {
                                        s.setPan(0);
                                        s.play();
                                    }
                                }
                            }
                            else {
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
        //RNS.headsetDeviceAvailable((v)=>{
            //if(v) {
                if (s && s.isLoaded()) {
                    s.stop();
                }
            //}
        //});
    },
    log:function(user,state) {
        //state out-1,in-0
        if(user){
            if(History.playingId) {
                RealmRepo.addLog(user.userId, History.playingId, state, History.lastAccessExTag, ()=> {});
                //console.log(user.userId,History.playingId,state,History.lastAccessExTag);
            }
        }
    },
    triggerPlay:function(major,minor) {
        if (orderState == null) {
            orderState = {
                major: major,
                minor: minor,
                createTime: new Date().getTime()
            };
        }
        else {
            if (orderState.major == major && orderState.minor == minor) {
                var now = new Date().getTime();
                var duration = now - orderState.createTime;
                if (duration >= 3000) {
                    if (History.playingId != major + '-' + minor) {
                        var audioPath;
                        let beacon = RealmRepo.getBeaconInfo(major, minor);
                        if (beacon) {
                            let content = beacon.triggercontent[0].content;
                            let title = content ? content['title_' + RealmRepo.Locale().displayLang] : "";
                            let exMaster = RealmRepo.getExMaster(beacon.extag);
                            let exTitle = exMaster ? exMaster['title_' + RealmRepo.Locale().displayLang] : null;
                            let audio = beacon.triggercontent[1];
                            if (audio) {
                                let audioContent = audio.content;
                                if (audioContent) {
                                    audioPath = RNFS.DocumentDirectoryPath
                                    + audioContent.clientpath
                                    + audioContent.filename.replace(".mp3", `_${RealmRepo.Locale().voiceLang}.mp3`);
                                }

                                this._sendNotification(exTitle ? exTitle + '\r\n' + title : title);

                                if (audioPath && History.phoneCallState == 0) {
                                    this.stopSound();
                                    this.playSound(audioPath);
                                }
                            }
                        }

                        //out
                        let user = RealmRepo.getUser();
                        this.log(user,1);
                        //current
                        History.playingId = major + '-' + minor;
                        //in
                        this.log(user,0);
                    }
                }
            }
            else {
                orderState = {
                    major: major,
                    minor: minor,
                    createTime: new Date().getTime()
                };
            }
        }
    },
    isTargetBeacon(major, minor){
        var result = false;
        let exTag = History.lastAccessExTag;
        let beacon = RealmRepo.getBeaconInfo(major, minor);
        if (beacon && beacon.extag == exTag) {
            result = true;
        }
        return result;
    },
    componentDidMount(){
        PushNotificationIOS.requestPermissions();
        this.setTimeout(()=> {
            SplashScreen.hide();
        },1000);

        this.eventEmitter('on', 'drawerOpenState', (threshold)=> {
            canReceiveSignal = !threshold;
        });

        this.eventEmitter('on', 'triggerPlay',(orderList)=> {
            if (orderList) {
                if (orderList.length > 0) {
                    this.triggerPlay(orderList[0].major, orderList[0].minor);
                }
                else {
                    //this.stopSound();
                    let user = RealmRepo.getUser();
                    //out
                    this.log(user,1);
                    //History.playingId = null;
                }
            }
        });

        var subscriptionPhoneCallBegan = DeviceEventEmitter.addListener(
            'PhoneCallBegan',
            () => {
                this.stopSound();
                History.phoneCallState = 1;
                //console.log('state=>' + History.phoneCallState);
            });

        var subscriptionPhoneCallEnd = DeviceEventEmitter.addListener(
            'PhoneCallEnd',
            () => {
                History.phoneCallState = 0;
                //console.log('state=>' + History.phoneCallState);
            });

        AppState.addEventListener('change', ()=> {
            if(AppState.currentState == 'active') {
                this.eventEmitter('emit', 'detailClose');
            }
        });

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
                    let sourceList = _.orderBy(filterList, ['rssi'], ['desc']);
                    var orderList = [];
                    for(var item of sourceList) {
                        let major = item.major;
                        let minor = item.minor;
                        let findIndex = _.findIndex(orderList, function (o) {
                            return o.major == major && o.minor == minor;
                        });
                        if (findIndex == -1 && this.isTargetBeacon(major,minor)) {
                            orderList.push(item);
                        }
                    }

                    //active
                    if (AppState.currentState === 'active') {
                        if (canReceiveSignal) {
                            this.eventEmitter('emit', 'beaconCountChanged', orderList);
                        }
                        this.eventEmitter('emit', 'signalReceive', orderList.length > 0);
                    } else {
                        if(canReceiveSignal) {
                            this.eventEmitter('emit', 'triggerPlay', orderList);
                        }
                        /*
                        //background
                        var title = null;
                        var exTitle = null;
                        orderList.forEach((item)=> {
                            let beacon = RealmRepo.getBeaconInfo(item.major, item.minor);
                            if (beacon) {
                                let audio = beacon.triggercontent[1];
                                let rssi = item.rssi;
                                let effectiveRangeIn = beacon.effectiverangein;
                                var state = 0;
                                let content = beacon.triggercontent[0].content;
                                title = content ? content['title_' + RealmRepo.Locale().displayLang] : "";
                                let exMaster = RealmRepo.getExMaster(beacon.extag);
                                exTitle = exMaster ? exMaster['title_' + RealmRepo.Locale().displayLang] : null;

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
                                        extag: beacon.extag,
                                        exTitle: exTitle,
                                        title: title
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
                                    if (History.lastPlayBeaconId != headState.beaconId) {
                                        modalState = true;
                                        if (user) {
                                            RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                                        }
                                        console.log('open', headState.beaconId);
                                        this._sendNotification(headState.exTitle ? headState.exTitle + '\r\n' + headState.title : headState.title);
                                        this.playSound();
                                        lastBeaconId = headState.beaconId;
                                        History.lastPlayBeaconId = lastBeaconId;
                                    }
                                }
                                else {
                                    if (headState.beaconId != lastBeaconId) {
                                        //other beacon in
                                        //close first
                                        modalState = false;
                                        if(user) {
                                            RealmRepo.addLog(user.userId, lastBeaconId, '1', headState.extag, ()=> {});
                                        }
                                        console.log('close', lastBeaconId);
                                        this.stopSound();
                                        lastBeaconId = "";

                                        if (History.lastPlayBeaconId != headState.beaconId) {
                                            this.setTimeout(()=> {
                                                //then open
                                                modalState = true;
                                                if (user) {
                                                    RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                                                }
                                                console.log('open', headState.beaconId);
                                                this._sendNotification(headState.exTitle ? headState.exTitle + '\r\n' + headState.title : headState.title);
                                                this.playSound();
                                                lastBeaconId = headState.beaconId;
                                                History.lastPlayBeaconId = lastBeaconId;
                                            }, 100);
                                        }
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
                        }*/
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
                        <Scene key="help">
                            <Scene key="helpModal" component={Help} hideNavBar={true}/>
                        </Scene>
                        <Scene key="helpForBall">
                            <Scene key="helpForBallModal" component={Help} hideNavBar={true}/>
                        </Scene>
                        <Scene key="detail">
                            <Scene key="detailModal" component={Detail} hideNavBar={true}/>
                        </Scene>
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