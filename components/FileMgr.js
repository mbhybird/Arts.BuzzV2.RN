/**
 * Created by NickChung on 5/6/16.
 */
'use strict';

var React = require('react-native');
const FileDownload = require('react-native-file-download');
const RNFS = require('react-native-fs');

module.exports=({
    downloadFile: (URL, clientPath, fileName, headers = {'Accept-Language': 'en-US'})=> {
        let localPath = RNFS.DocumentDirectoryPath + clientPath;
        RNFS.mkdir(localPath);
        FileDownload.addListener(URL, (info) => {
            //console.log(`complete ${(info.totalBytesWritten / info.totalBytesExpectedToWrite * 100)}%`);
        });

        FileDownload.download(URL, localPath, fileName, headers)
            .then((response) => {
                //console.log(`downloaded! file saved to: ${response}`)
            })
            .catch((error) => {
                console.log(error)
            });
    }
});