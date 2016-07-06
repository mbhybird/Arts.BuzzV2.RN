/**
 * Created by NickChung on 4/27/16.
 */
'use strict';

var React = require('react-native');
var DeviceInfo = require('react-native-device-info');
var moment = require('moment');
const Realm = require('realm');
const FileMgr = require("./FileMgr.js");
const RNFS = require('react-native-fs');
var _ = require('lodash');

class Favorites{};
Favorites.schema = {
    name: 'Favorites',
    properties: {
        extag: {type: 'string'},
        refImageId: {type: 'string'},
        refAudioId: {type: 'string'}
    }
};

class Content{};
Content.schema = {
    name: 'Content',
    properties: {
        extag: {type: 'string'},
        usage: {type: 'string', optional: true},
        contenttype: {type: 'int'},
        serverpath: {type: 'string'},
        clientpath: {type: 'string'},
        filename: {type: 'string'},
        description_cn: {type: 'string', optional: true},
        description_en: {type: 'string', optional: true},
        description_tw: {type: 'string', optional: true},
        description_pt: {type: 'string', optional: true},
        title_cn: {type: 'string', optional: true},
        title_en: {type: 'string', optional: true},
        title_tw: {type: 'string', optional: true},
        title_pt: {type: 'string', optional: true},
        artist_cn: {type: 'string', optional: true},
        artist_en: {type: 'string', optional: true},
        artist_tw: {type: 'string', optional: true},
        artist_pt: {type: 'string', optional: true},
        year: {type: 'int', optional: true},
        contentid: {type: 'string'},
        range: {type: 'int'}
    }
};

class ExMaster{};
ExMaster.schema = {
    name: 'ExMaster',
    properties: {
        extag: {type: 'string'},
        description_cn: {type: 'string'},
        description_en: {type: 'string'},
        description_pt: {type: 'string'},
        description_tw: {type: 'string'},
        title_cn: {type: 'string'},
        title_en: {type: 'string'},
        title_tw: {type: 'string'},
        title_pt: {type: 'string'},
        datefrom: {type: 'string'},
        dateto: {type: 'string'},
        website: {type: 'string', optional: true},
        location: {type: 'string', optional: true},
        creator: {type: 'string'},
        publish: {type: 'string'},
        content: {type: 'Content'}
    }
};

class TriggerContent{};
TriggerContent.schema = {
    name:'TriggerContent',
    properties: {
        extag: {type: 'string'},
        trigger: {type: 'Trigger'},
        content: {type: 'Content'}
    }
};

class Beacon{};
Beacon.schema = {
    name:'Beacon',
    properties: {
        extag: {type: 'string'},
        beaconid: {type: 'string'},
        displayname: {type: 'string'},
        major: {type: 'int'},
        minor: {type: 'int'},
        priority: {type: 'int'},
        effectiverangein: {type: 'int'},
        effectiverangeout: {type: 'int'},
        throughrange: {type: 'int'},
        effectiverangein_back: {type: 'int'},
        effectiverangeout_back: {type: 'int'},
        throughrange_back: {type: 'int'},
        usage: {type: 'string'},
        rangedirection: {type: 'string'},
        triggercontent: {type: 'list', objectType: 'TriggerContent'}
    }
};

class Trigger{};
Trigger.schema = {
  name:'Trigger',
  properties: {
      extag: {type: 'string'},
      triggertype: {type: 'int'},
      triggercount: {type: 'int'},
      triggerfrequency: {type: 'int'},
      triggerid: {type: 'string'}
  }
};

class ExContent{};
ExContent.schema = {
    name:'ExContent',
    properties: {
        extag: {type: 'string'},
        beacons: {type: 'list', objectType: 'Beacon'},
        contents: {type: 'list', objectType: 'Content'}
    }
};

class Config{};
Config.schema = {
  name:'Config',
    properties: {
        userId: {type: 'string'},
        autoPlay: {type: 'int'},
        password: {type: 'string'},
        nickName: {type: 'string'},
        email: {type: 'string'},
        displayLang: {type: 'int'},
        voiceLang: {type: 'int'},
        firstTimeLogin: {type: 'int'},
        fbProfile: {type: 'string', optional: true},
        wcProfile: {type: 'string', optional: true}
    }
};

