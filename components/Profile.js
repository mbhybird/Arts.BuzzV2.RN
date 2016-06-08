/**
 * Created by NickChung on 6/1/16.
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
    NativeAppEventEmitter,
    NativeModules,
    } = React;

var GiftedListView = require('react-native-gifted-listview');
var GiftedSpinner = require('react-native-gifted-spinner');
const RealmRepo = require("./RealmRepo.js");
var WeChatAPI = require('react-native-wx/index.js');
var FBLoginManager = require('NativeModules').FBSDKLoginManager;
var FBSDKCore = require('react-native-fbsdkcore');
var {FBSDKAccessToken,FBSDKGraphRequest} = FBSDKCore;
import Icon from 'react-native-vector-icons/FontAwesome';

var Profile = React.createClass({
    facebookLoginHandle: function (error, result) {
        var self = this;
        if (result && result.name) {
            RealmRepo.linkFacebookProfile(JSON.stringify(result));
            try {
                self.refs.lv._refresh();
            }catch(ex){
                console.log(ex);
            }
        }
    },
    componentDidMount: function () {
        var self = this;
        NativeAppEventEmitter.addListener('WeChat_Resp', (resp)=> {
            NativeModules.AppLogin.wxLoginWithRespInfo(resp, (data)=> {
                if(data && data.nickname) {
                    RealmRepo.linkWeChatProfile(JSON.stringify(data));
                    try {
                        self.refs.lv._refresh();
                    }catch(ex){
                        console.log(ex);
                    }
                }
            })
        });
    },
    facebookLogin: function () {
        var self = this;
        FBLoginManager.logInWithReadPermissions(['email','public_profile','user_friends'], function (error, data) {
            if (!error) {
                FBSDKAccessToken.getCurrentAccessToken((event)=> {
                    if (event) {
                        var profileRequest = new FBSDKGraphRequest(
                            self.facebookLoginHandle,
                            '/' + event.userID,
                            {
                                type: {string: 'public_profile'},
                                fields: {string: 'id,name,picture,gender'}
                            }
                        );
                        profileRequest.start();
                    }
                });
            } else {
                console.log(error, data);
            }
        });
    },
    weChatLogin: function () {
        WeChatAPI.login();
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
        var profile = [
            {title:RealmRepo.getLocaleValue('lbl_link_to_wechat'), linked: false, mode: 'wechat'},
            {title:RealmRepo.getLocaleValue('lbl_link_to_facebook'), linked: false, mode: 'facebook'}
        ];
        let user = RealmRepo.getUser();
        if(user) {
            if(user.wcProfile){
                let jsonObject = JSON.parse(user.wcProfile);
                if (jsonObject) {
                    profile[0].title = jsonObject.nickname;
                    profile[0].linked = true;
                }
            }

            if (user.fbProfile) {
                let jsonObject = JSON.parse(user.fbProfile);
                if (jsonObject) {
                    profile[1].title = jsonObject.name;
                    profile[1].linked = true;
                }
            }
        }

        rows['header'] = [];
        for (var item of profile) {
            rows['header'].push(item);
        }
        callback(rows);
    },


    /**
     * When a row is touched
     * @param {object} rowData Row data
     */
        _onPress(rowData) {
        if (rowData.mode == 'wechat') {
            this.weChatLogin();
        }
        else if (rowData.mode == 'facebook') {
            this.facebookLogin();
        }
    },

    /**
     * Render a row
     * @param {object} rowData Row data
     */
        _renderRowView(rowData) {
        return (
            <TouchableOpacity key={`${Math.random()}`}
                              style={customStyles.row}
                              underlayColor='#c8c8c8'
                              onPress={() => this._onPress(rowData)}
                >
                <View style={{
                    flexDirection:'row',
                    justifyContent:'center',
                    alignItems:'center'
                }}>
                    <Icon name={rowData.mode == 'wechat'? 'wechat' : 'facebook-square'} size={40} color={
                        rowData.linked ? (rowData.mode == 'wechat' ? '#B8E986':'#00BFFF') : '#FFF'
                    }/>
                    <View style={{flexWrap:'wrap',width:200,paddingLeft:10}}>
                        <Text style={{fontSize:18,fontWeight:'300'}}>{rowData.title}</Text>
                    </View>
                </View>
            </TouchableOpacity>
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
                    <Text style={screenStyles.navBarTitle}>{RealmRepo.getLocaleValue('lbl_profile')}</Text>
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
                        progressBackgroundColor: '#003e82'
                      }}
                    />
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
        alignItems: 'center'
    },
    actionsLabel: {
        fontSize: 20,
        color: '#007aff'
    },
    paginationView: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },
    defaultView: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    defaultViewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15
    },
    row: {
        padding:3,
        margin:3,
        height:50,
        alignItems:'stretch'
    },
    header: {
        backgroundColor: '#50a4ff',
        padding: 10
    },
    headerTitle: {
        color: '#fff'
    }
};

var screenStyles = {
    container: {
        flex: 1,
        backgroundColor: '#698686'
    },
    navBar: {
        height: 64,
        backgroundColor: '#698686',
        justifyContent: 'center',
        alignItems: 'center'
    },
    navBarTitle: {
        color: '#fff',
        fontSize: 30,
        fontWeight:'bold',
        marginTop: 12
    }
};

module.exports = Profile;