/**
 * Created by NickChung on 4/14/16.
 */

var React = require('react-native');
var { StyleSheet, View,Text,Image,Dimensions,WebView,NativeModules } = React;
import Button from "react-native-button";
import {Actions} from "react-native-router-flux";
var Sound = require('react-native-sound');
import Icon from 'react-native-vector-icons/MaterialIcons';
import AweIcon from 'react-native-vector-icons/FontAwesome';
import EviIcon from 'react-native-vector-icons/EvilIcons';
const EventEmitterMixin = require('react-event-emitter-mixin');
const RNS = NativeModules.RNSound;
const RealmRepo = require("./RealmRepo.js");
var {FBSDKShareDialog,FBSDKShareLinkContent,} = require('react-native-fbsdkshare');
var ActionSheet = require('@remobile/react-native-action-sheet');

/*
RNSound.m

- (BOOL)hasHeadset {
#if TARGET_IPHONE_SIMULATOR
        #warning *** Simulator mode: audio session code works only on a device
    return YES;
#else
    AVAudioSession *session = [AVAudioSession sharedInstance];
    BOOL headsetDeviceAvailable = NO;
    AVAudioSessionRouteDescription *currentRoute = [session currentRoute];
    for (AVAudioSessionPortDescription *output in currentRoute.outputs) {
        if ([[output portType] isEqualToString:AVAudioSessionPortHeadphones]) {
            headsetDeviceAvailable = YES;
            break;
        }
    }

    return headsetDeviceAvailable;
#endif
}

 RCT_EXPORT_METHOD(headsetDeviceAvailable:
 (RCTResponseSenderBlock)callback) {
 NSNumber *number = [NSNumber numberWithBool:[self hasHeadset]];
 callback(@[number]);
 }

 RCT_EXPORT_METHOD(enable:(BOOL)enabled) {
 AVAudioSession *session = [AVAudioSession sharedInstance];
 //[session setCategory: AVAudioSessionCategoryAmbient error: nil];
 [session setCategory: AVAudioSessionCategoryPlayback withOptions:AVAudioSessionCategoryOptionDuckOthers error: nil];
 [session setActive: enabled error: nil];
 }
*/

var Detail = React.createClass({
    getInitialState(){
        var s = new Sound(this.props.audioPath + '', null, (e) => {
            if (e) {
                console.log('error', e);
            } else {
                // Get properties of the player instance
                //console.log('duration', s.getDuration());
                //console.log('volume: ' + s.getVolume());
                //console.log('pan: ' + s.getPan());
                //console.log('loops: ' + s.getNumberOfLoops());

                // Position the sound to the full right in a stereo field
                s.setPan(0);

                // Reduce the volume by half
                //s.setVolume(0.5);

                // Seek to a specific point in seconds
                //s.setCurrentTime(2.5);

                // Get the current playback point in seconds
                //s.getCurrentTime((seconds) => console.log('at ' + seconds));
            }
        });

        var sharedEnabled = false;
        var fbEnabled = false;
        var wcEnabled = false;
        let user = RealmRepo.getUser();
        if (user) {
            if (user.fbProfile) {
                fbEnabled = true;
                sharedEnabled = true;
            }
            if (user.wcProfile) {
                wcEnabled = true;
                sharedEnabled = true;
            }
        }
        return {
            sound: s,
            show: false,
            fbEnabled: fbEnabled,
            wcEnabled: wcEnabled,
            sharedEnabled: sharedEnabled
        }
    },
    onCancel() {
        this.setState({show:false});
    },
    onOpen() {
        this.setState({show:true});
    },
    shareLinkContent(contentURL, contentDescription, contentTitle, imageURL){
        var linkContent = new FBSDKShareLinkContent(contentURL, contentDescription, contentTitle, imageURL);
        FBSDKShareDialog.setContent(linkContent);
        FBSDKShareDialog.validateWithError((error) => {
            if (!error) {
                FBSDKShareDialog.show((sError, result) => {
                    if (!sError) {
                        console.log('shared ok.');
                    } else {
                        console.log('shared failed.');
                    }
                });
            }
        });
    },
    shareHandle(mode){
        let shareInfo = RealmRepo.getShareInfo(this.props.extag, this.props.refImageId);
        if (shareInfo) {
            if (mode == 'wechat') {
                NativeModules.WeChatAPI.shareLinkToTimeLine(
                    'http://arts.things.buzz/share/'
                    + `${this.props.extag}-${this.props.refImageId}-${RealmRepo.Locale().displayLang}.html`,
                    shareInfo.imageUrl,
                    'Arts.Buzz' + '/' + shareInfo.exTitle + '/' + shareInfo.title,
                    null, ()=> {
                    }
                );
            }
            else if (mode == 'facebook') {
                this.shareLinkContent(
                    'http://arts.things.buzz/share/'
                    + `${this.props.extag}-${this.props.refImageId}-${RealmRepo.Locale().displayLang}.html`,
                    '',
                    'Arts.Buzz' + '/' + shareInfo.exTitle + '/' + shareInfo.title,
                    shareInfo.imageUrl
                );
            }
        }
    },
    render: function () {
        let BGWASH = 'rgba(69,86,86,0.1)';
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <WebView
                        style={{
                            backgroundColor: BGWASH,
                            width:Dimensions.get('window').width
                        }}
                        source={{html: this.props.desc, baseUrl: this.props.baseUrl}}
                        scrollEnabled={true}
                        />
                </View>
                <ToolBar {...this.props} sound={this.state.sound} openSheet={this.onOpen} sharedEnabled={this.state.sharedEnabled}/>
                <ActionSheet
                    visible={this.state.show}
                    onCancel={this.onCancel}>
                    {this.state.fbEnabled ?
                        (<ActionSheet.Button
                            onPress={()=>{this.shareHandle('facebook');}}>
                            <AweIcon name={'facebook-square'} size={38} color="#00BFFF"/>
                        </ActionSheet.Button>)
                        : null
                    }
                    {this.state.wcEnabled ?
                        (<ActionSheet.Button
                            onPress={()=>{this.shareHandle('wechat');}}>
                            <AweIcon name={'wechat'} size={35} color="#B8E986"/>
                        </ActionSheet.Button>)
                        : null
                    }
                </ActionSheet>
            </View>
        );
    }
});