class Catalog{};
Catalog.schema = {
    name:'Catalog',
    properties: {
        extag: {type: 'string'},
        fileCount: {type: 'int'},
        exMaster: {type: 'ExMaster'},
        exContent: {type: 'ExContent'},
        localVersion: {type: 'string'},
        serverVersion: {type: 'string'}
    }
};

class Download{};
Download.schema = {
  name:'Download',
    properties: {
        appVersion: {type: 'string'},
        dataVersion: {type: 'string'},
        catalog: {type: 'list', objectType: 'Catalog'}
    }
};

class Resources{};
Resources.schema = {
    name: 'Resources',
    properties: {
        key: {type: 'string'},
        locale: {type: 'string'},
        value: {type: 'string'}
    }
};

let realm = new Realm({
    schema: [
        Favorites,
        ExMaster,
        Beacon,
        Trigger,
        Content,
        TriggerContent,
        ExContent,
        Catalog,
        Download,
        Config,
        Resources
    ]
});

const ResourcesInit = [];
ResourcesInit.push({key: 'main_about', locale: 'en', value: '"Arts.Buzz" brings buzz to arts and cultural pieces, and it is one of the first Internet of Things application to the art and cultural world. Macau Arts provides audio and visual information for the things of interested, and acts as your personal guide so you can get extra information while enjoying the arts.'});
ResourcesInit.push({key: 'main_about', locale: 'pt', value: '"Arts.Buzz" brings buzz to arts and cultural pieces, and it is one of the first Internet of Things application to the art and cultural world. Macau Arts provides audio and visual information for the things of interested, and acts as your personal guide so you can get extra information while enjoying the arts.'});
ResourcesInit.push({key: 'main_about', locale: 'cn', value: '“鸣”把艺术展品融入到物联网的世界，为展品提供文字，图像和语音资讯，它将作为你的个人导赏员。'});
ResourcesInit.push({key: 'main_about', locale: 'tw', value: '“鳴”把藝術展品帶到物聯綱世界，為展品提供文字，圖象及語音資訊，它將作為你的個人導賞員。'});
ResourcesInit.push({key: 'lbl_downloads',locale:'en', value:'Downloads'});
ResourcesInit.push({key: 'lbl_downloads',locale:'pt', value:'Downloads'});
ResourcesInit.push({key: 'lbl_downloads',locale:'cn', value:'展览下载'});
ResourcesInit.push({key: 'lbl_downloads',locale:'tw', value:'展覽下載'});
ResourcesInit.push({key: 'lbl_my_collections',locale:'en', value:'My Collections'});
ResourcesInit.push({key: 'lbl_my_collections',locale:'pt', value:'Minhas coleções'});
ResourcesInit.push({key: 'lbl_my_collections',locale:'cn', value:'展品收藏'});
ResourcesInit.push({key: 'lbl_my_collections',locale:'tw', value:'展品收藏'});
ResourcesInit.push({key: 'lbl_setting_auto_play',locale:'en', value:'Auto play'});
ResourcesInit.push({key: 'lbl_setting_auto_play',locale:'pt', value:'Tocar automaticamente'});
ResourcesInit.push({key: 'lbl_setting_auto_play',locale:'cn', value:'自动播放'});
ResourcesInit.push({key: 'lbl_setting_auto_play',locale:'tw', value:'自動播放'});
ResourcesInit.push({key: 'lbl_system_display_lang',locale:'en', value:'Display'});
ResourcesInit.push({key: 'lbl_system_display_lang',locale:'pt', value:'Exibição'});
ResourcesInit.push({key: 'lbl_system_display_lang',locale:'cn', value:'显示语言'});
ResourcesInit.push({key: 'lbl_system_display_lang',locale:'tw', value:'顯示語言'});
ResourcesInit.push({key: 'lbl_system_voice_lang',locale:'en', value:'Audio'});
ResourcesInit.push({key: 'lbl_system_voice_lang',locale:'pt', value:'Áudio'});
ResourcesInit.push({key: 'lbl_system_voice_lang',locale:'cn', value:'播放语言'});
ResourcesInit.push({key: 'lbl_system_voice_lang',locale:'tw', value:'播放語言'});
ResourcesInit.push({key: 'msg_file_downloading',locale:'en', value:'Files downloading...'});
ResourcesInit.push({key: 'msg_file_downloading',locale:'pt', value:'Arquivo downloading...'});
ResourcesInit.push({key: 'msg_file_downloading',locale:'cn', value:'文件下载中...'});
ResourcesInit.push({key: 'msg_file_downloading',locale:'tw', value:'檔案下載中...'});
ResourcesInit.push({key: 'lb_setting',locale:'en', value:'Setting'});
ResourcesInit.push({key: 'lb_setting',locale:'pt', value:'Configuração'});
ResourcesInit.push({key: 'lb_setting',locale:'cn', value:'设置'});
ResourcesInit.push({key: 'lb_setting',locale:'tw', value:'設置'});
ResourcesInit.push({key: 'msg_delete_all_files',locale:'en', value:'Are you sure delete all the files?'});
ResourcesInit.push({key: 'msg_delete_all_files',locale:'pt', value:'É claro que apagar todos os arquivos?'});
ResourcesInit.push({key: 'msg_delete_all_files',locale:'cn', value:'你确认删除所有的文件?'});
ResourcesInit.push({key: 'msg_delete_all_files',locale:'tw', value:'你確認刪除所有的檔案?'});
ResourcesInit.push({key: 'msg_dlg_ok',locale:'en', value:'Okay'});
ResourcesInit.push({key: 'msg_dlg_ok',locale:'pt', value:'Está bem'});
ResourcesInit.push({key: 'msg_dlg_ok',locale:'cn', value:'确定'});
ResourcesInit.push({key: 'msg_dlg_ok',locale:'tw', value:'確定'});
ResourcesInit.push({key: 'lbl_delete',locale:'en', value:'Delete'});
ResourcesInit.push({key: 'lbl_delete',locale:'pt', value:'excluir'});
ResourcesInit.push({key: 'lbl_delete',locale:'cn', value:'删除'});
ResourcesInit.push({key: 'lbl_delete',locale:'tw', value:'刪除'});
ResourcesInit.push({key: 'msg_delete_favorite',locale:'en', value:'Are you sure delete the item?'});
ResourcesInit.push({key: 'msg_delete_favorite',locale:'pt', value:'É claro que excluir o item?'});
ResourcesInit.push({key: 'msg_delete_favorite',locale:'cn', value:'你确认删除该收藏吗?'});
ResourcesInit.push({key: 'msg_delete_favorite',locale:'tw', value:'你確認刪除該收藏嗎?'});
ResourcesInit.push({key: 'msg_bt_is_not_ready',locale:'en', value:'Bluetooth is not ready!'});
ResourcesInit.push({key: 'msg_bt_is_not_ready',locale:'pt', value:'O Bluetooth não está Pronto!'});
ResourcesInit.push({key: 'msg_bt_is_not_ready',locale:'cn', value:'蓝牙没有打开!'});
ResourcesInit.push({key: 'msg_bt_is_not_ready',locale:'tw', value:'藍牙沒有打開!'});
ResourcesInit.push({key: 'msg_dlg_title_tips',locale:'en', value:'Tips'});
ResourcesInit.push({key: 'msg_dlg_title_tips',locale:'pt', value:'Dicas'});
ResourcesInit.push({key: 'msg_dlg_title_tips',locale:'cn', value:'提示'});
ResourcesInit.push({key: 'msg_dlg_title_tips',locale:'tw', value:'提示'});
ResourcesInit.push({key: 'msg_network_connect_fail',locale:'en', value:'Network is not connected!'});
ResourcesInit.push({key: 'msg_network_connect_fail',locale:'pt', value:'Rede não está conectado!'});
ResourcesInit.push({key: 'msg_network_connect_fail',locale:'cn', value:'网络没有连接!'});
ResourcesInit.push({key: 'msg_network_connect_fail',locale:'tw', value:'網絡沒有連接!'});
ResourcesInit.push({key: 'lbl_profile',locale:'en', value:'My Profile'});
ResourcesInit.push({key: 'lbl_profile',locale:'pt', value:'Nenhum perfil'});
ResourcesInit.push({key: 'lbl_profile',locale:'cn', value:'个人资料'});
ResourcesInit.push({key: 'lbl_profile',locale:'tw', value:'個人資料'});
ResourcesInit.push({key: 'lbl_link_to_facebook',locale:'en', value:'link to Facebook'});
ResourcesInit.push({key: 'lbl_link_to_facebook',locale:'pt', value:'link para Facebook'});
ResourcesInit.push({key: 'lbl_link_to_facebook',locale:'cn', value:'连接到Facebook'});
ResourcesInit.push({key: 'lbl_link_to_facebook',locale:'tw', value:'連接到Facebook'});
ResourcesInit.push({key: 'lbl_link_to_wechat',locale:'en', value:'link to WeChat'});
ResourcesInit.push({key: 'lbl_link_to_wechat',locale:'pt', value:'link para WeChat'});
ResourcesInit.push({key: 'lbl_link_to_wechat',locale:'cn', value:'连接到微信'});
ResourcesInit.push({key: 'lbl_link_to_wechat',locale:'tw', value:'連接到微信'});
ResourcesInit.push({key: 'lbl_share_to_facebook',locale:'en', value:'Share on Facebook'});
ResourcesInit.push({key: 'lbl_share_to_facebook',locale:'pt', value:'Partilhar no Facebook'});
ResourcesInit.push({key: 'lbl_share_to_facebook',locale:'cn', value:'分享到脸书'});
ResourcesInit.push({key: 'lbl_share_to_facebook',locale:'tw', value:'分享到臉書'});
ResourcesInit.push({key: 'lbl_share_to_wechat',locale:'en', value:'Share on WeChat'});
ResourcesInit.push({key: 'lbl_share_to_wechat',locale:'pt', value:'Partilhar no WeChat'});
ResourcesInit.push({key: 'lbl_share_to_wechat',locale:'cn', value:'分享到微信'});
ResourcesInit.push({key: 'lbl_share_to_wechat',locale:'tw', value:'分享到微信'});
ResourcesInit.push({key: 'lbl_share',locale:'en', value:'Share'});
ResourcesInit.push({key: 'lbl_share',locale:'pt', value:'Partilhar'});
ResourcesInit.push({key: 'lbl_share',locale:'cn', value:'分享'});
ResourcesInit.push({key: 'lbl_share',locale:'tw', value:'分享'});
ResourcesInit.push({key: 'lbl_help',locale:'en', value:'Help'});
ResourcesInit.push({key: 'lbl_help',locale:'pt', value:'Ajuda'});
ResourcesInit.push({key: 'lbl_help',locale:'cn', value:'帮助'});
ResourcesInit.push({key: 'lbl_help',locale:'tw', value:'幫助'});
ResourcesInit.push({key: 'lbl_skip',locale:'en', value:'Skip'});
ResourcesInit.push({key: 'lbl_skip',locale:'pt', value:'Pular'});
ResourcesInit.push({key: 'lbl_skip',locale:'cn', value:'跳过'});
ResourcesInit.push({key: 'lbl_skip',locale:'tw', value:'跳過'});
ResourcesInit.push({key: 'lbl_profile_desc',locale:'en', value:'*You can share the art work information to Facebook or WeChat'});
ResourcesInit.push({key: 'lbl_profile_desc',locale:'pt', value:'*You can share the art work information to Facebook or WeChat'});
ResourcesInit.push({key: 'lbl_profile_desc',locale:'cn', value:'*连接后可分享画作到微信或脸书'});
ResourcesInit.push({key: 'lbl_profile_desc',locale:'tw', value:'*連接後可分享畫作到微信或臉書'});
ResourcesInit.push({key: 'lbl_share_ok',locale:'en', value:'Share successful'});
ResourcesInit.push({key: 'lbl_share_ok',locale:'pt', value:'Compartilhar sucesso'});
ResourcesInit.push({key: 'lbl_share_ok',locale:'cn', value:'分享成功'});
ResourcesInit.push({key: 'lbl_share_ok',locale:'tw', value:'分享成功'});

