import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSearch from "@fortawesome/fontawesome-free-solid/faSearch";

import { selectDataset} from "domain/dataset";

import { searchDataset } from "epics/search-dataset-epic";

import style from "./SearchControls.module.css";

class Search extends React.Component {

  state = {
    queryString: '',
    results: []
  }

  handleSearch(){
    var data = {
      dataset:this.props.dataset,
      queryString: this.state.queryString,
      results: this.state.results
    }
    this.props.searchDataset(data);
  }

  handleQueryStringChange = (e) =>{
        this.setState({
          queryString: e.target.value
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
            value={this.props.queryString}
            onChange={this.handleQueryStringChange}
          />

          <label htmlFor="search-string" className="button" onClick={() => this.handleSearch()}>
            <FontAwesomeIcon icon={faSearch} />
          </label>
        </span>
        <span>
          <label> {this.state.results.length}&nbsp;Results found </label>
        </span>
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

const mapStateToProps = (state, ownProps) => ({
  dataset: selectDataset(state),
  queryString: state.queryString,
  results: state.results
});

const mapDispatchToProps = {
  searchDataset,
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
