/**
 * Created by NickChung on 4/13/16.
 */
import React, {View, Text, StyleSheet,Image,Dimensions,} from "react-native";
import SettingItems from "./SettingItems"
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");

var Settings = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState(){
        return {
            reload: false
        }
    },
    componentDidMount(){
        this.eventEmitter('on', 'localeChanged', ()=> {
            this.setState({
                reload: !this.state.reload
            });
        });
    },
    render() {
        return (
            <View style={screenStyles.container}>
                <View style={screenStyles.navBar}>
                    <Text style={screenStyles.navBarTitle}>{RealmRepo.getLocaleValue('lb_setting')}</Text>
                </View>
            <SettingItems name={this.props.name}/>
            </View>
        );
    }
});

var screenStyles = {
    container: {
        flex: 1,
        backgroundColor: '#698686',
    },
    navBar: {
        height: 64,
        backgroundColor: '#698686',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBarTitle: {
        color: '#fff',
        fontSize: 30,
        fontWeight:'bold',
        marginTop: 12,
    }
};

module.exports = Settings;