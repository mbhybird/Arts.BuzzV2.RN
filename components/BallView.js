import React, {View, Text, StyleSheet,Image,Dimensions} from "react-native";
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
import BeaconList from "./BeaconList"

const styles = StyleSheet.create({
    container: {
        flex: 10,
        justifyContent: "center",
        alignItems: "stretch",
        backgroundColor: "#698686",
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
        justifyContent: "center",
        alignItems: "center",
    },
});

var BallView = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState(){
        return {
            beaconCount: null
        }
    },
    componentDidMount(){
        this.eventEmitter('on', 'beaconCountChanged', (orderList)=> {
            this.setState({beaconCount: orderList ? orderList.length : null});
        });
    },
    render(){
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <View style={{
                        height:Dimensions.get('window').height-100,
                        width:Dimensions.get('window').width
                        }}>
                        <BeaconList/>
                    </View>
                </View>
                <View style={styles.menu}>
                    <Button onPress={()=>{this.eventEmitter('emit','drawerOpenFromBallView');}}>
                        <Image source={{uri:'more'}}
                               style={{width: 50, height: 50}}/>
                    </Button>
                    <Button onPress={Actions.home}>
                        <Image source={{uri:'back_w'}}
                               style={{width: 45, height: 45}}/>
                    </Button>
                    <Button>
                        <Text style={{paddingRight:5,color:'darkgray',fontSize:22,fontWeight:'bold'}}>
                            {this.state.beaconCount ? this.state.beaconCount : ""}
                        </Text>
                        <Image source={{uri:'icon_board'}}
                               style={{width: 50, height: 50}}>
                        </Image>
                    </Button>
                </View>
            </View>
        );
    }
});

module.exports = BallView;
