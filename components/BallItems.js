/**
 * Created by NickChung on 4/14/16.
 */
var React = require('react-native');
var { StyleSheet, View,Text,Image,Dimensions} = React;
import Spinner from "react-native-gifted-spinner";
var GridView = require('react-native-grid-view');
const RealmRepo = require("./RealmRepo.js");

var BallItems1 = React.createClass({
    render(){
        return(<Image source={{
        uri:'icon_logo',
        height:Dimensions.get('window').height-80,
        width:Dimensions.get('window').width,
        sizeMode:'stretch'
        }}/>);
    }
});

var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';
var PAGE_SIZE = 25;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;
var REQUEST_URL = API_URL + PARAMS;
var MOVIES_PER_ROW = 3;

var Movie = React.createClass({
    render: function() {
        return <View style={styles.movie}>
            <Image
                source={{uri: this.props.movie.posters.thumbnail}}
                style={styles.thumbnail}
                />
            <View >
                <Text
                    style={styles.title}
                    numberOfLines={3}>{this.props.movie.title}</Text>
                <Text style={styles.year}>{this.props.movie.year}</Text>
            </View>
        </View>
    },
});

var BallItems = React.createClass({
    getInitialState: function() {
        return {
            dataSource: null,
            loaded: false,
        };
    },

    componentDidMount: function() {
        this.fetchData();
    },

    fetchData: function() {
        fetch(REQUEST_URL)
            .then((response) => response.json())
            .then((responseData) => {
                this.setState({
                    dataSource: responseData.movies,
                    loaded: true,
                });
            })
            .done();
    },

    render: function() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return (
            <GridView
                items={this.state.dataSource}
                itemsPerRow={MOVIES_PER_ROW}
                renderItem={this.renderItem}
                style={styles.listView}
                />
        );
    },

    renderLoadingView: function() {
        return (
            <View style={styles.container}>
                <Spinner/>
            </View>
        );
    },

    renderItem: function(item) {
        return <Movie movie={item} key={Math.random()} />
    },
});

var styles = StyleSheet.create({
    movie: {
        height: 150,
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
    },
    title: {
        fontSize: 10,
        marginBottom: 8,
        width: 90,
        textAlign: 'center',
    },
    year: {
        textAlign: 'center',
    },
    thumbnail: {
        width: 53,
        height: 81,
    },
    listView: {
        paddingTop: 20,
        backgroundColor: 'rgba(69,86,86,0.01)',
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

module.exports = BallItems;