/**
 * Created by NickChung on 4/14/16.
 */
var React = require('react-native');
var { StyleSheet, View,Text,Image,Dimensions,WebView,NetInfo,Linking } = React;
var Swiper = require('react-native-swiper');
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
const TimerMixin = require('react-timer-mixin');
const RNFS = require('react-native-fs');

var curIndex  = 0;
var updateCatList = null;

var CatalogItems = React.createClass({
    render(){
        return (
            <SwiperComp/>
        );
    }
});

var SwiperComp = React.createClass({
    mixins:[EventEmitterMixin,TimerMixin],
    getInitialState(){
        return {
            catalogList: this.getDefaultCatalogList()
        }
    },
    getDefaultCatalogList(){
        return [{
            opacity: 0,
            imageUri: 'macaudefault',
            desc: RealmRepo.getLocaleValue('main_about'),
            exTag: 'macaudefault',
            versionMatch: true,
            dateFrom: null
        }];
    },
    handleReload(){
        this.setTimeout(
            () => {
                if (this.state.catalogList[0] && this.state.catalogList[0].imageUri == 'macaudefault') {
                    this.setState({catalogList: this.getUpdateCatalogList()});
                    this.handleReload();
                }
                else {
                    if(this.state.catalogList[0]) {
                        this.setTimeout(
                            () => {
                                this.eventEmitter('emit', 'iconShow', {
                                    opacity: this.state.catalogList[0].opacity,
                                    exTag: this.state.catalogList[0].exTag,
                                    versionMatch: this.state.catalogList[0].versionMatch
                                });
                            }
                            , 500);
                    }
                    else{
                        this.setState({catalogList: this.getDefaultCatalogList()});
                        this.handleReload();
                    }
                }
            }
            , 500);
    },
    componentWillMount(){
        this.eventEmitter('on', 'unzipCatalogCompleted', ()=> {
            this.handleReload();
        });
    },
    getUpdateCatalogList(){
        var catalogList = [];
        let catalog = RealmRepo.getCatalog();
        if (catalog) {
            catalog.forEach((item)=> {
                let fileCount = item.fileCount;
                let contentCount = item.exContent == null
                    ? 0 : (item.exContent.contents == null) ? 0 : item.exContent.contents.length;

                let clientPath = RNFS.DocumentDirectoryPath + item.exMaster.content.clientpath + item.exMaster.content.filename;
                catalogList.push({
                    opacity: (fileCount == contentCount) ? 0 : 100,
                    imageUri: clientPath,
                    desc: item.exMaster["description_" + RealmRepo.Locale().displayLang],
                    exTag: item.extag,
                    versionMatch: item.localVersion == item.serverVersion,
                    dateFrom: item.exMaster.datefrom
                });
            });
        }

        let sortedCatalog = _.orderBy(catalogList, ['dateFrom'], ['desc']);
        updateCatList = sortedCatalog;
        return sortedCatalog;
    },
    componentDidMount(){
        this.eventEmitter('on', 'downloadChanged', ()=> {
            this.getUpdateCatalogList();
            this.eventEmitter('emit', 'iconShow', {
                opacity: updateCatList[curIndex].opacity,
                exTag: updateCatList[curIndex].exTag,
                versionMatch: updateCatList[curIndex].versionMatch
            });
            this.eventEmitter('emit', 'catalogDownload');
        });

        this.eventEmitter('on', 'localeChanged', ()=> {
            this.setState({catalogList: this.getUpdateCatalogList()});
        });
    },
    _onMomentumScrollEnd: function (e, state, context) {
        try {
            this.eventEmitter('emit', 'iconShow', {
                opacity: updateCatList[state.index].opacity,
                exTag: updateCatList[state.index].exTag,
                versionMatch: updateCatList[state.index].versionMatch
            });
        }catch(ex){

        }

        curIndex = state.index;
    },
    onShouldStartLoadWithRequest: function(event) {
        if(event.url.indexOf('http://')>=0 || event.url.indexOf('https://')>=0){
            Linking.canOpenURL(event.url).then(supported => {
                if (supported) {
                    Linking.openURL(event.url);
                }
            });
            return false;
        }
        return true;
    },
    render: function () {
        let BGWASH = 'rgba(69,86,86,0.01)';
        let user = RealmRepo.getUser();
        var appUserId = "";
        var descHtml = "";
        if(user) {
            appUserId = user.userId;
        }
        let catalogView = this.state.catalogList.map((item, index) => {
            if(item.desc) {
                descHtml = item.desc.replace("{appuser}", appUserId);
                descHtml = descHtml.replace("{locale}", RealmRepo.Locale().displayLang);
            }
            return (
                <View key={index} style={{flex:1}}>
                    <Image
                        source={{
                        height:200,
                        uri:item.imageUri,
                        sizeMode:'stretch'
                    }}/>
                    <WebView
                        style={{
                                backgroundColor: BGWASH,
                                height:420
                            }}
                        source={{html: descHtml, baseUrl: item.imageUri.substring(0,item.imageUri.lastIndexOf('/') + 1)}}
                        scrollEnabled={true}
                        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
                        />
                </View>
            );
        });

        return (
            <View>
                <Swiper height={Dimensions.get('window').height-80}
                        showsButtons={false}
                        loop={true}
                        onMomentumScrollEnd={this._onMomentumScrollEnd}
                        dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: 5, height: 5,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                        activeDot={<View style={{backgroundColor: '#007aff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
                        paginationStyle={{
                        top:-(Dimensions.get('window').height-480),
                        justifyContent:'flex-end'
                      }}
                    >
                    {catalogView}
                </Swiper>
            </View>
        );
    }
});

module.exports = CatalogItems;