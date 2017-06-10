import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import updateCurrentUser from '../Login//loginActions';
import { AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

class LoadingComponent extends Component {

  componentDidMount() {
    AccessToken.getCurrentAccessToken()
    .then((data) => {
      if (!data || !data.accessToken) {
        this.props.navigation.navigate('Login');
      } else {
        const { accessToken } = data;
        const infoRequest = new GraphRequest(
          '/me?fields=email,name',
          { accessToken: accessToken },
          this._responseInfoCallback.bind(this),
        );
        new GraphRequestManager().addRequest(infoRequest).start();
      }
    })
    .catch(err => { console.log(err); });
  }

  handleLoginSuccess(data) {
    const { navigate } = this.props.navigation;
    navigate('Main');
    this.props.updateCurrentUser(data);
  }

  _responseInfoCallback(error: ?Object, result: ?Object) {
    if (error) { console.log('Error fetching data: ', error);
    } else {
      const context = this;
      axios.post('http://localhost:3000/mobileFBLogin', result)
      .then(function (response) {
        console.log(response.data);
        context.handleLoginSuccess = context.handleLoginSuccess.bind(context);
        context.handleLoginSuccess(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  render() {
    return (
      <View style={{ marginTop: 300, alignItems: 'center' }}>
        <Text style={{ fontSize: 25 }}>Loading...</Text>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { loginReducer } = state;
  return {
    loginReducer: loginReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    updateCurrentUser: updateCurrentUser
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingComponent);
