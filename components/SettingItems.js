/**
 * Created by NickChung on 4/14/16.
 */
import React from 'react-native';
const {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    } = React;

import { RadioButtons, SegmentedControls } from 'react-native-radio-buttons';
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");

var SettingItems = React.createClass({
    mixins:[EventEmitterMixin],
    componentDidMount(){
        this.eventEmitter('on', 'configChanged', (params)=> {
            RealmRepo.updateUserConfig(
                params.displayLang, params.voiceLang, params.autoPlay
                , (res) => {
                    console.log(res);
                });
        });
    },
    getInitialState() {
        var ref;
        RealmRepo.getUserConfig(null, null, (res)=> {
            ref = res;
        });
        return {
            selectedSegment: ['OFF', 'ON'][ref.user.autoPlay],
            checkAudioListOption: ['粤语', '普通话', 'English', 'Português'][ref.user.voiceLang],
            checkDisplayListOption: ['繁體中文', '简体中文', 'English', 'Português'][ref.user.displayLang]
        };
    },
    render() {
        return (<ScrollView style={{
      backgroundColor: '#eeeeee'
    }}>
            {this.renderSegmentControlClone()}
            {this.renderDisplayCheckList()}
            {this.renderAudioCheckList()}
        </ScrollView>);
    },
    renderAudioCheckList() {
        const options = [
            "粤语",
            "普通话",
            "English",
            "Português"
        ];

        const values = {
            "粤语": 0,
            "普通话": 1,
            "English": 2,
            "Português": 3
        };

        function setSelectedOption(checkAudioListOption) {
            this.setState({
                checkAudioListOption,
            });
            this.eventEmitter('emit','configChanged',{voiceLang:values[checkAudioListOption]});
            this.eventEmitter('emit','settingChanged',this.props.name);
        }

        function renderOption(option, selected, onSelect, index) {

            const textStyle = {
                paddingTop: 10,
                paddingBottom: 10,
                color: 'black',
                flex: 1,
                fontSize: 14,
            };
            const baseStyle = {
                flexDirection: 'row',
            };
            var style;
            var checkMark;

            if (index > 0) {
                style = [baseStyle, {
                    borderTopColor: '#eeeeee',
                    borderTopWidth: 1,
                }];
            } else {
                style = baseStyle;
            }

            if (selected) {
                checkMark = <Text style={{
                  flex: 0.1,
                  color: '#007AFF',
                  fontWeight: 'bold',
                  paddingTop: 8,
                  fontSize: 20,
                  alignSelf: 'center',
                }}>✓</Text>;
            }

            return (
                <TouchableWithoutFeedback onPress={onSelect} key={index}>
                    <View style={style}>
                        <Text style={textStyle}>{option}</Text>
                        {checkMark}
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        function renderContainer(options) {
            return (
                <View style={{
          backgroundColor: 'white',
          paddingLeft: 20,
          borderTopWidth: 1,
          borderTopColor: '#cccccc',
          borderBottomWidth: 1,
          borderBottomColor: '#cccccc',
        }}>
                    {options}
                </View>
            );
        }

        return (
            <View style={{flex: 1}}>
                <View style={{marginTop: 10, backgroundColor: 'white'}}>
                    <View style={{
            backgroundColor: '#eeeeee',
          }}>
                        <Text style={{
              color: '#555555',
              paddingLeft: 20,
              paddingBottom: 5,
              fontSize: 12,
              fontWeight:'bold'
            }}>{RealmRepo.getLocaleValue('lbl_system_voice_lang')}</Text>
                        <RadioButtons
                            options={ options }
                            onSelection={ setSelectedOption.bind(this) }
                            selectedOption={ this.state.checkAudioListOption }
                            renderOption={ renderOption }
                            renderContainer={ renderContainer }
                            />
                    </View>
                </View>
            </View>);

    },
    renderDisplayCheckList() {
        const options = [
            "繁體中文",
            "简体中文",
            "English",
            "Português",
        ];

        const values = {
            "繁體中文": 0,
            "简体中文": 1,
            "English": 2,
            "Português": 3
        };

        function setSelectedOption(checkDisplayListOption) {
            this.setState({
                checkDisplayListOption,
            });
            this.eventEmitter('emit','configChanged',{displayLang:values[checkDisplayListOption]});
            this.eventEmitter('emit','localeChanged',this.props.name);
        }

        function renderOption(option, selected, onSelect, index) {

            const textStyle = {
                paddingTop: 10,
                paddingBottom: 10,
                color: 'black',
                flex: 1,
                fontSize: 14,
            };
            const baseStyle = {
                flexDirection: 'row',
            };
            var style;
            var checkMark;

            if (index > 0) {
                style = [baseStyle, {
                    borderTopColor: '#eeeeee',
                    borderTopWidth: 1,
                }];
            } else {
                style = baseStyle;
            }

            if (selected) {
                checkMark = <Text style={{
          flex: 0.1,
          color: '#007AFF',
          fontWeight: 'bold',
          paddingTop: 8,
          fontSize: 20,
          alignSelf: 'center',
        }}>✓</Text>;
            }

            return (
                <TouchableWithoutFeedback onPress={onSelect} key={index}>
                    <View style={style}>
                        <Text style={textStyle}>{option}</Text>
                        {checkMark}
                    </View>
                </TouchableWithoutFeedback>
            );
        }

        function renderContainer(options) {
            return (
                <View style={{
          backgroundColor: 'white',
          paddingLeft: 20,
          borderTopWidth: 1,
          borderTopColor: '#cccccc',
          borderBottomWidth: 1,
          borderBottomColor: '#cccccc',
        }}>
                    {options}
                </View>
            );
        }

        return (
            <View style={{flex: 1}}>
                <View style={{marginTop: 10, backgroundColor: 'white'}}>
                    <View style={{
            backgroundColor: '#eeeeee',
          }}>
                        <Text style={{
              color: '#555555',
              paddingLeft: 20,
              paddingBottom: 5,
              fontSize: 12,
              fontWeight:'bold'
            }}>{RealmRepo.getLocaleValue('lbl_system_display_lang')}</Text>
                        <RadioButtons
                            options={ options }
                            onSelection={ setSelectedOption.bind(this) }
                            selectedOption={ this.state.checkDisplayListOption }
                            renderOption={ renderOption }
                            renderContainer={ renderContainer }
                            />
                    </View>
                </View>
            </View>);

    },
    renderSegmentControlClone() {
        const options = [
            'ON',
            'OFF',
        ];

        function setSelectedOption(selectedSegment) {
            this.setState({
                selectedSegment
            });
            this.eventEmitter('emit','configChanged',{autoPlay:selectedSegment=="ON"?1:0});
            this.eventEmitter('emit','settingChanged',this.props.name);
        }

        return (
            <View style={{marginTop: 1, padding: 15, backgroundColor: 'white'}}>
                <Text style={{paddingBottom: 10, fontWeight:'bold'}}>{RealmRepo.getLocaleValue('lbl_setting_auto_play')}</Text>
                <SegmentedControls
                    options={ options }
                    onSelection={ setSelectedOption.bind(this) }
                    selectedOption={ this.state.selectedSegment }
                    />
            </View>);
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

module.exports = SettingItems;