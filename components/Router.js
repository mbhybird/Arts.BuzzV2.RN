import React, {Component,View,StyleSheet,Text,Alert,NetInfo} from "react-native"
import {Actions} from 'react-native-router-flux'
import Button from "react-native-button";
import Spinner from "react-native-gifted-spinner";
const RealmRepo = require("./RealmRepo.js");
import BluetoothState from 'react-native-bluetooth-state'

var Router = React.createClass({
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
    },
    componentDidMount(){
        let deviceLocaleCode = RealmRepo.DeviceLocaleCode;
        RealmRepo.getUserConfig(deviceLocaleCode,deviceLocaleCode,(res)=>{
            if(res.ok) {
                if (res.user.firstTimeLogin == 0) {
                    Actions.guide({user:res.user});
                }
                else{
                    Actions.home({user:res.user});
                }
            }
        });
    },
    render(){
        return (
            <View style={styles.container}>
                <Spinner/>
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