const PORT = 81;

const API = ({
    GET_APP_USER_URL: "http://arts.things.buzz:" + PORT + "/api/appuser/Getappuser/%s",
    POST_APP_USER_URL : "http://arts.things.buzz:" + PORT + "/api/appuser/Postappuser",
    PUT_APP_USER_URL : "http://arts.things.buzz:" + PORT + "/api/appuser/Putappuser/%s",
    GET_APP_VERSION_URL : "http://arts.things.buzz:" + PORT + "/api/repo/appversion",
    GET_DATA_VERSION_URL : "http://arts.things.buzz:" + PORT + "/api/repo/dataversion",
    GET_CATALOG_URL : "http://arts.things.buzz:" + PORT + "/api/repo/catalog",
    GET_EX_CONTENT_URL : "http://arts.things.buzz:" + PORT + "/api/repo/excontent/%s",
    POST_SYS_LOG_URL : "http://arts.things.buzz:" + PORT + "/api/syslog/Postsyslog"
});

const fetchData = (url,callback,...args) => {
    fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
            callback(responseData, ...args);
        })
        .catch(err=> {
            console.log(err);
        });
};

const localeDisplayCodeToSuffix=(code)=> {
    var suffix = "en";
    switch (code) {
        case 0:
            suffix = "tw";
            break;
        case 1:
            suffix = "cn";
            break;
        case 2:
            suffix = "en";
            break;
        case 3:
            suffix = "pt";
            break;
    }

    return suffix;
};

