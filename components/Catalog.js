import React, {View, Text, StyleSheet,Image,Dimensions,ActivityIndicatorIOS,Alert} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
const EventEmitterMixin = require('react-event-emitter-mixin');
var Modal = require('react-native-modalbox');
const RealmRepo = require("./RealmRepo.js");
import CatalogItems from "./CatalogItems"
var ProgressBar = require('react-native-progress-bar');
const History  = require("./History.js");
import BluetoothState from 'react-native-bluetooth-state';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
    container: {
        flex: 10,
        justifyContent: "center",
        alignItems: "stretch",
        backgroundColor: "#698686"
    },
    menu: {
        flex:1,
        padding:5,
        flexDirection:'row',
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    body: {
        flex:9,
        justifyContent: "flex-start",
        alignItems: "center"
    }
});

var modelStyle={
    modal: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height:150,
        width:300
    },
    modalDown: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height:150,
        width:300
    },
    text: {
        color: "black",
        fontSize: 22
    },
    btn: {
        margin: 10,
        backgroundColor: "#3B5998",
        color: "white",
        padding: 10
    }
};

var Catalog = React.createClass({
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <View style={{
                        height:Dimensions.get('window').height-110,
                        width:Dimensions.get('window').width
                        }}>
                        <CatalogItems/>
                    </View>
                </View>
                <ToolBar/>
                <ModalIndicator/>
            </View>
        );
    }
});

var ModalIndicator = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState(){
        return {
            reload: false
        };
    },
    componentDidMount(){
        this.eventEmitter('on', 'downloadStart', ()=> {
            this.refs.modalDown.open();
        });

        this.eventEmitter('on', 'downloadChanged', ()=> {
            if(this.refs.progressBar) {
                this.refs.progressBar._finished();
                setTimeout((function () {
                    this.refs.modalDown.close();
                }).bind(this), 500);
            }
            else {
                this.refs.modalDown.close();
            }
        });

        this.eventEmitter('on', 'localeChanged', (source)=> {
            this.setState({
                reload: !this.state.reload
            });
        });
    },
    render(){
        return(
            <Modal style={modelStyle.modalDown}
                   backdrop={false}
                   position={"center"}
                   ref={"modalDown"}
                   isDisabled={false}
                   animationDuration={1}>
                <ActivityIndicatorIOS
                    size="large"
                    color="#aa3300"
                    />
                <ProgressBarIndicator ref={"progressBar"}/>
                <Text style={modelStyle.text}>{RealmRepo.getLocaleValue('msg_file_downloading')}</Text>
            </Modal>
        );
    }
});

var ToolBar = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState(){
        return {
            opacity: 0,
            exTag: "",
            signalReceive: false,
            versionMatch: true,
            btON: true
        };
    },
    componentDidMount(){
        this.eventEmitter('on', 'iconShow', (params)=> {
            History.lastAccessExTag = params.exTag;
            this.setState({
                opacity: params.opacity,
                exTag: params.exTag,
                versionMatch: params.versionMatch
            });
        });

        this.eventEmitter('on', 'signalReceive', (value)=> {
            this.setState({
                signalReceive: value
            });
        });

        BluetoothState.subscribe(bluetoothState => {
            this.setState({btON: bluetoothState == 'on'});
        });
    },
   render(){
       return (
           <View style={styles.menu}>
               <Button onPress={()=>{this.eventEmitter('emit','drawerOpenFromCatalog');}}>
                   <Image source={{uri:"menu"}}
                          style={{width: 50, height: 50}}/>
               </Button>
               { (this.state.signalReceive && (this.state.opacity == 0 || !this.state.versionMatch)) ?
                   (<Button onPress={Actions.ball}>
                       <Image source={{uri:"ble_1"}}
                              style={{width: 50, height: 50}}/>
                   </Button>) :
                   null
               }
               { !this.state.btON ?
                   (<Button onPress={()=>{
                        Alert.alert(
                            RealmRepo.getLocaleValue('msg_dlg_title_tips'),
                            RealmRepo.getLocaleValue('msg_bt_is_not_ready'),
                            [
                                {text: RealmRepo.getLocaleValue('msg_dlg_ok')}
                            ]
                        );
                   }}>
                       <Icon name="bluetooth-disabled" size={50} color="lightgray"/>
                   </Button>) :
                   null
               }
               {/*
               <Button onPress={()=>{
                RealmRepo.deleteFavorites();
                RealmRepo.writeFavorite('mah','c41','c52');
                RealmRepo.writeFavorite('mah','c45','c56');
               }}>
                   <Image source={{uri:"red_love"}}
                          style={{width: 50, height: 50}}/>
               </Button>
               */}
               <Button onPress={()=>{
                    if(this.state.opacity == 100){
                        this.eventEmitter('emit', 'downloadStart');
                        RealmRepo.updateExContent(this.state.exTag,()=>{
                            this.eventEmitter('emit', 'downloadChanged');
                        });
                    }
                    //RealmRepo.removeAllData();//for debug
                }}>
                   <Image source={{uri:"download"}}
                          style={{width: 50, height: 50, opacity:this.state.opacity}}/>
               </Button>
           </View>
       );
   }
});

var ProgressBarIndicator = React.createClass({
    _finished(){
        this.setState({progress: 1})
    },
    getInitialState(){
        return {
            progress: 0.2
        }
    },
    render(){
        setTimeout((function () {
            if (this.state.progress < 1) {
                this.setState({progress: this.state.progress + (0.4 * Math.random())});
            }
        }).bind(this), 100);
        return (
            <ProgressBar
                ref={"pb"}
                fillStyle={{}}
                backgroundStyle={{backgroundColor: '#cccccc', borderRadius: 2}}
                style={{marginTop: 10, width: 150}}
                progress={this.state.progress}
                />
        );
    }
});

module.exports = Catalog;