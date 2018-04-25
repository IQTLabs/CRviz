import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSearch from "@fortawesome/fontawesome-free-solid/faSearch";


import style from "./SearchControls.module.css";

class Search extends React.Component {

  state = {
    queryString: ''
  }

  search = (queryString) =>{
    alert("you searched for: \n" + queryString + "\nGood luck with that.");
    return queryString;
  }

  handleSearch(){
    this.search(this.state.queryString);
  }

  handleQueryStringChange = (e) =>{
    this.setState({
      queryString:e.target.value
    })
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
          />

          <label htmlFor="search-string" className="button" onClick={() => this.handleSearch()}>
            <FontAwesomeIcon icon={faSearch} />
          </label>
        </span>
      </div>
    );
  }
}

Search.propTypes = {
  queryString: PropTypes.string
};

const mapStateToProps = (state) => ({
  //searchResults: null,
});

const mapDispatchToProps = {
  //searchResults
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