const localeVoiceCodeToSuffix=(code)=> {
    var suffix = "en";
    switch (code) {
        case 0:
            suffix = "cc";
            break;
        case 1:
            suffix = "sc";
            break;
        case 2:
            suffix = "en";
            break;
        case 3:
            suffix = "pt";
            break;
    }

    return suffix;
};

const getLocale = ()=> {
    var defaultLocale = localeDisplayCodeToSuffix(getDeviceLocaleCode());
    var locale = {displayLang: defaultLocale, voiceLang: defaultLocale};
    let config = realm.objects('Config');
    if (config.length > 0) {
        locale.displayLang = localeDisplayCodeToSuffix(config[0].displayLang);
        locale.voiceLang = localeVoiceCodeToSuffix(config[0].voiceLang);
    }

    return locale;
};

const getDeviceLocaleCode = ()=> {
    var localeCode = 0;
    let countryCode = DeviceInfo.getDeviceCountry();
    switch (DeviceInfo.getDeviceLocale()) {
        case "zh-Hant-" + countryCode:
            localeCode = 0;
            break;
        case "zh-Hans-" + countryCode:
            localeCode = 1;
            break;
        case "en-" + countryCode:
            localeCode = 2;
            break;
        case "pt-PT":
            localeCode = 3;
            break;
    }

    return localeCode;
};

