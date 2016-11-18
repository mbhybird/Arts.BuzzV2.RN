import React, {Component,View,StyleSheet,Text,Alert,NetInfo,NativeAppEventEmitter,Image,Dimensions,ActivityIndicatorIOS} from "react-native"
import {Actions} from 'react-native-router-flux'
import Button from "react-native-button";
import Spinner from "react-native-gifted-spinner";
const RealmRepo = require("./RealmRepo.js");
import BluetoothState from 'react-native-bluetooth-state'
const EventEmitterMixin = require('react-event-emitter-mixin');
const ZipArchive = require('react-native-zip-archive');
const TimerMixin = require('react-timer-mixin');
const FileMgr = require("./FileMgr.js");
var Screen = Dimensions.get('window');

var Router = React.createClass({
    mixins:[EventEmitterMixin,TimerMixin],
    componentWillMount(){
        RealmRepo.initResources();
        RealmRepo.checkDataVersionUpdate();
        var ns = new Set().add("wifi").add("cell");
        //check network state
        NetInfo.fetch().done((reach) => {
            if(!ns.has(reach)) {
                Alert.alert(
                    RealmRepo.getLocaleValue('msg_dlg_title_tips'),
                    RealmRepo.getLocaleValue('msg_network_connect_fail'),
                    [
                        {text: RealmRepo.getLocaleValue('msg_dlg_ok')}
                    ]
                );
            }
        });

        BluetoothState.subscribe(bluetoothState => {
            //bluetoothState can either be "on", "off", "unknown", "unauthorized", "resetting" or "unsupported‚"
            if (bluetoothState !== "on") {
                this.eventEmitter('emit', 'signalReceive', false);
                Alert.alert(
                    RealmRepo.getLocaleValue('msg_dlg_title_tips'),
                    RealmRepo.getLocaleValue('msg_bt_is_not_ready'),
                    [
                        {text: RealmRepo.getLocaleValue('msg_dlg_ok')}
                    ]
                );
            }
        });
        //Initialize needs to be called otherwise we don't get the initial state
        BluetoothState.initialize();

        var subscription = NativeAppEventEmitter.addListener('RNFileDownloadProgressRoute', (info)=> {
            if (info.totalBytesWritten == info.totalBytesExpectedToWrite) {
                this.setTimeout(()=> {
                    ZipArchive.unzip(info.targetPath + info.filename, info.targetPath)
                        .then(() => {
                            console.log('unzip completed!');
                            let deviceLocaleCode = RealmRepo.DeviceLocaleCode;
                            RealmRepo.getUserConfig(deviceLocaleCode,deviceLocaleCode,(res)=>{
                                if(res.ok) {
                                    this.eventEmitter('emit','unzipCatalogCompleted');
                                    if (res.user.firstTimeLogin == 0) {
                                        Actions.guide({user:res.user});
                                    }
                                    else{
                                        Actions.home({user:res.user});
                                    }
                                }
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                }, 500);
            }
        });
    },
    componentDidMount(){
        RealmRepo.isCatalogRefresh((result)=> {
            if(result.update){
                let zipFileName = 'catalog.zip';
                FileMgr.downloadFile(
                    RealmRepo.GlobalParameter.PACKAGE_SERVER_PATH + zipFileName,
                    RealmRepo.GlobalParameter.PACKAGE_CLIENT_PATH,
                    zipFileName,
                    'Route');
            }
            else{
                let deviceLocaleCode = RealmRepo.DeviceLocaleCode;
                RealmRepo.getUserConfig(deviceLocaleCode,deviceLocaleCode,(res)=>{
                    if(res.ok) {
                        this.eventEmitter('emit','unzipCatalogCompleted');
                        if (res.user.firstTimeLogin == 0) {
                            Actions.guide({user:res.user});
                        }
                        else{
                            Actions.home({user:res.user});
                        }
                    }
                });
            }
        });
    },
    render(){
        return (
            <View style={styles.container}>
                <Image source={{
                                uri:'icon_logo',
                                resizeMode:'contain',
                                height:Screen.height,
                                width:Screen.width
                                }}
                       style={{opacity:0.8}}>
                </Image>
                <ActivityIndicatorIOS
                    size="large"
                    color="#fff"
                    style={{position:'absolute',top:Screen.height/2-30,left:Screen.width/2-10}}
                    />
            </View>
        );
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

module.exports = Router;