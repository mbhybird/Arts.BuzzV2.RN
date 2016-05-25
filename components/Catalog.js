import React, {View, Text, StyleSheet,Image,Dimensions,ActivityIndicatorIOS} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
const EventEmitterMixin = require('react-event-emitter-mixin');
var Modal = require('react-native-modalbox');
const RealmRepo = require("./RealmRepo.js");
import CatalogItems from "./CatalogItems"

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
            this.refs.modalDown.close();
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
            exTag: ""
        };
    },
    componentDidMount(){
        this.eventEmitter('on', 'iconShow', (params)=> {
            this.setState({opacity: params.opacity});
            this.setState({exTag: params.exTag});
        });
    },
   render(){
       return (
           <View style={styles.menu}>
               <Button onPress={()=>{this.eventEmitter('emit','drawerOpenFromCatalog');}}>
                   <Image source={{uri:"more"}}
                          style={{width: 50, height: 50}}/>
               </Button>
               <Button onPress={Actions.ball}>
                   <Image source={{uri:"go_w"}}
                          style={{width: 50, height: 50}}/>
               </Button>
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
                    this.eventEmitter('emit', 'downloadStart');
                    RealmRepo.updateExContent(this.state.exTag,()=>{
                        this.eventEmitter('emit', 'downloadChanged');
                    });
                    //RealmRepo.removeAllData();//for debug
                }}>
                   <Image source={{uri:"icon_download"}}
                          style={{width: 50, height: 50, opacity:this.state.opacity}}/>
               </Button>
           </View>
       );
   }
});

module.exports = Catalog;