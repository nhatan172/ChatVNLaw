import React, { Component } from 'react';
import firebase from 'firebase';
import * as translate from 'counterpart';
import axios from 'axios';

import ReadMore from '../shared/readmore';
import * as constant from '../constants';

class TopLawyers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      top_lawyers: []
    }
  }

  componentDidMount() {
    this.loadDataFromServer();
  }

  loadDataFromServer() {
    var component = this;
		var instance = axios.create({
			baseURL: constant.API_BASE_URL
    });

    instance.get(constant.API_TOP_LAWYERS_URI)
      .then(function (response) {
        component.setState({
          top_lawyers: response.data.top_lawyers
        });
      })
      .catch(function (error) {
      });
  }

  handleOnclickLawyer(uid){
		firebase.database().ref(`users/${uid}`).once('value', data=>{
			if(data.exists()){
				window.open(constant.BASE_URL + '/lawyers/'
					+ data.val().username)
			}
		})
	}

  render() {
    return(
      <div className='top-view'>
        <div className='title'>
          {translate('app.attorney.top_view')}
        </div>
        <hr/>
        <div className='lawyers-list'>
          {
            this.state.top_lawyers.map(lawyer => {
              return (
                <div className='item' onClick={
                  this.handleOnclickLawyer.bind(this, lawyer.fb_id)}>
                    <img src={lawyer.photo_url}/>
                    <p className='name'>{lawyer.name}</p>
                    <p className='intro'>
                      <ReadMore has_link={false} lines={2}>
                        {lawyer.intro}
                      </ReadMore>
                    </p>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default TopLawyers;