Date.prototype.format = function(fmt){
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

module.exports = ({
    Locale:getLocale,
    DeviceLocaleCode:getDeviceLocaleCode(),
    initResources:()=> {
        let Resources = realm.objects('Resources');
        if (Resources.length == 0) {
            realm.write(() => {
                ResourcesInit.forEach(function (item) {
                    realm.create('Resources', item);
                });
            });
        }
    },
    getLocaleValue:(key)=> {
        let Resources = realm.objects('Resources').filtered('key="' + key + '" AND locale="' + getLocale().displayLang + '"');
        if (Resources.length > 0) {
            return Resources[0].value;
        }
    },
    linkFacebookProfile:(data)=> {
        let config = realm.objects('Config');
        if (config.length > 0) {
            realm.write(() => {
                config[0].fbProfile = data;
            });
        }
    },
    linkWeChatProfile:(data)=> {
        let config = realm.objects('Config');
        if (config.length > 0) {
            realm.write(() => {
                config[0].wcProfile = data;
            });
        }
    },
    getUser:()=> {
        let config = realm.objects('Config');
        var user = null;
        if (config.length > 0) {
            user = config[0]
        }

        return user;
    },
    getUserConfig:(displayLang,voiceLang,callback)=> {
        //if db not found then create a new one
        let config = realm.objects('Config');
        //no user record
        if (config.length == 0) {
            //create to server
            let email = new Date().format("yyyyMMddhhmmssS") + "@buzz.com";
            let userId = email.replace(".", "$");

            var userConfig = {};
            userConfig.userid = userId;
            userConfig.email = email;
            userConfig.nickname = "nickname";
            userConfig.password = "123456";
            userConfig.defaultlang = displayLang;
            userConfig.voiceLang = voiceLang;

            fetch(API.POST_APP_USER_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userConfig)
            })
                .then(res => res.ok)
                .then(res => {
                    var user = null;
                    if (res) {
                        //create to local db
                        realm.write(() => {
                            user = {
                                userId: userId,
                                autoPlay: 1,
                                password: userConfig.password,
                                nickName: userConfig.nickname,
                                email: userConfig.email,
                                displayLang: displayLang,
                                voiceLang: voiceLang,
                                firstTimeLogin: 0,
                                fbProfile: null,
                                wcProfile: null
                            };
                            realm.create('Config', user);
                        });
                    }
                    callback({
                        ok: res,
                        user: user,
                        from: "new"
                    });
                })
                .catch(err => {
                    console.log('getUserConfig failed', err);
                    callback({
                        ok: false,
                        err: err
                    });
                });

        }
        else {
            callback({
                ok: true,
                user: config[0],
                from: "db"
            });
        }
    },
    updateFirstTimeLogin:(callback)=> {
        let config = realm.objects('Config');
        if (config.length > 0) {
            realm.write(() => {
                config[0].firstTimeLogin = 1;
            });
        }

        callback({user: config[0]});
    },
    updateUserConfig:(displayLang,voiceLang,autoPlay,callback)=> {
        //update db & server value
        let config = realm.objects('Config');
        var userConfig = {};
        if(config.length > 0) {
            userConfig.userid = config[0].userId;
            userConfig.password = config[0].password;
            userConfig.nickname = config[0].nickName;
            userConfig.email = config[0].email;
            userConfig.defaultlang = displayLang == null ? config[0].displayLang : displayLang;
            userConfig.voicelang = voiceLang == null ? config[0].voiceLang : voiceLang;

            realm.write(() => {
                config[0].displayLang = displayLang == null ? config[0].displayLang : displayLang;
                config[0].voiceLang = voiceLang == null ? config[0].voiceLang : voiceLang;
                config[0].autoPlay = autoPlay == null ? config[0].autoPlay : autoPlay;
            });
        }

        fetch(API.PUT_APP_USER_URL.replace('%s', userConfig.userid), {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userConfig)
        })
            .then(res => res.ok)
            .then(res => callback(res))
            .catch(err => console.log('updateUserConfig failed', err));
    },
    addLog: (userId, beaconId, triggerType, exTag, callback) => {
        fetch(API.POST_SYS_LOG_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "userid": userId,
                "beaconid": beaconId,
                "logtime": moment().format(),
                "triggertype": triggerType,
                "extag": exTag
            })
        })
        .then(res => res.ok)
        .then(res => callback(res))
        .catch(err => console.log('addLog failed', err));
    },
    getBeaconInfo:(major,minor)=> {
        let beacon = realm.objects('Beacon').filtered('major=' + major + ' AND minor=' + minor);
        if (beacon.length > 0) {
            return beacon[0];
        }
        else {
            return null;
        }
    },
    getExMaster:(exTag)=> {
        let exMaster = realm.objects('ExMaster').filtered('extag="' + exTag + '"');
        var ex = null;
        if (exMaster.length > 0) {
            ex = exMaster[0]
        }

        return ex;
    },
    getShareInfo:(exTag, refImageId)=> {
        var shareInfo = null;
        let exMaster = realm.objects('ExMaster').filtered('extag="' + exTag + '"');
        let imageContent = realm.objects('Content').filtered('contentid="' + refImageId + '"');
        if (exMaster.length > 0) {
            shareInfo = {};
            shareInfo.exTitle = exMaster[0]["title_" + getLocale().displayLang];
        }
        if (imageContent.length > 0) {
            shareInfo.title = imageContent[0]["title_" + getLocale().displayLang];
            shareInfo.imageUrl = imageContent[0].serverpath;
        }

        return shareInfo;
    },
    getFavorites: () => {
        let fav = realm.objects('Favorites');
        if (fav.length > 0) {
            var list = [];
            fav.forEach((item)=> {
                let imageContent = realm.objects('Content').filtered('contentid="' + item.refImageId + '"');
                let audioContent = realm.objects('Content').filtered('contentid="' + item.refAudioId + '"');
                var title, desc, baseUrl, audioPath, placeHolder;
                if (imageContent.length > 0) {
                    title = imageContent[0]["title_" + getLocale().displayLang];
                    placeHolder = '{' + imageContent[0].clientpath + imageContent[0].filename + '}';
                    baseUrl = RNFS.DocumentDirectoryPath + imageContent[0].clientpath;
                    desc = imageContent[0]["description_" + getLocale().displayLang].replace(placeHolder, imageContent[0].filename);
                }

                if (audioContent.length > 0) {
                    audioPath = RNFS.DocumentDirectoryPath
                    + audioContent[0].clientpath
                    + audioContent[0].filename.replace(".mp3", `_${getLocale().voiceLang}.mp3`)
                }

                list.push({
                    key: item.extag + '-' + item.refImageId + '-' + item.refAudioId,
                    extag: item.extag,
                    refImageId: item.refImageId,
                    refAudioId: item.refAudioId,
                    title: title ? title : 'Unknown',
                    audioPath: audioPath,
                    desc: desc,
                    baseUrl: baseUrl
                });
            });
            return list;
        }
        else {
            return null;
        }
    },
    writeFavorite: (extag, refImageId, refAudioId, callback) => {
        realm.write(() => {
            realm.create('Favorites', {extag: extag, refImageId: refImageId, refAudioId: refAudioId});
        });

        callback();
    },
    deleteFavorite:(extag, refImageId, refAudioId, callback)=> {
        realm.write(() => {
            let fav = realm.objects('Favorites').filtered('extag="' + extag + '" AND refImageId="' + refImageId + '" AND refAudioId="' + refAudioId + '"');
            realm.delete(fav);
        });

        callback();
    },
    favoriteExists:(extag, refImageId, refAudioId)=> {
        let fav = realm.objects('Favorites').filtered('extag="' + extag + '" AND refImageId="' + refImageId + '" AND refAudioId="' + refAudioId + '"');
        return fav.length > 0;
    },
    deleteFavorites: () => {
        realm.write(() => {
            let fav = realm.objects('Favorites');
            realm.delete(fav);
        });
    },
    getCatalog:()=> {
        let download = realm.objects('Download');
        if (download.length > 0) {
            return download[0].catalog;
        }
        else {
            return null;
        }
    },
    updateExContent: (extag,callback) => {
        fetchData(API.GET_EX_CONTENT_URL.replace('%s', extag), function (json) {
            let catalog = realm.objects('Catalog').filtered('extag="' + extag + '"');
            if (catalog.length > 0) {
                realm.write(() => {

                    realm.delete(realm.objects('ExContent').filtered('extag="' + extag + '"'));
                    realm.delete(realm.objects('Beacon').filtered('extag="' + extag + '"'));
                    realm.delete(realm.objects('TriggerContent').filtered('extag="' + extag + '"'));
                    realm.delete(realm.objects('Trigger').filtered('extag="' + extag + '"'));
                    realm.delete(realm.objects('Content').filtered('extag="' + extag + '" AND usage="1"'));

                    let beacons = [];
                    let contents = [];
                    for (var item of json.beacons) {
                        item.extag = extag;
                        for (var tc of item.triggercontent) {
                            tc.extag = extag;
                            tc.trigger.extag = extag;
                            tc.content.extag = extag;
                        }
                        beacons.push(item);
                    }

                    for (var item of json.contents) {
                        if (item.usage == "1") {
                            item.extag = extag;
                            contents.push(item);

                            if (item.contenttype == 2) {
                                FileMgr.downloadFile(
                                    item.serverpath,
                                    item.clientpath,
                                    item.filename
                                );
                            }
                            else if (item.contenttype == 1) {
                                ["sc", "cc", "en", "pt"].forEach((locale)=> {
                                    FileMgr.downloadFile(
                                        item.serverpath.replace(".mp3", `_${locale}.mp3`),
                                        item.clientpath,
                                        item.filename.replace(".mp3", `_${locale}.mp3`)
                                    );
                                });
                            }
                        }
                    }

                    catalog[0].localVersion = catalog[0].serverVersion;
                    catalog[0].exContent = {
                        extag: extag,
                        beacons: beacons,
                        contents: contents
                    }
                });
            }
            callback();
        });
    },
    deleteExContent: (extag,callback) => {
        realm.write(() => {
            realm.delete(realm.objects('ExContent').filtered('extag="' + extag + '"'));
            realm.delete(realm.objects('Beacon').filtered('extag="' + extag + '"'));
            realm.delete(realm.objects('TriggerContent').filtered('extag="' + extag + '"'));
            realm.delete(realm.objects('Trigger').filtered('extag="' + extag + '"'));
            realm.delete(realm.objects('Content').filtered('extag="' + extag + '" AND usage="1"'));
        });

        callback();
    },
    removeAllData:()=> {
        realm.write(() => {
            realm.delete(realm.objects('Catalog'));
            realm.delete(realm.objects('ExMaster'));
            realm.delete(realm.objects('ExContent'));
            realm.delete(realm.objects('Beacon'));
            realm.delete(realm.objects('TriggerContent'));
            realm.delete(realm.objects('Trigger'));
            realm.delete(realm.objects('Content'));
            realm.delete(realm.objects('Favorites'));
            realm.delete(realm.objects('Download'));
            realm.delete(realm.objects('Resources'));
        });
    },
    checkDataVersionUpdate: () => {
        fetchData(API.GET_DATA_VERSION_URL, function (json) {
            let clientDataVersion = null;
            let download = realm.objects('Download');
            if (download.length > 0) {
                clientDataVersion = download[0].dataVersion.toLowerCase();
            }

            let newVersion = (json.publishedversion + "").toLowerCase();

            if (clientDataVersion != null) {
                if (clientDataVersion != newVersion) {
                    //update client catalog & local data version
                    //update download
                    fetchData(API.GET_CATALOG_URL, function (json, newVersion) {
                        realm.write(() => {
                            download[0].dataVersion = newVersion;
                            download[0].appVersion = (parseInt(download[0].appVersion) + 1).toString();

                            var localCatalog = [];
                            var serverCatalog = [];

                            let localCatalogList = realm.objects('Catalog');
                            if (localCatalogList.length > 0) {
                                for (var localCat of localCatalogList) {
                                    localCatalog.push(localCat.extag);
                                }
                            }

                            for (var serverCat of json) {
                                serverCatalog.push(serverCat.extag);
                            }

                            let differentCatalog = _.xor(localCatalog, serverCatalog);//比较目录差异
                            for(var diffExTag of differentCatalog) {
                                let diffCatalog = realm.objects('Catalog').filtered('extag="' + diffExTag + '"');
                                if (diffCatalog.length > 0) {
                                    //本地目录存在并在差异列表里面则删除
                                    realm.delete(diffCatalog);
                                    realm.delete(realm.objects('ExMaster').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('ExContent').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('Beacon').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('TriggerContent').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('Trigger').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('Content').filtered('extag="' + diffExTag + '"'));
                                    realm.delete(realm.objects('Favorites').filtered('extag="' + diffExTag + '"'));
                                }
                            }

                            for (var item of json) {
                                let catalog = realm.objects('Catalog').filtered('extag="' + item.extag + '"');
                                //如果本地目录不存在则新增
                                if (catalog.length == 0) {
                                    let fileCount = item.fileCount;
                                    delete item.fileCount;
                                    item.content.usage = "0";
                                    item.content.extag = item.extag;

                                    FileMgr.downloadFile(
                                        item.content.serverpath,
                                        item.content.clientpath,
                                        item.content.filename
                                    );

                                    download[0].catalog.push({
                                        extag: item.extag,
                                        fileCount: fileCount,
                                        exMaster: item,
                                        exContent: null,
                                        localVersion: item.publish.toString(),
                                        serverVersion: item.publish.toString()
                                    });
                                }
                                else {
                                    //更新服务器版本（跟本地版本比较显示下载图标）
                                    catalog[0].serverVersion = item.publish.toString();
                                    //删除版本不一致的配置和封面内容并添加新的配置和封面内容
                                    if (catalog[0].localVersion != item.publish.toString()) {
                                        realm.delete(realm.objects('Content').filtered('extag="' + item.extag + '" AND usage="0"'));
                                        realm.delete(realm.objects('ExMaster').filtered('extag="' + item.extag + '"'));
                                        let fileCount = item.fileCount;
                                        delete item.fileCount;
                                        item.content.usage = "0";
                                        item.content.extag = item.extag;
                                        catalog[0].fileCount = fileCount;
                                        catalog[0].exMaster = item;


                                        FileMgr.downloadFile(
                                            item.content.serverpath,
                                            item.content.clientpath,
                                            item.content.filename
                                        );
                                    }
                                    else {
                                        //如果目录版本一致则不用处理
                                    }
                                }
                            }

                            console.log('update catalog');
                        });
                    }, newVersion);
                }
            }
            else {
                //update client catalog & local data version
                //insert download
                fetchData(API.GET_CATALOG_URL, function (json, newVersion) {
                    realm.write(() => {
                        var newDownload = realm.create('Download', {
                            appVersion: '1',
                            dataVersion: newVersion,
                            catalog: []
                        });

                        for (var item of json) {
                            let fileCount = item.fileCount;
                            delete item.fileCount;
                            item.content.usage = "0";
                            item.content.extag = item.extag;

                            FileMgr.downloadFile(
                                item.content.serverpath,
                                item.content.clientpath,
                                item.content.filename
                            );

                            newDownload.catalog.push({
                                extag: item.extag,
                                fileCount: fileCount,
                                exMaster: item,
                                exContent: null,
                                localVersion: item.publish.toString(),
                                serverVersion: item.publish.toString()
                            });
                        }

                        console.log('insert catalog');
                    });
                }, newVersion);
            }
        });
    }
});


