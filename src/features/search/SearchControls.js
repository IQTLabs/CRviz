import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSearch from "@fortawesome/fontawesome-free-solid/faSearch";
import faTimesCircle from "@fortawesome/fontawesome-free-solid/faTimesCircle";

import { selectDataset, getSearchResults } from "domain/dataset";

import { searchDataset } from "epics/search-dataset-epic";

import style from "./SearchControls.module.css";

const defaultState = {
  queryString: '',
  results: [],
  hasSearch: false
}

class Search extends React.Component {

  state = defaultState

  handleSearch(){
    this.setState({
      hasSearch: this.state.queryString !== ''
    });
    var data = {
      dataset:this.props.dataset,
      queryString: this.state.queryString,
      results: this.state.results
    }
    this.props.searchDataset(data);
  }

  clearSearch(){
    this.setState(defaultState, function() {
      this.handleSearch();
    });
  }

  handleQueryStringChange = (e) =>{
        this.setState({
          queryString: e.target.value
        });
  }

  handleKeyPress = (e) => {
    if(e.key === 'Enter'){
      this.handleSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      queryString: nextProps.queryString,
      results: nextProps.results
    });
  }

  render() {
    return (
      <div className={style.searchContainer}>
        <span className={ style.search }>
          <input
            type="search"
            id="search-string"
            placeholder="Search"
            value={this.state.queryString}
            onChange={this.handleQueryStringChange}
            onKeyPress={this.handleKeyPress}
          />

          <label htmlFor="search-string" className="button" onClick={() => this.handleSearch()}>
            <FontAwesomeIcon icon={faSearch} />
          </label>
        </span>
        { this.state.hasSearch &&
          <span>
            <label id="search-results"> {this.state.results.length}&nbsp;Results found </label>
            <label htmlFor="search-results" className="button" onClick={() => this.clearSearch()}>
              <FontAwesomeIcon icon={faTimesCircle} />
              </label>
          </span>
        }
      </div>
    );
  }
}

Search.propTypes = {
  dataset: PropTypes.array,
  queryString: PropTypes.string,
  results: PropTypes.array,
  searchDataset: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
    dataset: selectDataset(state),
    queryString: state.dataset.queryString,
    results: getSearchResults(state)
  };
}

const mapDispatchToProps = {
  searchDataset,
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
