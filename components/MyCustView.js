/**
 * Created by NickChung on 5/17/16.
 */
import React, {Component} from 'react';
import {requireNativeComponent} from 'react-native';

var NativeMyCustomView = requireNativeComponent('MyCustomView', MyCustomView);

export default class MyCustomView extends Component {
    static propTypes = {
        srcImagePath: React.PropTypes.string,
        cropImageWidth: React.PropTypes.number,
        cropImageHeight: React.PropTypes.number,
        textFontSize: React.PropTypes.number,
        textFontHeight: React.PropTypes.number,
        textFontFamily: React.PropTypes.string,
        textContent: React.PropTypes.string
    };

    render() {
        return <NativeMyCustomView {...this.props} />;
    }
}