/**
 * Created by NickChung on 4/14/16.
 */

var React = require('react-native');
var { StyleSheet, View,Text,Image,Dimensions,WebView,NativeModules,NativeAppEventEmitter,Alert,DeviceEventEmitter} = React;
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
const History  = require("./History.js");

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
    mixins:[EventEmitterMixin],
    initSound(audioPath){
        if(audioPath) {
            let s = new Sound(audioPath, null, (e) => {
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

            return s;
        }
        else {
            return null;
        }
    },
    initShare(){
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

        return {fbEnabled, wcEnabled, sharedEnabled};
    },
    getInitialState(){
        return {
            sound: this.initSound(this.props.audioPath),
            show: false,
            ...this.initShare()
        }
    },
    onCancel() {
        this.setState({show:false});
    },
    onOpen() {
        this.setState({show:true});
    },
    shareOK(){
        Alert.alert(
            RealmRepo.getLocaleValue('msg_dlg_title_tips'),
            RealmRepo.getLocaleValue('lbl_share_ok'),
            [
                {text: RealmRepo.getLocaleValue('msg_dlg_ok')}
            ]
        );
    },
    shareLinkContent(contentURL, contentDescription, contentTitle, imageURL){
        var self = this;
        var linkContent = new FBSDKShareLinkContent(contentURL, contentDescription, contentTitle, imageURL);
        FBSDKShareDialog.setContent(linkContent);
        FBSDKShareDialog.validateWithError((error) => {
            if (!error) {
                FBSDKShareDialog.show((sError, result) => {
                    if (!sError) {
                        if(result.postId) {
                            console.log('shared ok.');
                            self.onCancel();
                            self.shareOK();
                        }
                    } else {
                        console.log('shared failed.');
                    }
                });
            }
        });
    },
    componentDidMount(){
        var self = this;
        NativeAppEventEmitter.addListener('WeChat_Resp', (resp)=> {
            if (resp.errCode == 0 && resp.type == 'SendMessageToWX.Resp') {
                self.onCancel();
                self.shareOK();
            }
        });

        this.eventEmitter('on', 'refreshDetail', (params)=> {
            this.setState({sound: this.initSound(params.audioPath),...this.initShare()});
            this.eventEmitter('emit', 'autoPlay');
            Actions.refresh(params);
            this.eventEmitter('emit', 'refreshFavState');
        });
    },
    shareHandle(mode){
        let shareInfo = RealmRepo.getShareInfo(this.props.extag, this.props.refImageId);
        if (shareInfo) {
            if (mode == 'wechat') {
                NativeModules.WeChatAPI.shareLinkToTimeLine(
                    'http://arts.things.buzz/Share.html?'
                    + `exTag=${this.props.extag}&refImageId=${this.props.refImageId}&locale=${RealmRepo.Locale().displayLang}`,
                    shareInfo.imageUrl,
                    shareInfo.title + '@' + shareInfo.exTitle,
                    null, ()=> {
                    }
                );
            }
            else if (mode == 'facebook') {
                this.shareLinkContent(
                    'http://arts.things.buzz/Share.html?'
                    + `exTag=${this.props.extag}&refImageId=${this.props.refImageId}&locale=${RealmRepo.Locale().displayLang}`,
                    '',
                    shareInfo.title + '@' + shareInfo.exTitle,
                    shareInfo.imageUrl
                );
            }
        }
    },
    render: function () {
        let BGWASH = 'rgba(69,86,86,0.1)';
        let user = RealmRepo.getUser();
        var appUserId = "";
        var descHtml = "";
        if(user) {
            appUserId = user.userId;
        }
        if(this.props.desc) {
            descHtml = this.props.desc.replace("{appuser}", appUserId);
            descHtml = descHtml.replace("{locale}", RealmRepo.Locale().displayLang);
        }
        return (
            <View style={styles.container}>
                <View style={styles.body}>
                    <WebView
                        style={{
                            backgroundColor: BGWASH,
                            width:Dimensions.get('window').width
                        }}
                        source={{html: descHtml, baseUrl: this.props.baseUrl}}
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
                            <Text style={{fontSize:20,fontFamily:'TrebuchetMS'}}>{RealmRepo.getLocaleValue('lbl_share_to_facebook')}</Text>
                        </ActionSheet.Button>)
                        : null
                    }
                    {this.state.wcEnabled ?
                        (<ActionSheet.Button
                            onPress={()=>{this.shareHandle('wechat');}}>
                            <AweIcon name={'wechat'} size={28} color="#B8E986"/>
                            <Text style={{fontSize:20,fontFamily:'TrebuchetMS'}}>{RealmRepo.getLocaleValue('lbl_share_to_wechat')}</Text>
                        </ActionSheet.Button>)
                        : null
                    }
                    <ActionSheet.Button>
                        {RealmRepo.getLocaleValue('lbl_share')}
                    </ActionSheet.Button>
                </ActionSheet>
            </View>
        );
    }
});

