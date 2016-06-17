/**
 * Created by NickChung on 5/16/16.
 */
'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    ListView,
    DeviceEventEmitter,
    Image,
    Dimensions,
    TouchableOpacity
    } = React;

const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
const History =  require("./History");
const RNFS = require('react-native-fs');
import Icon from 'react-native-vector-icons/FontAwesome';
const TimerMixin = require('react-timer-mixin');
var Modal = require('react-native-modalbox');
var Overlay = require('react-native-overlay');
import {Actions} from "react-native-router-flux";
import Detail from './Detail'
var deviceScreen = Dimensions.get('window');
var _ = require('lodash');

// Create our dataSource which will be displayed in the data list
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
var beaconState = [];
var headState = {};
var openHeadState = {};
var lastBeaconId = "";
var modalState = false;

// The BeaconView
var BeaconView = React.createClass({
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
                        let artist = content['artist_' + RealmRepo.Locale().displayLang];
                        let effectiveRangeIn = beacon.effectiverangein;
                        //let colorLevel = ['#FE9375', '#1DD5C0', '#00A8A7', '#C8C8C8'];
                        let rssiLevel = [-5, -10, -20, -25];
                        //var color = "#C8C8C8";
                        let rssi = this.props.rssi;
                        var desc, baseUrl, audioPath, placeHolder;
                        var state = 0;
                        var refImageId = content.contentid;
                        var refAudioId = -1;
                        var exTag = beacon.extag;

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
                        else if (rssi >= effectiveRangeIn + rssiLevel[0]) {
                            //color = colorLevel[0];
                        }
                        else if (rssi >= effectiveRangeIn + rssiLevel[1]) {
                            //color = colorLevel[1];
                        }
                        else if (rssi >= effectiveRangeIn + rssiLevel[2]) {
                            //color = colorLevel[2];
                        }
                        else if (rssi >= effectiveRangeIn + rssiLevel[3]) {
                            //color = colorLevel[3];
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
                                refAudioId: refAudioId
                            };

                            if (state == 1) {
                                newBeacon.desc = desc;
                                newBeacon.audioPath = audioPath;
                                newBeacon.baseUrl = baseUrl;
                            }

                            beaconState.push(newBeacon);
                        }

                        let bgColor = this.props.altRow ? '#9FADAD': '#88C1C1';

                        return (
                            <TouchableOpacity onPress={()=>{
                                    Actions.detail({
                                        extag: exTag,
                                        refImageId: refImageId,
                                        refAudioId: refAudioId,
                                        desc: desc,
                                        audioPath: audioPath,
                                        baseUrl: baseUrl,
                                        mode: 'manual'
                                    });
                                }}>
                                <View style={styles.row}>
                                    <View style={styles.imageView}>
                                        <Image source={{
                                        uri:imageUri,
                                        width:150,
                                        height:100
                                        }}
                                               resizeMode={Image.resizeMode.cover}
                                            />
                                    </View>
                                    <View style={[styles.descView,{backgroundColor:bgColor}]}>
                                        {beacon.displayname ?
                                            (<Text style={styles.descText}>
                                                {beacon.displayname}
                                            </Text>)
                                            : null
                                        }
                                        {title ?
                                            (<Text style={styles.descText}>
                                                {title}
                                            </Text>)
                                            : null
                                        }
                                        {artist ?
                                            (<Text style={styles.descText}>
                                                {artist}
                                            </Text>)
                                            : null
                                        }
                                    </View>
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

// The BeaconList component listens for changes and re-renders the
// rows (BeaconView components) in that case
var BeaconList = React.createClass({
    mixins:[TimerMixin,EventEmitterMixin],
    getInitialState: function() {
        return {
            dataSource: ds.cloneWithRows([])
        };
    },
    componentDidMount(){
        this.setInterval(()=> {
            headState = beaconState[0];
            if (!modalState) {
                openHeadState = headState;
            }
            beaconState = _.drop(beaconState);
            if (headState) {
                let user = RealmRepo.getUser();
                //in state
                if (headState.state == 1) {
                    //init
                    if (lastBeaconId == "") {
                        if (History.lastPlayBeaconId != headState.beaconId) {
                            modalState = true;
                            Actions.detail({...openHeadState});
                            if (user) {
                                RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                            }
                            console.log('open', headState.beaconId);
                            lastBeaconId = headState.beaconId;
                            History.lastPlayBeaconId = lastBeaconId;
                        }
                    }
                    else {
                        if (headState.beaconId != lastBeaconId) {
                            //other beacon in
                            //close first
                            modalState = false;
                            this.eventEmitter('emit', 'detailClose');
                            if(user) {
                                RealmRepo.addLog(user.userId, lastBeaconId, '1', headState.extag, ()=> {});
                            }
                            console.log('close', lastBeaconId);
                            lastBeaconId = "";

                            if (History.lastPlayBeaconId != headState.beaconId) {
                                this.setTimeout(()=> {
                                    //then open
                                    modalState = true;
                                    Actions.detail({...openHeadState});
                                    if (user) {
                                        RealmRepo.addLog(user.userId, headState.beaconId, '0', headState.extag, ()=> {});
                                    }
                                    console.log('open', headState.beaconId);
                                    lastBeaconId = headState.beaconId;
                                }, 100);
                                History.lastPlayBeaconId = lastBeaconId;
                            }
                        }
                        else {
                            //the same beacon then keep the state(do nothing)
                        }
                    }
                }
                else {
                    //out state
                    if (lastBeaconId == headState.beaconId) {
                        //the same beacon then close
                        modalState = false;
                        this.eventEmitter('emit', 'detailClose');
                        if(user) {
                            RealmRepo.addLog(user.userId, headState.beaconId, '1', headState.extag, ()=> {});
                        }
                        console.log('close', lastBeaconId);
                        lastBeaconId = ""
                    }
                    else {
                        //do nothing
                    }

                }
            }
        }, 500);
    },
    componentWillMount: function() {
        this.eventEmitter('on', 'beaconCountChanged', (orderList)=> {
            if (orderList) {
                this.setState({
                    dataSource: ds.cloneWithRows(orderList)
                });
            }
            else {
                this.setState({
                    dataSource: ds.cloneWithRows([])
                });
            }
        });
    },

    renderRow: function(rowData,sectionID,rowID) {
        return <BeaconView {...rowData} style={styles.row} altRow={rowID%2==0}/>
    },
    renderHeader:function() {
        var title = null;
        let exMaster = (History.lastAccessExTag == '') ? null : RealmRepo.getExMaster(History.lastAccessExTag);
        if (exMaster) {
            let locale = RealmRepo.Locale().displayLang;
            title = exMaster["title_" + locale];
            var trimLength = 15;//en or pt
            if (locale == 'cn' || locale == 'tw') {
                trimLength = 8;//cn or tw
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
            </View>
        );
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#698686'
    },
    headerView:{
        height:60,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width:deviceScreen.width
    },
    headerText:{
        fontSize: 30,
        color:'white',
        fontFamily:'Arial-BoldMT',
        textAlign:'center'
    },
    headline: {
        fontSize: 20,
        paddingTop: 20
    },
    row: {
        flexDirection: 'row',
        paddingBottom: 5,
        width:deviceScreen.width
    },
    imageView: {
        borderRadius: 0,
        overflow: 'hidden'
    },
    descView: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        width:deviceScreen.width-150,
        height:100
    },
    descText: {
        fontSize: 20,
        fontFamily:'Arial-BoldMT',
        color:'white',
        lineHeight:30,
        paddingRight:5
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

module.exports = BeaconList;