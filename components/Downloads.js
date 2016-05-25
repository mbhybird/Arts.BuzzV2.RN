/**
 * Created by NickChung on 4/13/16.
 */
'use strict';

var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    TouchableOpacity,
    Platform,
    Image,
    ActivityIndicatorIOS,
    } = React;

var GiftedListView = require('react-native-gifted-listview');
var GiftedSpinner = require('react-native-gifted-spinner');
import Button from "react-native-button";
var Modal = require('react-native-modalbox');
const TimerMixin = require('react-timer-mixin');
const EventEmitterMixin = require('react-event-emitter-mixin');
const RealmRepo = require("./RealmRepo.js");
var Swipeout = require('react-native-swipeout');

var opExTag = "";

var Downloads = React.createClass({
    mixins:[TimerMixin,EventEmitterMixin],
    _deleteThenReload(){
        RealmRepo.deleteExContent(opExTag,()=>{
            this.refs.modal.close();
            this.refs.lv._refresh();
            this.eventEmitter('emit', 'downloadChanged');
        });
    },
    componentDidMount(){
        this.eventEmitter('on','catalogDownload',()=>{
            this.refs.lv._refresh();
        });
    },
    /**
     * Will be called when refreshing
     * Should be replaced by your own logic
     * @param {number} page Requested page to fetch
     * @param {function} callback Should pass the rows
     * @param {object} options Inform if first load
     */
        _onFetch(page = 1, callback, options) {
        var rows = {};
        rows['header'] = [];
        let catalog = RealmRepo.getCatalog();
        if (catalog != null) {
            catalog.forEach((item)=> {
                let fileCount = item.fileCount;
                let contentCount = item.exContent == null
                    ? 0 : (item.exContent.contents == null) ? 0 : item.exContent.contents.length;

                rows['header'].push({
                    extag: item.extag,
                    title: item.exMaster['title_' + RealmRepo.Locale().displayLang],
                    fileCount: fileCount,
                    finished: (fileCount == contentCount)
                });
            });
        }
        callback(rows);
    },


    /**
     * When a row is touched
     * @param {object} rowData Row data
     */
        _onPress(rowData) {
        //console.log(rowData+' pressed');
        //alert(JSON.stringify(rowData));

        //download exContent
        if(!rowData.finished) {
            this.refs.modalDown.open();
            this.setTimeout(()=> {
                RealmRepo.updateExContent(rowData.extag, ()=> {
                    this.refs.modalDown.close();
                    this.refs.lv._refresh();
                    this.eventEmitter('emit', 'downloadChanged');
                });
            }, 500);
        }
        /*
        else{
            //confirm to delete
            this.refs.modal.open();
            opExTag = rowData.extag;
        }*/
    },
    /**
     * Render a row
     * @param {object} rowData Row data
     */
        _renderRowView(rowData) {
        var innerView = (
            <TouchableOpacity key={`${Math.random()}`}
                                style={customStyles.row}
                                underlayColor='#c8c8c8'
                                onPress={() => this._onPress(rowData)}
                >
                <View style={{
                    flexDirection:'row',
                    justifyContent:'center',
                    alignItems:'center',
                }}>
                    <Image source={{uri:rowData.finished?'dlfinished':'icon_download'}}
                           style={{width: 25, height: 25, margin:5}}/>
                    <View style={{flexWrap:'wrap',width:225}}>
                        <Text style={{fontSize:16,fontWeight:'300'}}>{rowData.title}({rowData.fileCount})</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );

        var wrapperView = (
            <Swipeout right={[{
                        text:RealmRepo.getLocaleValue('lbl_delete'),
                        backgroundColor:'red',
                        onPress:()=>{
                            this.refs.modal.open();
                            opExTag = rowData.extag;
                        }}]}
                      backgroundColor={'#698686'}
                      //autoClose={true}
                      onOpen={()=>{
                        opExTag = rowData.extag;
                        this.refs.lv._refresh();
                       }}
                      close={rowData.extag!=opExTag}>
                {innerView}
            </Swipeout>
        );

        var rowView = rowData.finished ? wrapperView : innerView;
        return (
            rowView
        );
    },

    /**
     * Render a row
     * @param {object} rowData Row data
     */
        _renderSectionHeaderView(sectionData, sectionID) {
        return (
            <View style={customStyles.header} key={`${sectionID}`}>
                <Text style={customStyles.headerTitle}>
                    {sectionID}
                </Text>
            </View>
        );
    },

    /**
     * Render the refreshable view when waiting for refresh
     * On Android, the view should be touchable to trigger the refreshCallback
     * @param {function} refreshCallback The function to call to refresh the listview
     */
        _renderRefreshableWaitingView(refreshCallback) {
        if (Platform.OS !== 'android') {
            return (
                <View style={customStyles.refreshableView}>
                    <Text style={customStyles.actionsLabel}>
                        ↓
                    </Text>
                </View>
            );
        } else {
            return (
                <TouchableHighlight
                    underlayColor='#c8c7cc'
                    onPress={refreshCallback}
                    style={customStyles.refreshableView}
                    >
                    <Text style={customStyles.actionsLabel}>
                        ↻
                    </Text>
                </TouchableHighlight>
            );
        }
    },

    /**
     * Render the refreshable view when the pull to refresh has been activated
     * @platform ios
     */
        _renderRefreshableWillRefreshView() {
        return (
            <View style={customStyles.refreshableView}>
                <Text style={customStyles.actionsLabel}>
                    ↻
                </Text>
            </View>
        );
    },

    /**
     * Render the refreshable view when fetching
     */
        _renderRefreshableFetchingView() {
        return (
            <View style={customStyles.refreshableView}>
                <GiftedSpinner />
            </View>
        );
    },

    /**
     * Render the pagination view when waiting for touch
     * @param {function} paginateCallback The function to call to load more rows
     */
        _renderPaginationWaitingView(paginateCallback) {
        return (
            <TouchableHighlight
                underlayColor='#c8c7cc'
                onPress={paginateCallback}
                style={customStyles.paginationView}
                >
                <Text style={[customStyles.actionsLabel, {fontSize: 13}]}>
                    Load more
                </Text>
            </TouchableHighlight>
        );
    },

    /**
     * Render the pagination view when fetching
     */
        _renderPaginationFetchigView() {
        return (
            <View style={customStyles.paginationView}>
                <GiftedSpinner />
            </View>
        );
    },

    /**
     * Render the pagination view when end of list is reached
     */
        _renderPaginationAllLoadedView() {
        return (
            <View style={customStyles.paginationView}>
                <Text style={customStyles.actionsLabel}>
                    ~
                </Text>
            </View>
        );
    },

    /**
     * Render a view when there is no row to display at the first fetch
     * @param {function} refreshCallback The function to call to refresh the listview
     */
        _renderEmptyView(refreshCallback) {
        return (
            <View style={customStyles.defaultView}>
                <Text style={customStyles.defaultViewTitle}>
                    Sorry, there is no content to display
                </Text>

                <TouchableHighlight
                    underlayColor='#c8c7cc'
                    onPress={refreshCallback}
                    >
                    <Text>
                        ↻
                    </Text>
                </TouchableHighlight>
            </View>
        );
    },

    /**
     * Render a separator between rows
     */
        _renderSeparatorView() {
        return (
            <View style={customStyles.separator} key={`${Math.random()}`} />
        );
    },

    render() {
        return (
            <View style={screenStyles.container}>
                <View style={screenStyles.navBar}>
                    <Text style={screenStyles.navBarTitle}>{RealmRepo.getLocaleValue('lbl_downloads')}</Text>
                </View>
                <GiftedListView
                    ref={"lv"}
                    rowView={this._renderRowView}
                    enableEmptySections={true}
                    onFetch={this._onFetch}
                    initialListSize={12} // the maximum number of rows displayable without scrolling (height of the listview / height of row)

                    firstLoader={false} // display a loader for the first fetching

                    pagination={false} // enable infinite scrolling using touch to load more
                    paginationFetchigView={this._renderPaginationFetchigView}
                    paginationAllLoadedView={this._renderPaginationAllLoadedView}
                    paginationWaitingView={this._renderPaginationWaitingView}

                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    refreshableViewHeight={50} // correct height is mandatory
                    refreshableDistance={40} // the distance to trigger the pull-to-refresh - better to have it lower than refreshableViewHeight
                    refreshableFetchingView={this._renderRefreshableFetchingView}
                    refreshableWillRefreshView={this._renderRefreshableWillRefreshView}
                    refreshableWaitingView={this._renderRefreshableWaitingView}

                    emptyView={()=>{return (<View/>)}}

                    renderSeparator={this._renderSeparatorView}

                    withSections={true} // enable sections
                    //sectionHeaderView={this._renderSectionHeaderView}

                    PullToRefreshViewAndroidProps={{
                        colors: ['#fff'],
                        progressBackgroundColor: '#003e82',
                      }}
                    />

                <Modal style={modelStyle.modal}
                       position={"center"}
                       backdrop={true}
                       ref={"modal"}
                       isDisabled={false}
                       animationDuration={1}>
                    <Text style={modelStyle.text}>{RealmRepo.getLocaleValue('msg_delete_all_files')}</Text>
                    <Button style={modelStyle.btn} onPress={()=>{
                        this._deleteThenReload();
                    }}>{RealmRepo.getLocaleValue('msg_dlg_ok')}</Button>
                </Modal>
                <Modal style={modelStyle.modalDown}
                       backdrop={false}
                       position={"center"}
                       ref={"modalDown"}
                       isDisabled={false}
                       animationDuration={1}>
                    <ActivityIndicatorIOS
                        size="large"
                        color="#aa3300"
                        />
                    <Text style={modelStyle.text}>{RealmRepo.getLocaleValue('msg_file_downloading')}</Text>
                </Modal>
            </View>
        );
    }
});


var customStyles = {
    separator: {
        height: 1,
        backgroundColor: '#CCC'
    },
    refreshableView: {
        height: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsLabel: {
        fontSize: 20,
        color: '#007aff',
    },
    paginationView: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    defaultView: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    defaultViewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    row: {
        padding:3,
        margin:3,
        height:50,
        alignItems:'stretch'
    },
    header: {
        backgroundColor: '#50a4ff',
        padding: 10,
    },
    headerTitle: {
        color: '#fff',
    },
};

var modelStyle={
    modal: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height:150,
        width:250
    },
    modalDown: {
        justifyContent: 'space-around',
        alignItems: 'center',
        height:150,
        width:250
    },
    text: {
        color: "black",
        fontSize: 22
    },
    btn: {
        margin: 10,
        backgroundColor: "#3B5998",
        color: "white",
        padding: 10
    }
};

var screenStyles = {
    container: {
        flex: 1,
        backgroundColor: '#698686',
    },
    navBar: {
        height: 64,
        backgroundColor: '#698686',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBarTitle: {
        color: '#fff',
        fontSize: 30,
        fontWeight:'bold',
        marginTop: 12,
    }
};

module.exports = Downloads;