var ToolBar = React.createClass({
    mixins:[EventEmitterMixin],
    componentDidMount(){
        this.eventEmitter('on', 'detailClose', ()=> {
            this.releaseThenPop();
        });
    },
    componentWillMount(){
        RNS.headsetDeviceAvailable((v)=>{
            if(v) {
                let user = RealmRepo.getUser();
                if(user) {
                    if (user.autoPlay == 1) {
                        this.replay();
                    }
                }
            }
        });
    },
    getInitialState(){
        let favExists = RealmRepo.favoriteExists(this.props.extag, this.props.refImageId, this.props.refAudioId);
        return {
            icon: favExists ? 'love' : 'icon_love',
            play: false
        }
    },
    releaseThenPop(){
        try {
            this.release();
            Actions.pop();
        }catch(ex) {
            console.log(ex);
        }
    },
    play(){
        RNS.headsetDeviceAvailable((v)=> {
            if (v) {
                // Play the sound with an onEnd callback
                if (this.props.sound) {
                    this.setState({play: true});
                    this.props.sound.play((success) => {
                        if (success) {
                            console.log('successfully finished playing');
                        } else {
                            console.log('playback failed due to audio decoding errors');
                        }

                        this.setState({play: false});
                    });
                }
            }
        });
    },
    replay(){
        this.stop();
        this.play();
    },
    stop(){
        // Stop the sound and rewind to the beginning
        RNS.headsetDeviceAvailable((v)=> {
            if (v) {
                if (this.props.sound) {
                    this.props.sound.stop();
                    this.setState({play: false});
                }
            }
        });
    },
    pause(){
        // Pause the sound
        RNS.headsetDeviceAvailable((v)=> {
            if (v) {
                if (this.props.sound) {
                    this.props.sound.pause();
                    this.setState({play: false});
                }
            }
        });
    },
    release(){
        // Release the audio player resource
        if (this.props.sound) {
            this.props.sound.release();
        }
    },
    render(){
        return (
            <View style={styles.menu}>
                <Button onPress={this.releaseThenPop}>
                    <Image source={{uri:"icon_back"}}
                           style={{width: 20, height: 30}}/>
                </Button>
                <View style={{
                        width:Dimensions.get('window').width-50,
                        flexDirection:'row',
                        alignItems: "center",
                        justifyContent: "space-around",
                        paddingLeft:10
                    }}>
                    { this.props.sharedEnabled ?
                        (
                            <Button onPress={this.props.openSheet}>
                                <Icon name="share" size={35} color="#fff"/>
                            </Button>
                        ) : null
                    }

                    {this.state.play ?
                        (<Button onPress={this.pause}>
                            <Icon name={'pause-circle-outline'} size={35} color="#fff"/>
                        </Button>):
                        (<Button onPress={this.play}>
                            <Icon name={'play-circle-outline'} size={35} color="#fff"/>
                        </Button>)
                    }
                    <Button onPress={this.replay}>
                        <Icon name="replay" size={35} color="#fff"/>
                    </Button>
                    <Button onPress={()=>{
                            if(this.state.icon == 'icon_love'){
                                RealmRepo.writeFavorite(this.props.extag, this.props.refImageId, this.props.refAudioId,()=>{
                                    this.eventEmitter('emit', 'favChange');
                                    this.setState({icon:'love'});
                                });
                            }
                            else{
                                RealmRepo.deleteFavorite(this.props.extag, this.props.refImageId, this.props.refAudioId,()=>{
                                    this.eventEmitter('emit', 'favChange');
                                    this.setState({icon:'icon_love'});
                                });
                            }
                        }}>
                        <Image source={{uri:this.state.icon}}
                               style={{width: 30, height: 30}}/>
                    </Button>
                </View>
            </View>
        );
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 10,
        justifyContent: "center",
        alignItems: "stretch",
        backgroundColor: "#698686"
    },
    menu: {
        flex:1,
        marginLeft:10,
        marginRight:10,
        padding:1,
        flexDirection:'row',
        alignItems: "center",
        justifyContent: "space-between"
    },
    body: {
        flex:9,
        justifyContent: "flex-start",
        alignItems: "center"
    }
});

module.exports = Detail;