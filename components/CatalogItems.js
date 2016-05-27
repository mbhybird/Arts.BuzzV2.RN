/**
 * Created by NickChung on 4/14/16.
 */
var React = require('react-native');
var { StyleSheet, View,Text,Image,Dimensions,WebView,NetInfo } = React;
var Swiper = require('react-native-swiper');
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
const TimerMixin = require('react-timer-mixin');
const RNFS = require('react-native-fs');

var networkState = false;

NetInfo.isConnected.fetch().then(isConnected => {
    if(isConnected) {
        fetch('http://arts.things.buzz/download/')
            .then((res)=> {
                networkState = res.ok;
            });
    }
});

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
            catalogList: this.getCatalogList()
        }
    },
    getCatalogList(){
        var catalogList = [{
            opacity: 0,
            imageUri: 'macaudefault',
            desc: RealmRepo.getLocaleValue('main_about'),
            exTag: 'macaudefault'
        }];

        let catalog = RealmRepo.getCatalog();

        if (catalog) {
            catalogList = [];
            catalog.forEach((item)=> {
                let fileCount = item.fileCount;
                let contentCount = item.exContent == null
                    ? 0 : (item.exContent.contents == null) ? 0 : item.exContent.contents.length;

                let clientPath = RNFS.DocumentDirectoryPath + item.exMaster.content.clientpath + item.exMaster.content.filename;
                let serverPath = item.exMaster.content.serverpath;
                let imagePath = networkState ? serverPath : clientPath;
                catalogList.push({
                    opacity: ((fileCount == contentCount) && (item.localVersion == item.serverVersion)) ? 0 : 100,
                    imageUri: imagePath,
                    desc: item.exMaster["description_" + RealmRepo.Locale().displayLang],
                    exTag: item.extag
                });
            });
        }

        updateCatList =  catalogList;
        return catalogList;
    },
    handleReload(){
        this.setTimeout(
            () => {
                if (this.state.catalogList[0].imageUri == 'macaudefault') {
                    this.setState({catalogList: this.getCatalogList()});
                    this.handleReload();
                }
                else {
                    this.setTimeout(
                        () => {
                            this.eventEmitter('emit', 'iconShow', {
                                opacity: this.state.catalogList[0].opacity,
                                exTag: this.state.catalogList[0].exTag
                            });
                        }
                        , 500);
                }
            }
            , 100);
    },
    componentWillMount(){
        this.handleReload();
    },
    componentDidMount(){
        this.eventEmitter('on', 'downloadChanged', ()=> {
            this.getCatalogList();
            this.eventEmitter('emit', 'iconShow', {
                opacity: updateCatList[curIndex].opacity,
                exTag: updateCatList[curIndex].exTag
            });
            this.eventEmitter('emit', 'catalogDownload');
        });

        this.eventEmitter('on', 'localeChanged', ()=> {
            this.setState({catalogList: this.getCatalogList()});
        });
    },
    _onMomentumScrollEnd: function (e, state, context) {
        try {
            this.eventEmitter('emit', 'iconShow', {
                opacity: updateCatList[state.index].opacity,
                exTag: updateCatList[state.index].exTag
            });
        }catch(ex){

        }

        curIndex = state.index;
    },
    render: function () {
        let BGWASH = 'rgba(69,86,86,0.01)';
        let catalogView = this.state.catalogList.map((item, index) => {
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
                        source={{html: item.desc}}
                        scrollEnabled={true}
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
                        dot={<View style={{backgroundColor:'rgba(0,0,0,.2)', width: 5, height: 5,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                        activeDot={<View style={{backgroundColor: '#007aff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
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