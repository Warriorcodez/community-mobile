import React, { Component } from 'react';
import { StyleSheet, Text, View, Modal, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Button } from 'react-native-material-design';
import { ActionButton } from 'react-native-material-ui';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import centerLocation from './mapActions';
import CreateEventContainer from '../CreateEvent/CreateEventContainer';
import MapHeader from './MapHeaderComponent';
import Drawer from './Drawer/DrawerContainer';
import Promise from 'bluebird';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';

const baseUrl = 'https://warriors-community.herokuapp.com';

class MapComponent extends Component {

  constructor(props) {
    super(props);
    this.map = null;
    this.state = {
      mapRegion: null,
      initialPosition: null,
      lastPosition: null,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      loading: false,
    };
    this.onCreateEvent = this.onCreateEvent.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onLocateUser = this.onLocateUser.bind(this);
    this.handleCalloutPress = this.handleCalloutPress.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.showLoadingOverlay = this.showLoadingOverlay.bind(this);
    this.hideLoadingOverlay = this.hideLoadingOverlay.bind(this);
  }

  componentWillMount() {
    this.onLocateUser();
  }

  onLocateUser() {
    const context = this;
    navigator.geolocation.getCurrentPosition(position => {
      return new Promise ((resolve, reject) => {
        resolve(context.map.animateToRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: this.state.latitudeDelta,
            longitudeDelta: this.state.longitudeDelta
        }))
        context.props.centerLocation({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        })
        context.props.userLocation({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        })
      })
      .catch(error => {
        console.log('Error occurred ', error);
      });
    })
  }

  showLoadingOverlay() {
    this.setState({
      loading: true
    });
  }

  hideLoadingOverlay() {
    this.setState({
      loading: false
    });
  }

  onRefresh() {
    const context = this;
    this.showLoadingOverlay();
    axios.get(baseUrl + '/api/retrieveEvents')
    .then(res => {
      this.props.addEvents(res.data)
    })
    .then(() => {
      this.hideLoadingOverlay()
    })
    .catch(error => {
      console.log('Error occurred.', error);
    });
  }

  onCreateEvent() {
    this.props.screenProps.toggleCreateEvent();
  }

  handleCalloutPress(marker, index) {
    this.props.setCurrentEvent(index);

    axios.post(baseUrl + '/api/connectEventToProfile', {
      eventId: this.props.allEvents[index].id,
      userId: this.props.userId
    })
    .then(res => {
      this.props.updateButton({
        isAttendingEvent: !!res.data.is_attending,
        hasLikedEvent: !!res.data.liked
      });
    })
    .catch(err => { console.log(err); });

    axios.post(baseUrl + '/api/retrieveParticipants', {
      eventId: this.props.allEvents[index].id,
      userId: this.props.userId
    })
    .then(res => {
      this.props.setCurrentEventParticipants(res.data);
    })
    .then(() => {
      const { navigate } = this.props.navigation;
      navigate('EventDetails');
    })
    .catch(err => { console.log(err); });
  }

  onLocationChange(coordsObj) {
    this.map.animateToRegion({
      latitude: coordsObj.latitude,
      longitude: coordsObj.longitude,
      latitudeDelta: this.state.latitudeDelta,
      longitudeDelta: this.state.longitudeDelta
    })
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            <Spinner visible={this.state.loading} />
            <MapView
              ref={map => { this.map = map }}
              showsUserLocation={true}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: this.props.coords.lat,
                longitude: this.props.coords.lng,
                latitudeDelta: this.state.latitudeDelta,
                longitudeDelta: this.state.longitudeDelta,
              }}
            >
            {this.props.allEvents.map((marker, index) => (
              <MapView.Marker
                key={index}
                coordinate={{
                  latitude: Number(marker.lat),
                  longitude:  Number(marker.lng)
                }}
                pinColor='maroon'
                onCalloutPress={this.handleCalloutPress}
                >
                  <MapView.Callout onPress={() => this.handleCalloutPress(marker, index)}
                    style={{width: 200, height: 70}}>
                    <View style={{position: 'relative'}}>
                      <Image style={{width: 70, height: 70}}
                        source={{uri: marker.image}}/>
                    </View>
                    <View style={{position: 'relative', left: 75, bottom: 65}}>
                      <Text style={{width: 130}}>
                        Name: {marker.event_name}
                      </Text>
                      <Image source={{uri: "https://image.flaticon.com/icons/png/128/148/148836.png"}} style={{width: 20, height: 20}}/>
                      <Text style={{width: 130, position: 'relative', left: 25, bottom: 19}}>{marker.like_count}</Text>
                    </View>
                  </MapView.Callout>
              </MapView.Marker>
            ))}
            </MapView>
            <MapHeader
              {...this.props}
              onLocationChange={this.onLocationChange}
            />
            <View style={{ marginLeft: 350 }}>
              <View style={actionButtonStyles.actionButton1}>
                <ActionButton icon="add" style={actionButtonStyles} onPress={this.onCreateEvent}/>
              </View>
              <View style={actionButtonStyles.actionButton2}>
                <ActionButton icon="gps-fixed" style={actionButtonStyles} onPress={this.onLocateUser}/>
              </View>
              <View style={actionButtonStyles.actionButton3}>
                <ActionButton icon="refresh" style={actionButtonStyles} onPress={this.onRefresh}/>
              </View>
            </View>
            <CreateEventContainer />
            <Drawer navigation={this.props.screenProps.navigation}/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const actionButtonStyles = StyleSheet.create({
  container: {
    height: 40,
    width: 40,
    backgroundColor: 'white',
  },
  icon: {
    color: '#31575B'
  },
  actionButton1: { marginBottom: 50, },
  actionButton2: { marginBottom: 50, },
  actionButton3: { marginBottom: 20, }
});

export default MapComponent;
