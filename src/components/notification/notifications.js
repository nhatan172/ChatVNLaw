import React, { Component}  from 'react';
import { EventEmitter } from 'fbemitter';

import RequestRoomItem from './notification_item/requestroom';
import AcceptRoomItem from './notification_item/acceptroom';
import RefuseRoomItem from './notification_item/refuseroom';
import Nav from '../homepage/nav';
import Footer from '../homepage/footer';
import Toast from './toast';
import Loading from '../shared/loading';

import { onAuthStateChanged } from '../../lib/user/authentication';
import { getAllNotification } from '../../lib/notification/notifications';
import { checkAuthen } from '../../lib/notification/toast';

import * as constant from '../constants';
import * as translate from 'counterpart';
import * as tableConstant from '../../lib/constants';

import '../../assets/styles/common/notification.css';

class Notifications extends Component{
  constructor(props){
    super(props);
    this.state = {
      currentUser: null,
      isLoading: true,
      permission: false,
      showDialog: false,
      notifications: []
    }
    this.emitter = new EventEmitter();
  }

  componentWillMount(){
    var component= this;
    onAuthStateChanged(user =>{
      if(user){
        component.setState({currentUser: user, permission: true}, ()=>{
          component.setState({isLoading: false})
          var properties = {}
          properties['currentUser'] = component.state.currentUser;
          var notificationsArr = [];
          getAllNotification(properties, (event, data)=>{
            switch(event){
              case 'value':
                component.setState({notifications: notificationsArr});
                break;
              case 'child_added':
                notificationsArr.unshift(data);
                component.setState({notifications: notificationsArr});
                break;
              case 'child_removed':
                notificationsArr.every(function(element,index){           
                  if (element.id === data.id){
                    notificationsArr.splice(index, 1);
                    component.setState({notifications: notificationsArr});
                    return false;
                  }
                  else{
                    return true;
                  }
                })
                break;
              default:
                break;
            }
          });
        });
      }
      else{
        component.setState({isLoading: true});
        checkAuthen(component.emitter, constant.SIGN_IN_URI, ()=>{

        })
      }
    })
  }

  onConfirm(){
    this.setState({showDialog: false})    
  }

  onCancel(){
    this.setState({showDialog: false})
  }
 
  renderNotificationItem(element){
    switch(element.type){
      case tableConstant.NOTIFICATION_TYPE.requestRoom:
        return(
          <RequestRoomItem element={element}
            currentUser={this.state.currentUser}/>
        )
      case tableConstant.NOTIFICATION_TYPE.refuseRoomRequest:
        return(
          <RefuseRoomItem element={element}
            currentUser={this.state.currentUser}/>
        )
      case tableConstant.NOTIFICATION_TYPE.acceptRoomRequest:
        return(
          <AcceptRoomItem element={element} 
            currentUser={this.state.currentUser}/>
        )
      default:
        return(
          <div>
          </div>
        )
    }
  }

  renderView(){
    if(this.state.notifications) {
      if(this.state.notifications.length > 0){
        return (
          <div>
            <Nav navStyle='inverse'/>
            <div className='notifi-wrapper'>
              {this.state.notifications.map((element, index ) =>{
                return(
                  this.renderNotificationItem(element)
                )
              })}
            </div>
            <Footer/>
          </div>
        )
      }
      else {
        return (
          <div>
            <Nav navStyle='inverse'/>
            <div className='notifi-wrapper'>
              <div className='no-notifi-content'>
                <i className='fa fa-bell'></i>
                <div>{translate('app.notification.no_noti')}</div>
              </div>
            </div>
            <Footer/>
          </div>  
        )
      }
    }
  }

  render(){
    return (
      <div>
        <Toast emitter={this.emitter}/>
        {
          !this.state.isLoading && this.state.permission ? 
          this.renderView() : <Loading/>
        }
      </div>
    )
  }
}

export default Notifications;