var ToolBar = React.createClass({
    mixins:[EventEmitterMixin],
    autoPlay(){
        /*
        RNS.headsetDeviceAvailable((v)=>{
            let user = RealmRepo.getUser();
            if (user) {
                if (user.autoPlay == 1) {
                    if (user.earphonePlay == 1) {
                        if (v) {
                            this.replay();
                        }
                    }
                    else {
                        this.replay();
                    }
                }
                else{
                    this.setState({play: false});
                }
            }
        });*/
    },
    componentDidMount(){
        this.eventEmitter('on', 'detailClose', ()=> {
            this.releaseThenBack();
        });
        this.eventEmitter('on', 'autoPlay', ()=> {
            this.autoPlay();
        });
        this.eventEmitter('on', 'refreshFavState', ()=> {
            let favExists = RealmRepo.favoriteExists(this.props.extag, this.props.refImageId, this.props.refAudioId);
            this.setState({icon: favExists ? 'liked' : 'favorite', play: false});
            if (this.props.mode == 'auto') {
                this.replay();
            }
        });

        var subscription = DeviceEventEmitter.addListener(
            'HeadphoneBreak',
            () => {
                this.pause();
            });

        var subscriptionPhoneCallBegan = DeviceEventEmitter.addListener(
            'PhoneCallBegan',
            () => {
                this.stop();
                History.phoneCallState = 1;
                //console.log('state=>' + History.phoneCallState);
            });

        var subscriptionPhoneCallEnd = DeviceEventEmitter.addListener(
            'PhoneCallEnd',
            () => {
                History.phoneCallState = 0;
                //console.log('state=>' + History.phoneCallState);
            });
    },
    componentWillMount(){
        this.autoPlay();
    },
    getInitialState(){
        let favExists = RealmRepo.favoriteExists(this.props.extag, this.props.refImageId, this.props.refAudioId);
        return {
            icon: favExists ? 'liked' : 'favorite',
            play: false
        }
    },
    releaseThenBack(){
        try {
            this.release();
            if(this.props.from == 'leftMenuBall'){
                Actions.ball();
            }
            else if(this.props.from == 'leftMenuCatalog') {
                Actions.home();
            }
            else if(this.props.from == 'preview') {
                Actions.preview();
            }
        } catch (ex) {
            console.log(ex);
        }
    },
    play(){
        if (History.phoneCallState == 0) {
            RNS.headsetDeviceAvailable((v)=> {
                let user = RealmRepo.getUser();
                if (user.earphonePlay == 1) {
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
                    else{
                        Alert.alert(
                            RealmRepo.getLocaleValue('msg_dlg_title_tips'),
                            RealmRepo.getLocaleValue('msg_connect_headset'),
                            [
                                {
                                    text: RealmRepo.getLocaleValue('msg_dlg_ok')
                                }
                            ]
                        );
                    }
                }
                else {
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
        }
    },
    replay(){
        this.stop();
        this.play();
    },
    stop(){
        // Stop the sound and rewind to the beginning
        //RNS.headsetDeviceAvailable((v)=> {
            //if (v) {
                if (this.props.sound) {
                    this.props.sound.stop();
                    this.setState({play: false});
                }
            //}
        //});
    },
    pause(){
        // Pause the sound
        //RNS.headsetDeviceAvailable((v)=> {
            //if (v) {
                if (this.props.sound) {
                    this.props.sound.pause();
                    this.setState({play: false});
                }
            //}
        //});
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
                <Button onPress={this.releaseThenBack}>
                    <Image source={{uri:"back"}}
                           style={{width: 35, height: 35}}/>
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
                                <Image source={{uri:"share"}}
                                       style={{width: 27, height: 40}}/>
                            </Button>
                        ) : null
                    }

                    {this.state.play ?
                        (<Button onPress={this.pause}>
                            <Image source={{uri:"pause"}}
                                   style={{width: 35, height: 35}}/>
                        </Button>):
                        (<Button onPress={this.play}>
                            <Image source={{uri:"play"}}
                                   style={{width: 35, height: 35}}/>
                        </Button>)
                    }
                    <Button onPress={this.replay}>
                        <Image source={{uri:"replay"}}
                               style={{width: 35, height: 35}}/>
                    </Button>
                    <Button onPress={()=>{
                            if(this.state.icon == 'favorite'){
                                RealmRepo.writeFavorite(this.props.extag, this.props.refImageId, this.props.refAudioId,()=>{
                                    this.eventEmitter('emit', 'favChange');
                                    this.setState({icon:'liked'});
                                });
                            }
                            else{
                                RealmRepo.deleteFavorite(this.props.extag, this.props.refImageId, this.props.refAudioId,()=>{
                                    this.eventEmitter('emit', 'favChange');
                                    this.setState({icon:'favorite'});
                                });
                            }
                        }}>
                        <Image source={{uri:this.state.icon}}
                               style={{width: 35, height: 35}}/>
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