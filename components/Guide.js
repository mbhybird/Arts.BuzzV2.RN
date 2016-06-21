import React, {Component,View,Text,StyleSheet,Dimensions,Image,TouchableOpacity,TouchableHighlight,TouchableWithoutFeedback} from "react-native"
import {Actions} from 'react-native-router-flux'
var Swiper = require('react-native-swiper');
const DeviceInfo = require('react-native-device-info');
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
var Screen = Dimensions.get('window');

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
    mixins:[EventEmitterMixin],
    render: function () {
        let locale = RealmRepo.Locale().displayLang.replace('pt', 'en');
        var guideList = [
            {imageUri: `h1_${locale}`},
            {imageUri: `h2_${locale}`},
            {imageUri: `h3_${locale}`},
            {imageUri: `h4_${locale}`},
            {imageUri: `h5_${locale}`},
            {imageUri: `h6_${locale}`}
        ];
        var closeView = (
            <View style={{
                        position: 'absolute',
                        top: 5,
                        right: 5
                    }}>
                <TouchableWithoutFeedback onPress={()=>{
                        RealmRepo.updateFirstTimeLogin((res)=>{
                            Actions.home({user:res.user});
                        });
                    }}>
                    <Image source={{uri:'close'}} style={{width:30,height:30}}/>
                </TouchableWithoutFeedback>
            </View>
        );

        var guideView = guideList.map((item, index) => {
            return (
                <View key={index}>
                    <Image source={{
                                uri:'icon_logo',
                                resizeMode:'contain',
                                height:Screen.height,
                                width:Screen.width
                                }}
                           style={{opacity:0.5}}>
                    </Image>
                    {index > 0 ?
                        (<Image
                            source={{
                                height:Screen.height-30,
                                width:Screen.width-20,
                                uri:item.imageUri,
                                resizeMode:'contain'
                                }}
                            style={{position:'absolute',top:15,left:10}}/>) :
                        (
                            <Image
                                source={{
                                height:Screen.height-100,
                                width:Screen.width-20,
                                uri:item.imageUri,
                                resizeMode:'contain'
                                }}
                                style={{position:'absolute',top:50,left:10}}/>
                        )
                    }
                    {closeView}
                </View>
            );
        });

        return (
            <View>
                <Swiper height={Screen.height}
                        showsButtons={false}
                        loop={false}>
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