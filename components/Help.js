/**
 * Created by buzz on 17/6/16.
 */
import React, {
    Component,
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    TouchableHighlight,
    TouchableWithoutFeedback
} from "react-native"
import {Actions} from 'react-native-router-flux'
var Swiper = require('react-native-swiper');
const RealmRepo = require("./RealmRepo.js");
const EventEmitterMixin = require('react-event-emitter-mixin');
var Screen = Dimensions.get('window');

var Help = React.createClass({
    render(){
        return (
            <View style={styles.container}>
                <SwiperComp {...this.props}/>
            </View>
        );
    }
});

var SwiperComp = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState(){
        return {
            reload: false
        }
    },
    componentDidMount(){
        this.eventEmitter('on', 'localeChanged', ()=> {
            this.refresh();
        });
    },
    refresh(){
        this.setState({reload: !this.state.reload});
    },
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
                        if(this.props.name == 'helpModal'){
                            Actions.home();
                        }
                        else if(this.props.name == 'helpForBallModal'){
                            Actions.ball();
                        }
                        this.refresh();
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
    },
    buttonText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    }
});
module.exports = Help;