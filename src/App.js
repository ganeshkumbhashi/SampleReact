import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
//import logo from './logo.svg';
import './App.css';

//let welcomeMsg = "Welcome to React JS 4";

 const PATH_BASE = 'https://hn.algolia.com/api/v1';
 const PATH_SEARCH = '/search';
 const PARAM_SEARCH = 'query=';
 const DEFAULT_QUERY = 'redux';
 const PARAM_PAGE = 'page=';
 const DEFAULT_HPP = '100';
 const PARAM_HPP = 'hitsPerPage=';
 
 const largeColumn = {
   width:'40%',
 };

 const midColumn = {
   width:'30%',
 };

 const smallColumn = {
   width: '10%',
 };

class App extends Component {

  _isMounted = false;

  constructor(props)
  {
    super(props);
    this.state = {
      results:null,
      searchKey:'',
      searchTerm:DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };
  }

  
  onSearchSubmit = (event) => {
    const {searchTerm} = this.state;
    this.setState({
      searchKey : searchTerm
    });
    if(this.needsToSearchTopStories(searchTerm))
    {
      this.fetchSearchTopStories(searchTerm);
    }
    //event.preventDefault();
  }

  fetchSearchTopStories = (searchTerm,page=0) => {
    this.setState({isLoading:true});
    const surl = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    console.log("fetchSearchTopStories:"+surl);

    
    axios(surl)
    .then(result => this._isMounted && this.setSearchTopStories(result.data))
    .catch(error => this._isMounted && this.setState({
      error
    }))
  }

  onSearchChange = (event) => {
    console.log("onSearchChange:"+event.target.value)
    this.setState({
      searchTerm : event.target.value
    });
  }

  onDismiss = (id) => {
    
    const {searchKey,results} = this.state;
    const {hits,page} = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results : {
        ...results,
        [searchKey]:{
          hits: updatedHits,
          page
        }
      }
    });
    
  }

  setSearchTopStories = (result) => {
    const {hits,page} = result;
    const {searchKey,results} = this.state;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      results : {
        ...results,
        [searchKey]:{hits: updatedHits,page}
      },
      isLoading:false
    });
  }

  componentDidMount(){

    this._isMounted = true;

    const { searchTerm } = this.props;
    console.log("ComponentDidMount: SearchTerm: "+searchTerm);

    this.setState({
      searchKey : searchTerm
    });
    
    console.log("componentDidMount:"+searchTerm)
    this.fetchSearchTopStories(searchTerm);

  }

  componentWillMount(){

    this._isMounted=false;

  }

  needsToSearchTopStories = searchTerm => {
    return !this.state.results[searchTerm];
  }


  render() {
    //var welcomeMsg = "Welcome to React JS";

    const {searchTerm,results,searchKey,error,isLoading} = this.state;
    console.log("render:"+searchTerm);

    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    console.log("page number: "+page);

    const list = (results && results[searchKey] && results[searchKey].hits) || [];

  return (

      <div className="page">
        <div className="interactions">
        <Search value={searchTerm} onChange={this.onSearchChange}  onSubmit={this.onSearchSubmit}>
          Search
        </Search>
        </div>
        {
          error ? <div className="interactions"><p>Something went wrong</p></div> : <Table list={list}  onDismiss={this.onDismiss}/>
        }
        <div className="interactions">
        <ButtonWithLoading isLoading={isLoading} onClick={() => this.fetchSearchTopStories(searchKey,page+1)
          }>More

        </ButtonWithLoading>

      
        </div>        
      </div>
    );
  }
}

class Search extends Component
{
  componentDidMount(){
    if(this.input)
    {
      this.input.focus();
    }
  }

  render(){
    const {value,onChange,onSubmit,children} = this.props;
    return(
      <form onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange} ref={(node) => {this.input = node;}}/>
        <button type="submit">{children}</button>
      </form>
    );
  }
}

const withLoading = (Component) => (isLoading,...rest) => isLoading ? <Loading/> : <Component {...rest} /> 

const Button = ({onClick,className,children}) =>  <button onClick={onClick} className={className} type="button">{children}</button>;

const ButtonWithLoading = withLoading(Button);

Button.PropTypes = {
  onClick : PropTypes.func.isRequired,
  className : PropTypes.string,
  children : PropTypes.node.isRequired,
};

Button.defaultProps = {
  className: '',
}

const Loading = () => <div>Loading...</div>

const Table = ({list,onDismiss}) => 
  <div className="table">
    {list.map(item => 
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
        </span>
        <span style={midColumn} >{item.author}</span>
        <span style={smallColumn}>{item.num_comments}</span>
        <span style={smallColumn}>{item.points}</span>
        <span style={smallColumn}>
          <Button onClick={() => onDismiss(item.objectID)} className="button-inline">Dismiss</Button>
        </span>
      </div>  
    )} 
  </div>

  Table.PropTypes = {
    list: PropTypes.arrayOf(
      PropTypes.shape({
        objectID : PropTypes.string.isRequired,
        author : PropTypes.string,
        url : PropTypes.string,
        num_comments : PropTypes.number,
        points : PropTypes.number,
      })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired,
  };



export default App;

export {

  Button,
  Search,
  Table,

};
