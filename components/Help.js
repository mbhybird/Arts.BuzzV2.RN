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

var Help = React.createClass({
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
        var guideList = [
            {imageUri: `pag01_${RealmRepo.Locale().displayLang}`},
            {imageUri: `pag02_${RealmRepo.Locale().displayLang}`}
        ];
        var guideView = guideList.map((item, index) => {
            return (
                <Image
                    key={index}
                    source={{
                        height:Dimensions.get('window').height,
                        uri:item.imageUri,
                        sizeMode:'stretch'
                    }}/>
            );
        });

        return (
            <View>
                <Swiper height={Dimensions.get('window').height}
                        showsButtons={true}
                        buttonWrapperStyle={styles.wrapperStyle}
                        loop={false}
                        nextButton={
                            <TouchableWithoutFeedback onPress={()=>{
                                Actions.home();
                                this.refresh();
                            }}>
                            <Text style={styles.buttonText}>{RealmRepo.getLocaleValue('lbl_skip')}</Text>
                            </TouchableWithoutFeedback>
                        }
                        prevButton={
                            <TouchableWithoutFeedback onPress={()=>{
                                Actions.home();
                                this.refresh();
                            }}>
                            <Text style={styles.buttonText}>{RealmRepo.getLocaleValue('lbl_skip')}</Text>
                            </TouchableWithoutFeedback>
                        }>
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
    wrapperStyle: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold'
    }
});
module.exports = Help;