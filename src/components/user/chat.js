import React, { Component } from 'react';
import ChatBubble from 'react-chat-bubble';
import { Input, Form, Button } from 'semantic-ui-react';
import $ from 'jquery';

import avaLawyer from '../../assets/images/default-ava-lawyer.png';
import avaUser from '../../assets/images/default-ava-user.png';
import * as constant from '../constants';

import '../../assets/styles/chatwindow.css';
var EJSON = require("ejson");

let translate = require('counterpart');
let FontAwesome = require('react-fontawesome');
let chat = require('../../lib/api/chat');
let im = require('../../lib/api/im');
let user = require('../../lib/api/users');
let ddp = require('../../lib/real_time_api/ddp_connection');
let chanel = require('../../lib/api/chanel');
let item_helper = require('../../lib/helper/item_chat_helper');

var subscribeId = 0;
var roomId = ''
class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      current_user_name: '',
      current_user_id: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    var component = this;  
    
    if (nextProps.username !== this.state.current_user_name){
      this.setState({messages : []});
      this.setState({current_user_name: nextProps.username});
      if(subscribeId !== 0){
        ddp.unsubscribe(subscribeId, function(){
          component.handleLoadMessage(nextProps.username);
        });   
      } else{
        ddp.connect(function(){
          ddp.login(function(){
            component.handleLoadMessage(nextProps.username)
          });
        }); 
      }
    }
  }
  
  handleIncomingMess(result){
    var component = this;   
    result = EJSON.parse(result);
    var newStateMessages = component.state.messages;
    
    if(result.msg === 'changed'){
      var messages = result.fields.args;
      var item;
      if (messages[0].u._id !== JSON.parse(localStorage.rocket_chat_user).user_id){
        item = item_helper.newItem(1, avaLawyer,messages[0]);
      } else{
        item = item_helper.newItem(0,avaUser,messages[0]);
      }
      newStateMessages.push(item);
      component.setState({messages : newStateMessages});
      this.autoScrollBottom();
    }
  }

  fetchMsg(msgArr, reverse){
    var component = this;  
    
    // msgArr =  EJSON.parse(msgArr);
    var newStateMessages = component.state.messages;
    if(reverse){
      newStateMessages = newStateMessages.reverse();
    }
    var messages = msgArr.messages;
    for( var i in messages){
      var item;
      if(messages[i].u._id === JSON.parse(localStorage.rocket_chat_user).user_id){
        if(reverse){
          item = item_helper.newItemWithRestApi(0, avaUser, messages[i]);
        } else{
          item = item_helper.newItem(0, avaUser, messages[i]);          
        }
      } else{
        if(reverse){
          item = item_helper.newItemWithRestApi(1,avaLawyer,messages[i]);          
        } else{
          item = item_helper.newItem(1,avaLawyer,messages[i]);
        }
      }
      newStateMessages.push(item);
    }
    newStateMessages.reverse();
    component.setState({messages : newStateMessages});
    if (!reverse){
      this.autoScrollBottom();
      
    }
  }

  handleLoadMessage(username){
    var component = this;
    user.infoByUserName(username, function(response){
      if(response.status === 200){
        var target_id = response.data.user._id;
        if( target_id !== JSON.parse(localStorage.rocket_chat_user).user_id){
          roomId = target_id + JSON.parse(localStorage.rocket_chat_user).user_id;
          ddp.loadHistory(roomId,function( issuccess, result){
            if(issuccess){
              component.fetchMsg(result,false);
              ddp.streamRoomMessages(roomId, function(id,msg){
                subscribeId = id;
                component.handleIncomingMess(msg);
              });
            }else{
              roomId = JSON.parse(localStorage.rocket_chat_user).user_id + target_id;
              ddp.loadHistory(roomId,function( issuccess, result){
                if(issuccess){
                  component.fetchMsg(result,false);      
                  ddp.streamRoomMessages(roomId, function(id,msg){
                    subscribeId = id;
                    component.handleIncomingMess(msg);
                  });      
                }else{
                  im.create(username, function(response){
                    if(response.status === 200){
                      roomId = response.data.room._id;
                      ddp.streamRoomMessages(roomId, function(id,msg){
                        subscribeId = id;
                        component.handleIncomingMess(msg);
                      });
                    }
                  })                
                }
              });
            }
          });
        }
        else{
          chanel.info(null, target_id,function(response){
            roomId = response.data.channel._id;
            console.log(roomId);
            ddp.loadHistory(roomId,function( issuccess, result){
              if(issuccess){
                component.fetchMsg(result,false);
                ddp.streamRoomMessages(roomId, function(id,msg){
                  subscribeId = id;
                  component.handleIncomingMess(msg);
                });
              }
            })
          })
        }
      }
    });
    
  }

  componentWillUnmount() {
    ddp.close();
  }

  componentDidMount() {
    var component = this;
    document.getElementsByClassName('chats')[0].addEventListener('scroll',
      function(){
        if(this.scrollTop === 0){
          if(component.state.messages[0]){
            
            console.log(component.state.messages[0].ts_ISO);
            // ddp.loadHistory(roomId,function(issuccess,result){
            //   if(issuccess){
            //     component.fetchMsg(result,true);
            //   }
            // })
            chanel.history(roomId,component.state.messages[0].ts_ISO,15,function(response){
              console.log(response.data);
              component.fetchMsg(response.data,true);
            })
          }
        }
      });
  }

  autoExpand(elementId) {
    var input = document.getElementById(elementId);
    var fieldParent = input.parentElement;
    var chats = document.getElementsByClassName('chats')[0];
    var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    input.style.height = '45px';
    var contentHeight = document.getElementById(elementId).scrollHeight;
    input.style.height = contentHeight + 'px';

    var textbox = document.getElementById('text-box');
    textbox.style.height = contentHeight + 15 + 'px';
    fieldParent.style.height = contentHeight + 'px';
    chats.style.height = vh - 50 - contentHeight + 'px';
  }

  clearContent(elementId) {
    $('#' + elementId).val($('#' + elementId).val().replace(/\t/g, 'a'));
    $('#' + elementId).val('');
    this.autoExpand(elementId);
  }

  handleInputChange(evt) {
    if (evt.which === 13 && evt.shiftKey === false) {
      this.handleSubmit();
      evt.preventDefault();
      this.clearContent('input-mess-box');
    }
    else {
      this.autoExpand('input-mess-box');
    }
  }

  autoScrollBottom() {
    $('.chats').stop().animate({
      scrollTop: $('.chats')[0].scrollHeight}, 1000);
  }

  handleSubmit() {
    var content = document.getElementById('input-mess-box').value;
    chat.postMessage(roomId, '', content, '', '', '', [], function(response){
    });
  }


  render() {
    return(
      <div className='chat-window' id='chat-window'>
        <div className='title'>
          <div className='user-name'>
            {this.state.current_user_name}
          </div>
          <FontAwesome name='video-camera'/>
          <FontAwesome name='phone'/>
        </div>
        <ChatBubble messages={this.state.messages} />
        <div className='text-box' id='text-box'>
          <Form.TextArea id='input-mess-box'
            placeholder={translate('app.chat.input_place_holder')}
            onKeyDown={this.handleInputChange.bind(this)}/>
        </div>
      </div>
    )
  }
}

export default Chat;
