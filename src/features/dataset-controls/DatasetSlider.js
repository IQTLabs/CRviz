import React from 'react';
//import PropTypes from 'prop-types';
import classNames from 'classnames';

import { connect } from 'react-redux';

import style from "./DatasetControls.module.css";

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
      const source = e.dataTransfer.getData("text/plain");
      const slot = Number(e.target.dataset.slot);

      if (isNaN(slot)) return;
      
      const points = this.props.points;
      if (source === "min") {
        this.props.setStartUuid(points[slot]);
      } else if (source === "max") {
        this.props.setEndUuid(points[slot]);     }
    }

    onSlotClick = (e) => {
      const slot = Number(e.target.dataset.slot);

      if (isNaN(slot)) return;
      
      const points = this.props.points;

      console.log(this.props.startUuid);
      if(!this.props.startUuid){
        this.props.setStartUuid(points[slot]);
      }
      else if (!this.props.endUuid){
        this.props.setEndUuid(points[slot]);
      }
    }

    onMinClick = (e) => {
      this.props.setStartUuid(null);
    }

    onMaxClick = (e) => {
      this.props.setEndUuid(null);
    }
    
    MinSlider=()=> {
      return (
        <div data-slider="min" 
            onDragStart={this.onDragStart} 
            onDrag={this.onDrag}
            onDoubleClick={this.onMinClick}
            draggable className={
          classNames({[style.sliderThumb]:true, [style.sliderThumbMin]:true})}>
        </div>
      );
    }

    MaxSlider=()=> {
      return (
        <div data-slider="max" 
            onDragStart={this.onDragStart}  
            onDrag={this.onDrag}
            onDoubleClick={this.onMaxClick}
            draggable className={classNames({[style.sliderThumb]:true, [style.sliderThumbMax]:true})}></div>
      );
    }
   
    render() {
      const points = this.props.points;
      const startUuid = this.props.startUuid;
      const endUuid = this.props.endUuid;
      let scale =[];
      let slider=[];
      let currentScale = [];
      let minThumb = null;
      let maxThumb = null
      
      
      for (let i = 0; i <= points.length - 1; i++) {
        let label = "s" + i;

        scale.push(
          <div 
            key={points[i]} 
            className={style.slotScale}>
            {label}
          </div>
        );
      
        let currentLabel = "";
        
        if (points[i] === startUuid){
          currentLabel = "Start";
          minThumb = <this.MinSlider />
          maxThumb = null;
        } else if(points[i] === endUuid){
          currentLabel = "End";
          minThumb = null;
          maxThumb = <this.MaxSlider />
        } else {
          minThumb = null;
          maxThumb = null;
        }
        
        currentScale.push(
          <div 
            
            key={points[i]}
            className={style.slotScale}>
            {currentLabel}
          </div>
        );
          
        const lineIsSelected = startUuid !== null && endUuid !== null && i > points.indexOf(startUuid) && i < points.indexOf(endUuid);

        slider.push(
          <div 
            data-slot={i}
            onDragOver={this.onDragOver} 
            onDragEnter={this.onDragEnter} 
            onDrop = {this.onDrop}
            onClick = {this.onSlotClick}
            key={points[i]} 
            className={style.slot}>
              <div  data-slot={i} 
              className={classNames({
                [style.line]: true,
                [style.lineSelected]: lineIsSelected
              })}/>
              <span className={style.scaleMark}></span>
              {minThumb}
              {maxThumb}
          </div>
        );
      }
     
      return (
        <div>
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
        </div>
      );
    }
}      

// const mapStateToProps = (state, ownProps) => {

// }

// const mapDispatchToProps = {

// };

export default connect(null, null)(DatasetSlider);