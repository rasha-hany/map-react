import React, {Component} from 'react';
import LocationsList from './LocationsList';

let markers = [];

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
  
      map: {},
      query: '',
      requestWasSuccessful: true,
      selectedMarker:'',
      data:[]
    };
	   this.filterLocations = this.filterLocations.bind(this);
        this.toggleSuggestions = this.toggleSuggestions.bind(this);
  }
	
	filterLocations(event) {
        this.props.closeInfoWindow();
        const {value} = event.target;
        var locations = [];
        this.props.alllocations.forEach(function (location) {
            if (location.longname.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                location.marker.setVisible(true);
                locations.push(location);
            } else {
                location.marker.setVisible(false);
            }
        });

        this.setState({
            'locations': locations,
            'query': value
        });
    }

    componentWillMount() {
        this.setState({
            'locations': this.props.alllocations
        });
    }
   
     
   
    toggleSuggestions() {
        this.setState({
            'suggestions': !this.state.suggestions
        });
    }

   
    render() {
        var locationlist = this.state.locations.map(function (listItem, index) {
            return (
                <LocationsList key={index} openInfoWindow={this.props.openInfoWindow.bind(this)} data={listItem}/>
            );
        }, this);

        return (
            <div className="search">
                <input role="search" aria-labelledby="filter" id="search-field" className="search-field" type="text" placeholder="Filter"
                       value={this.state.query} onChange={this.filterLocations}/>
                <ul>
                    {this.state.suggestions && locationlist}
                </ul>
                <button className="button" onClick={this.toggleSuggestions}>Show/Hide Suggestions</button>
            </div>
        );
    }
}

export default ListItem; 