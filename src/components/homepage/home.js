import React, { Component } from 'react';
import Header from './header';
import Content from './content';
import Footer from './footer';
import $ from 'jquery'
import Toast from '../notification/toast';
import { EventEmitter } from 'fbemitter';

import '../../assets/styles/common/home.css';

class Home extends Component {
	constructor(props){
		super(props);
    this.emitter = new EventEmitter();
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll);
		this.handleScroll();
	}

	handleScroll() {
		if (window.scrollY >= $('.slogan-section').offset().top) {
			$('.nav-hidden').fadeIn(500);
		}
		else {
			$('.nav-hidden').fadeOut(500);
		}

		if (window.scrollY >= ($('.hot-lawyers').offset().top + 350)) {
			$('.search-law').addClass('animated zoomIn');
		}
	}

  render() {
    return (
			<div className='home-page'>
				<Toast emitter = {this.emitter}/>
				<Header/>
				<Content emitter={this.emitter}/>
				<Footer/>
			</div>
    );
  }
}

export default Home;
