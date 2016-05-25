/**
 * Created by NickChung on 5/17/16.
 */
import React, {
    Component,
    } from 'react';
import{
    requireNativeComponent,
    } from 'react-native';

var NativeMyCustomView = requireNativeComponent('MyCustomView', MyCustomView);

export default class MyCustomView extends Component {
    static propTypes = {
        myCustomProperty: React.PropTypes.oneOf(['a', 'b']),
    };

    render() {
        return <NativeMyCustomView {...this.props} />;
    }
}