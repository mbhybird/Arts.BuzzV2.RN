import React, {Component} from "react-native"
import Drawer from "react-native-drawer"
import {DefaultRenderer} from "react-native-router-flux";
const EventEmitterMixin = require('react-event-emitter-mixin');
//import {Map} from 'immutable';
//let drawerState = Map({isOpen: false});
import LeftMenu from "./LeftMenu"

var NavigationDrawer = React.createClass({
    mixins:[EventEmitterMixin],
    componentDidMount(){
        this.eventEmitter('on','drawerOpenFromCatalog',()=>{
            this._drawer.open();
        });
    },
    render(){
        const children = this.props.navigationState.children;
        return (
            <Drawer
                ref={(ref) => this._drawer = ref}
                type="overlay"
                side="left"
                content={<LeftMenu name="leftMenuCatalog"/>}
                tapToClose={true}
                openDrawerOffset={0.2}
                panCloseMask={0.2}
                negotiatePan={true}
                tweenHandler={(ratio) => ({
                 main: { opacity:Math.max(0.54,1-ratio) }
            })}>
                <DefaultRenderer navigationState={children[0]} />
            </Drawer>
        );
    }
});

module.exports = NavigationDrawer;