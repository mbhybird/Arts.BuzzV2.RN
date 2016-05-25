import React, {Component,View,Text,StyleSheet,Dimensions,Image,TouchableOpacity,TouchableHighlight} from "react-native"
import {Actions} from 'react-native-router-flux'
var Swiper = require('react-native-swiper');
const DeviceInfo = require('react-native-device-info');
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");

var Guide = React.createClass({
    mixins:[EventEmitterMixin],
    componentDidMount(){
        /*
        console.log("Device Unique ID", DeviceInfo.getUniqueID());  // e.g. FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9
        console.log("Device Manufacturer", DeviceInfo.getManufacturer());  // e.g. Apple
        console.log("Device Model", DeviceInfo.getModel());  // e.g. iPhone 6
        console.log("Device ID", DeviceInfo.getDeviceId());  // e.g. iPhone7,2 / or the board on Android e.g. goldfish
        console.log("Device Name", DeviceInfo.getSystemName());  // e.g. iPhone OS
        console.log("Device Version", DeviceInfo.getSystemVersion());  // e.g. 9.0
        console.log("Bundle Id", DeviceInfo.getBundleId());  // e.g. com.learnium.mobile
        console.log("Build Number", DeviceInfo.getBuildNumber());  // e.g. 89
        console.log("App Version", DeviceInfo.getVersion());  // e.g. 1.1.0
        console.log("App Version (Readable)", DeviceInfo.getReadableVersion());  // e.g. 1.1.0.89
        console.log("Device Name", DeviceInfo.getDeviceName());  // e.g. Becca's iPhone 6
        console.log("User Agent", DeviceInfo.getUserAgent()); // e.g. Dalvik/2.1.0 (Linux; U; Android 5.1; Google Nexus 4 - 5.1.0 - API 22 - 768x1280 Build/LMY47D)
        console.log("Device Locale", DeviceInfo.getDeviceLocale()); // e.g en-US
        console.log("Device Country", DeviceInfo.getDeviceCountry()); // e.g US
        */

        //[en-US,zh-Hans-US,zh-Hant-US,pt-PT]
    },
    render(){
        return (
            <View style={styles.container}>
                <SwiperComp/>
            </View>
        );
    }
});

var SwiperComp = React.createClass({
    mixins: [EventEmitterMixin],
    _onMomentumScrollEnd: function (e, state, context) {
        //this.eventEmitter('emit','startToExp',state.index);
    },
    render: function () {
        var guideList = [
            {imageUri: `pag01_${RealmRepo.Locale().displayLang}`},
            {imageUri: `pag02_${RealmRepo.Locale().displayLang}`}
        ];
        var guideView = guideList.map((item, index) => {
            return (
                <TouchableHighlight onPress={()=>{
                    if(index==1){
                        RealmRepo.updateFirstTimeLogin((res)=>{
                            Actions.home({user:res.user});
                        });
                    }
                }} key={index}>
                    <Image
                        source={{
                    height:Dimensions.get('window').height,
                    uri:item.imageUri,
                    sizeMode:'stretch'
                }}/>
                </TouchableHighlight>
            );
        });

        return (
            <View>
                <Swiper height={Dimensions.get('window').height}
                        showsButtons={false}
                        loop={false}
                        onMomentumScrollEnd={this._onMomentumScrollEnd}
                    >
                    {guideView}
                </Swiper>
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
module.exports = Guide;