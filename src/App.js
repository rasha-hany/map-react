import React, { Component } from 'react';
import './App.css';

import scriptLoader from 'react-async-script-loader';
import escapeRegExp from 'escape-string-regexp';

import { allLocation } from './locations.js';
import sortBy from 'sort-by';
import fetchJsonp from 'fetch-jsonp';
//import ListItem from './ListItem';


//for marker and infoWindow 
let markers = [];
let infoWindows = [];


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: allLocation,
     requestWasSuccessful: true,
      selectedMarker:'',
      map: {},
      query: '',
      data:[]       
  }
        
    }
  
  updatequery =(query) => {
    this.setState({query: query})
  }

  
  updateData = (getData) => {
    this.setState({
      data:getData,
    });
  }

    componentWillReceiveProps({isScriptLoadSucceed}){
    if (isScriptLoadSucceed) {
      
      var map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: new window.google.maps.LatLng(51.6840873266906,-0.09988121106366525),
       
      });
 
      this.setState({map:map});
    }
    else {
      console.log("google maps API couldn't load.");
      this.setState({requestWasSuccessful: false})
    }
  }
  


 
  componentDidUpdate(){

      
    const {locations, query,map} = this.state;
    let displayLocations=locations
    if (query){
      const match = new RegExp(escapeRegExp(query),'i')
      displayLocations = locations.filter((location)=> match.test(location.title))
    }
    else{
      displayLocations=locations
    }
    markers.forEach(mark => { mark.setMap(null) });

    markers = [];
    infoWindows = [];
    displayLocations.map((marker,index)=> {
        
    let getData = this.state.data.filter((single)=>marker.title === single[0][0]).map(item2=>
      {if (item2.length===0)
        return 'No Contents Have Been Found Try to Search Manual'
        else if (item2[1] !=='')
          return item2[1]
        else
          return 'No Contents Have Been Found Try to Search Manual'
      })
    let getLink = this.state.data.filter((single)=>marker.title === single[0][0]).map(item2=>
      {if (item2.length===0)
        return 'https://www.wikipedia.org'
        else if (item2[1] !=='')
          return item2[2]
        else
          return 'https://www.wikipedia.org'
      })
   
    let content =
    `<div tabIndex="0" class="infoWindow">
    <h4>${marker.title}</h4>
    <p>${getData}</p>
    <a href=${getLink}> More Information</a>
    
    </div>`
         
        
        //giving infromation from infoWindow
      let addInfoWindow= new window.google.maps.InfoWindow({
        content: content,
      });
    
        //Bounds
        
      let bounds = new window.google.maps.LatLngBounds();
  
        
        
    // Making Markers
        
      let addmarker = new window.google.maps.Marker({
        map: map,
        position: marker.location,
        animation: window.google.maps.Animation.DROP,
        name : marker.title
      });
 
      markers.push(addmarker);
      infoWindows.push(addInfoWindow);
      addmarker.addListener('click', function() {
          
          infoWindows.forEach(info => { info.close() });
          addInfoWindow.open(map, addmarker);
         
          if (addmarker.getAnimation() !== null) {
            addmarker.setAnimation(null);
          } else {
       
            addmarker.setAnimation(window.google.maps.Animation.BOUNCE);
            setTimeout(() => {addmarker.setAnimation(null);}, 400)
          }
        })
     
      markers.forEach((m)=>
        bounds.extend(m.position))
      map.fitBounds(bounds)
    })
  }



  listItem = (item, event) => {
    const chosen = markers.filter((currentOne)=> currentOne.name === item.title)
    window.google.maps.event.trigger(chosen[0], 'click');
  }
 
  handleKeyPress(target,item,e) {
    if(item.charCode===10){
     this.listItem(target,e)
   }
 }

  componentDidMount(){
    
    this.state.locations.map((location,index)=>{
      return fetchJsonp(`https://en.wikipedia.org/w/api.php?action=opensearch&search=' + location.title + '&imlimit=5&format=json&callback=wikiCallback`)
      .then(response => response.json()).then((responseJson) => {
        let getData = [...this.state.data,[responseJson,responseJson[2][0],responseJson[3][0]]]
        this.updateData(getData)
      }).catch(error =>
      console.error(error)      
      )
    })
  }
 
  
 
 render() {
  const {locations, query, requestWasSuccessful} = this.state;
   
     // filter Location
    let displayLocations
    if (query){
      const match = new RegExp(escapeRegExp(query),'i')
      displayLocations = locations.filter((location)=> match.test(location.title))
    }
    else{
      displayLocations =locations
    }
    displayLocations.sort(sortBy('title'))
    return (
      
        
      requestWasSuccessful ? (
        <div>
        <nav className="nav">
        <span id="subject" tabIndex='0'>The Neighborhoods</span>
        </nav>
        <div id="container">
        <div id="map-container" role="application" tabIndex="-1">
        <div id="map" role="region" aria-label="Neighborhoods"></div>
        </div>
    
      <div className='listView'>
      <input id="textToFilter" className='form-control' type='text'
      placeholder='Filter'
      value={query}
      onChange={(event)=> this.updatequery(event.target.value)}
      role="filter"
      aria-labelledby="Filter the Location"
      tabIndex="1"/>
      <ul aria-labelledby="list of locations" tabIndex="1">

    {displayLocations.map((getLocation, index)=>
      <li key={index} tabIndex={index+2}
      area-labelledby={`View details for ${getLocation.title}`} onKeyPress={this.handleKeyPress.bind(this,getLocation)} onClick={this.listItem.bind(this,getLocation)}>{getLocation.title}</li>)}
      </ul>
     <button className="button" tabIndex="0">Show/Hide Suggestions</button>  
      </div>
      </div>
      </div>
      ) : (
      <div>
      <h2>Error:Oh! Sorry Google Maps not found</h2>
      </div>

      )
      )
    }
  }

 export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=AIzaSyD_IeWHOd2g_nP9hz6o2ZdgHTVtfYinxZk&v=3.exp&libraries=geometry,drawing,places`]
    )(App);
