import React from 'react';
//import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";

import { SliderRail, Handle, Track, Tick } from "features/slider-utils/slider-components"; 

class DatasetSlider extends React.Component {
    state = {
      start: null,
      end: null,
      labelMode: "long",   // mid, long
    }
    
    onDragEnter = (e) => {
      e.preventDefault();
    }

    onDragOver = (e) => {
      e.preventDefault();
    }
    
    onDragStart = (e) => {
      const slider  = e.target.dataset.slider;
      e.dataTransfer.setData("text/plain", slider);
    }
    
    onDrop = (e) => {
      e.preventDefault();
      const source = e.dataTransfer.getData("text/plain");
      const slot = Number(e.target.dataset.slot);
      const points = this.props.points;
      if(isNaN(slot)) return;

      if (source === "min") {
        this.props.setStartUuid(points[slot]);
      } else if (source === "max") {
        this.props.setEndUuid(points[slot]);     }
    }

    onSlotClick = (e) => {
      const slot = Number(e.target.dataset.slot);

      if (isNaN(slot)) return;
      
      const points = this.props.points;
      if(points.indexOf(this.props.startUuid) === -1){
        this.props.setStartUuid(points[slot]);
      }
      else if (points.indexOf(this.props.endUuid) === -1){
        this.props.setEndUuid(points[slot]);
      }
    }

    onHandleClick = (e) => {
    }

    onUpdate = (e) =>{

    }

    onChange = (e) =>{
      const start = e.length > 1 ? this.props.points[e[0]] : null;
      const end = e.length > 1 ? this.props.points[e[1]] : this.props.points[e[0]];
      
      if(start){
        this.props.setStartUuid(start.owner);
      }
      if(end && end !== start){
        this.props.setEndUuid(end.owner);
      }
      if(end && end === start){
        this.props.setEndUuid('UNSET');
      }
    }
    
    formatTicks = (t) => {
      if(this.props.points && this.props.points[t]){
        return this.props.points[t].shortName;
      }
      else {
        return "";
      }
    };
   
    render() {
      const points = this.props.points;
      const startUuid = this.props.startUuid;
      const endUuid = this.props.endUuid;

      const sliderStyle = {
        position: "relative",
        width: "100%"
      };

      const domain = [0, Math.max(points.length -1, 0.1) ];
      
      const startIdx = points.findIndex( p => p.owner === startUuid);
      const endIdx = points.findIndex( p => p.owner === endUuid);
      const defaultValues = [startIdx, endIdx];

      // if(startIdx >= 0){
      //   defaultValues.push(startIdx);
      // }
      // if(endIdx >= 0 && endIdx > startIdx){
      //   defaultValues.push(endIdx);
      // }
     
      return (
       <div style={{ margin: "10%", height: 60 }}>
        <Slider
          mode={1}
          step={1}
          domain={domain}
          rootStyle={sliderStyle}
          onUpdate={this.onUpdate}
          onChange={this.onChange}
          values={defaultValues}
        >
          <Rail>
            {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
          </Rail>
          <Handles>
            {({ handles, getHandleProps }) => (
              <div className="slider-handles">
                {handles.map(handle => (
                  <Handle
                    key={handle.id}
                    handle={handle}
                    domain={domain}
                    getHandleProps={getHandleProps}
                  />
                ))}
              </div>
            )}
          </Handles>
          <Tracks left={false} right={false}>
            {({ tracks, getTrackProps }) => (
              <div className="slider-tracks">
                {tracks.map(({ id, source, target }) => (
                  <Track
                    key={id}
                    source={source}
                    target={target}
                    getTrackProps={getTrackProps}
                  />
                ))}
              </div>
            )}
          </Tracks>
          <Ticks count={points.length}>
            {({ ticks }) => (
              <div className="slider-ticks">
                {ticks.map(tick => (
                  <Tick key={tick.id} tick={tick} count={ticks.length} format={this.formatTicks} />
                ))}
              </div>
            )}
          </Ticks>
        </Slider>
      </div>
      );
    }
}      



// const mapStateToProps = (state, ownProps) => {

// }

// const mapDispatchToProps = {
 /*<div>
          <div>
            <div className={style.sliderContainer}>
             
             <div className={style.sliderScale}>
                 {scale}
              </div>
        
              <div className={style.slider}>
                  {slider}
              </div>
             
              <div className={style.sliderSelectedScale}>
                  {currentScale}
              </div>
             
            </div>
          </div>
        </div>*/
// };

export default connect(null, null)(DatasetSlider);