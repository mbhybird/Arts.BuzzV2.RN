/**
 * Created by NickChung on 6/12/16.
 */
function getQueryString() {
    var result = location.search.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));

    if (result == null) {
        return "";
    }

    for (var i = 0; i < result.length; i++) {
        result[i] = result[i].substring(1);
    }

    return result;
}

//根据QueryString参数名称获取值
function getQueryStringByName(name) {
    var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));

    if (result == null || result.length < 1) {
        return "";
    }

    return result[1];
}

//根据QueryString参数索引获取值
function getQueryStringByIndex(index) {
    if (index == null) {
        return "";
    }

    var queryStringList = getQueryString();

    if (index >= queryStringList.length) {
        return "";
    }

    var result = queryStringList[index];
    var startIndex = result.indexOf("=") + 1;
    result = result.substring(startIndex);

    return result;
}

var Content = React.createClass({
    getInitialState: function() {
        return {
            description: null
        }
    },
    componentWillMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({
                    description: data["description_" + getQueryStringByName('locale')]
                        .replace('{' + data.clientpath + data.filename + '}', data.serverpath)
                });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div dangerouslySetInnerHTML={{__html:this.state.description}}></div>
        );
    }
});

ReactDOM.render(
    <Content url={'http://arts.things.buzz:81/api/content/Getcontent/' + getQueryStringByName('refImageId')}/>,
    document.getElementById('content')
);