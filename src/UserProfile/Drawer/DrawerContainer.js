import React, { Component } from 'react';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { MaterialDialog } from 'react-native-material-dialog';
import { Button } from 'react-native-material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toggleUPDrawer } from './drawerActions';
import { LoginButton } from 'react-native-fbsdk';

class DrawerContainer extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUserProfile = this.handleUserProfile.bind(this);
    this.handleMain = this.handleMain.bind(this);
  }

  handleLogout() {
    this.props.toggleUPDrawer();
    const { navigate } = this.props.navigation;
    navigate('Login');
  }

  handleUserProfile() {
    this.props.toggleUPDrawer();
    const { navigate } = this.props.navigation;
    navigate('UserProfile');
  }

  handleMain() {
    this.props.toggleUPDrawer();
    const { goBack } = this.props.navigation;
    goBack();
  }

  render() {
    return (
      <MaterialDialog
        title="Settings"
        visible={this.props.visible}
        onCancel={this.props.toggleUPDrawer}
        >
        <View style={{ alignItems: 'center' }}>
          <Button raised upperCase={false} text="Main"
            icon='home'
            onPress={this.handleMain}
            style={{container: {backgroundColor: '#31575B', width: 190, height: 30, marginBottom: 10, justifyContent: 'flex-start'}, text: {color: '#fff', fontSize: 13}, icon: {marginRight: 53, marginLeft: -12}}} />
          <LoginButton onLogoutFinished={this.handleLogout}/>
        </View>
      </MaterialDialog>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    toggleUPDrawer: toggleUPDrawer
  }, dispatch);
}

const mapStateToProps = (state) => {
  const { drawerReducerUP } = state;
  return { visible: drawerReducerUP.visible };
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContainer);
