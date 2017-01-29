/**
 * Created by NickChung on 12/12/16.
 */
'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    ListView,
    Image,
    Dimensions,
    TouchableOpacity
    } = React;

const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
const RNFS = require('react-native-fs');
import Icon from 'react-native-vector-icons/FontAwesome';
import {Actions} from "react-native-router-flux";
import Button from "react-native-button";
import Detail from './Detail'
var deviceScreen = Dimensions.get('window');
var _ = require('lodash');
import MyCustView from './MyCustView'
const DeviceModel = require('react-native-device-info').getModel();

// Create our dataSource which will be displayed in the data list
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var beaconState = [];

// The BeaconView
var PreviewBeaconView = React.createClass({
    mixins:[EventEmitterMixin],
    render: function() {
        try {
            let beacon = RealmRepo.getBeaconInfo(this.props.major, this.props.minor);
            if (beacon) {
                let content = beacon.triggercontent[0].content;
                let audio =  beacon.triggercontent[1];
                if (content) {
                    let imageUri = RNFS.DocumentDirectoryPath + content.clientpath + content.filename;
                    if(imageUri) {
                        let title = content['title_' + RealmRepo.Locale().displayLang];
                        let effectiveRangeIn = beacon.effectiverangein;
                        let rssi = this.props.rssi;
                        var desc, baseUrl, audioPath, placeHolder;
                        var state = 0;
                        var refImageId = content.contentid;
                        var refAudioId = -1;
                        var exTag = beacon.extag;
                        var fontSize = 20;
                        var locale = RealmRepo.Locale().displayLang;
                        if(locale=='en' || locale=='pt') {
                            fontSize = 16;
                            if (DeviceModel.indexOf("5") >= 0
                                || DeviceModel.indexOf("SE") >= 0
                                || DeviceModel.indexOf("iPod") >= 0) {
                                //iPhone 5/5c/5c/SE & iPod
                                if (title.length > 34) {
                                    title = title.substring(0, 34) + '...';
                                }
                            }
                            else if (DeviceModel.indexOf("Plus") >= 0) {
                                //iPhone 6p/6sp/7p
                                if (title.length > 45) {
                                    title = title.substring(0, 45) + '...';
                                }
                            }
                            else {
                                //iPhone 6/6s/7
                                if (title.length > 40) {
                                    title = title.substring(0, 40) + '...';
                                }
                            }
                        }

                        placeHolder = '{' + content.clientpath + content.filename + '}';
                        baseUrl = RNFS.DocumentDirectoryPath + content.clientpath;
                        desc = content["description_" + RealmRepo.Locale().displayLang].replace(placeHolder, content.filename);

                        if (audio) {
                            let audioContent = audio.content;
                            if (audioContent) {
                                refAudioId =  audioContent.contentid;
                                audioPath = RNFS.DocumentDirectoryPath
                                + audioContent.clientpath
                                + audioContent.filename.replace(".mp3", `_${RealmRepo.Locale().voiceLang}.mp3`);
                            }
                        }

                        if (rssi >= effectiveRangeIn) {
                            state = 1;
                        }

                        var findBeacon = _.find(beaconState, (o)=> {
                            return o.beaconId == beacon.beaconid;
                        });

                        if (findBeacon) {
                            findBeacon.state = state;
                            if (state == 1) {
                                findBeacon.desc = desc;
                                findBeacon.audioPath = audioPath;
                                findBeacon.baseUrl = baseUrl;
                            }
                        }
                        else {
                            let newBeacon = {
                                beaconId: beacon.beaconid,
                                state: state,
                                mode: 'auto',
                                extag: exTag,
                                refImageId: refImageId,
                                refAudioId: refAudioId,
                                from: 'leftMenuBall'
                            };

                            if (state == 1) {
                                newBeacon.desc = desc;
                                newBeacon.audioPath = audioPath;
                                newBeacon.baseUrl = baseUrl;
                            }

                            beaconState.push(newBeacon);
                        }

                        return (
                            <TouchableOpacity onPress={()=>{
                                    Actions.detail();
                                    this.eventEmitter('emit','refreshDetail',{
                                        extag: exTag,
                                        refImageId: refImageId,
                                        refAudioId: refAudioId,
                                        desc: desc,
                                        audioPath: audioPath,
                                        baseUrl: baseUrl,
                                        mode: 'manual',
                                        from: 'preview'
                                    });
                                }}>
                                <View style={[styles.row,styles.imageView]}>
                                    <MyCustView style={{width:deviceScreen.width-10,height:140}}
                                                textHeight={36}
                                                textFontSize={fontSize}
                                                textFontFamily={'Arial-BoldMT'}
                                                textContent={title}
                                                cropImageWidth={deviceScreen.width-10}
                                                cropImageHeight={140}
                                                srcImagePath={imageUri}/>
                                </View>
                            </TouchableOpacity>
                        );
                    }
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
    }
});

var PreviewList = React.createClass({
    mixins:[EventEmitterMixin],
    getInitialState: function() {
        return {
            dataSource: ds.cloneWithRows([])
        };
    },
    componentDidMount(){
        this.eventEmitter('on', 'refreshPreview', (params)=> {
            Actions.refresh(params);
            this.setState({dataSource: ds.cloneWithRows(params.beaconList)});
        });
        this.eventEmitter('on', 'localeChanged', ()=> {
            this.setState({dataSource: ds.cloneWithRows([])});
        });
    },
    renderRow: function(rowData,sectionID,rowID) {
        return <PreviewBeaconView {...rowData} style={styles.row} altRow={rowID%2==0}/>
    },
    renderHeader:function() {
        var title = null;
        let exMaster = RealmRepo.getExMaster(this.props.exTag);
        if (exMaster) {
            let locale = RealmRepo.Locale().displayLang;
            title = exMaster["title_" + locale];
            var trimLength = 25;//en or pt
            if (locale == 'cn' || locale == 'tw') {
                trimLength = 15;//cn or tw
            }
            if (title.length > trimLength) {
                title = title.slice(0, trimLength).concat('...');
            }
        }

        return title ? (<View style={styles.headerView}><Text style={styles.headerText}>{title}</Text></View>) : null;
    },
    render: function() {
        return (
            <View style={styles.container}>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow}
                    renderHeader={this.renderHeader}
                    enableEmptySections={true}
                    />
                <Button onPress={()=>{Actions.home();}}>
                    <Image source={{uri:'back'}}
                           style={{width: 50, height: 50, margin:5}}/>
                </Button>
            </View>
        );
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#698686'
    },
    headerView:{
        height:50,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width:deviceScreen.width
    },
    headerText:{
        fontSize: 25,
        color:'white',
        textAlign:'center'
    },
    headline: {
        fontSize: 20,
        paddingTop: 20
    },
    row: {
        flexDirection: 'row',
        width:deviceScreen.width,
        padding:5
    },
    imageView: {
        borderRadius: 0,
        overflow: 'hidden'
    },
    descView: {
        alignItems: 'center',
        height:36,
        paddingLeft:2
    },
    descText: {
        fontFamily:'Arial-BoldMT',
        color:'white'
    },
    smallText: {
        fontSize: 11
    },
    modal: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: deviceScreen.height,
        width: deviceScreen.width
    }
});

module.exports = PreviewList;