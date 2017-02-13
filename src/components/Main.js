require('normalize.css/normalize.css');
require('styles/App.styl');

import React from 'react';
import ReactDOM from 'react-dom';

let imageDatas = require('../data/imgData.json');

// 获取区间内的一个随机值
function getRangeRandow(low, high){
    return Math.ceil(Math.random() * (high - low) + low);
}

// 获取0~30度区间内的一个随机值
function getRotateRandow(){
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

// 获取图片相关数据
imageDatas = (function getImageURL(imageDatasArr){
    for(let i = 0, j = imageDatasArr.length; i < j; i++){
        let singleImageData = imageDatasArr[i];
        singleImageData.imageURL = require('../images/demo/' + singleImageData.url);

        imageDatasArr[i] = singleImageData;
    }
    return imageDatasArr;
})(imageDatas);

// 获取json中图片的url
let ImgFigures = React.createClass({

    handleClick: function(e){ // imgFigure的点击处理函数
        if( this.props.arrange.isCenter ){
            this.props.inverse();
        }else{
            this.props.center();
        }

        e.stopPropagation();
        e.preventDefault();
    },
    render: function(){
        let styleObj = {};

        // 如果props属性中指定了这张图片的位置,则使用
        if( this.props.arrange.pos ){
            styleObj = this.props.arrange.pos;
        }

        // 如果图片的旋转角度有值且不为0,则添加旋转角度
        if( this.props.arrange.rotate ){
            let arr = [''];

            arr.forEach(function( value ){
                styleObj[ value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this));
        }

        if( this.props.arrange.isCenter ){
            styleObj.zIndex = 11;
        }

        let imgFigureClassName = "img-figure";
            imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return(
            <figure className= {imgFigureClassName} style = {styleObj} onClick = {this.handleClick}>
                <div className = "img-box">
                    <img src={this.props.data.imageURL} alt={this.props.data.title} />
                    <h2>{this.props.data.title}</h2>
                </div>
                <figcaption>
                    <div className = "img-back" onClick = {this.handleClick}>
                        <p>{this.props.data.dec}</p>
                    </div>

                </figcaption>
            </figure>
        )
    }
});


// 控制组件
let ControllerUnit = React.createClass({

    handleClick: function(e){
        // 如果点击的是当前正在选中态的按钮,则翻转图片
        if( this.props.arrange.isCenter ){
            this.props.inverse();
        }else{
            this.props.center();
        }

        e.preventDefault();
        e.stopPropagation();
    },

    render: function(){

        let controllerUnitClassName = 'controller-unit';

        if( this.props.arrange.isCenter ){
            controllerUnitClassName += ' is-center';

            if( this.props.arrange.isInverse ){
                controllerUnitClassName += ' is-inverse';
            }
        }


        return(
            <span className = {controllerUnitClassName} onClick = {this.handleClick}></span>
        )

    }
});

let GalleryByReactApp = React.createClass({
    getInitialState: function(){
        return {
            imgsArrangeArr: [
                /*{
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: '0',  // 旋转角度
                    isInverse: false, // 图片正反面
                    isCenter: false // 图片居中
                }*/
            ]
        }
    },

    Constant: {
        centerPos: {    // 中心点
            left: 0,
            top: 0
        },
        hPosRange: {    // 水平方向的取值范围
            leftSecX: [0,0],
            rightSecX: [0,0],
            y: [0,0]
        },
        vPosRange: {    // 垂直方向的取值范围
            x: [0,0],
            topY: [0,0]
        }
    },

    /*
     * 利用 rearrange函数,居中对应Index的图片
     * @param index 需要被居中的图片index值
     * @return {function} 这是一个闭包函数,其内return一个真正待被执行的函数
     */

    center: function( index ){
        return function(){
            this.rearrange( index );
        }.bind(this);
    },

    /*
     * 翻转图片
     * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的Index值
     * @return {function} 这是一个闭包函数,其内return一个真正待被执行的函数
     */
    inverse: function( index ){
        return function(){
            let imgsArrangeArr = this.state.imgsArrangeArr;

            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

            this.setState({
                imgsArrangeArr: imgsArrangeArr
            });
        }.bind(this);
    },

    /*
     * 重新部局所有图片
     * @param centerIndex 指定居中排布哪个图片
     */
    rearrange: function(centerIndex){
        let imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,
            hPosRangeLeftSecx = Constant.hPosRange.leftSecX,
            hPosRangeRightSecx = Constant.hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,

            imgsArrangeTopArr = [],
            topImgSpliceIndex = 0,
            topImgNum = Math.floor( Math.random()*2 ), // 取一个或者不取
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        // 居中centerIndex 的图片, 居中的图片不需要旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        };

        // 取出要布局上侧的图片的状态信息
        topImgSpliceIndex = Math.ceil( Math.random()*(imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function(value, index){
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandow( vPosRangeTopY[0],vPosRangeTopY[1] ),
                    left: getRangeRandow( vPosRangeX[0],vPosRangeX[1] )
                },
                rotate: getRotateRandow(),
                isCenter: false
            }
        });

        // 布局左右两侧图片
        for( var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++){
            let hPosRangeLORX = null;

            // 前半部分布局左边,右半部分布局右边
            if( i < k ){
                hPosRangeLORX = hPosRangeLeftSecx;
            }else{
                hPosRangeLORX = hPosRangeRightSecx;
            }

            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandow( hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandow( hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: getRotateRandow(),
                isCenter: false
            };
        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    },

    //组件加载完成后,为每张图片计算其位置范围
    componentDidMount: function(){

        // 首先获取到舞台的大小
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);

        // 获取某一个imgFigure的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);

        // 计算中心图片的位置
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };

        // 计算左侧区域图片排布位置取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

        // 计算右侧区域图片排布位置取值范围
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        // 计算上侧区域图片排布位置取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        // 指定当前居中的图片
        this.rearrange(0);
    },

    render: function () {

        let controllerUnits = [],
            imgFigures = [];

        imageDatas.forEach(function (value, index) {
            // 初始化定位对象
            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: '0',
                    isInverse: false,
                    isCenter: false
                }
            }

            imgFigures.push(<ImgFigures key={index} data = {value} ref = {'imgFigure' + index} arrange = {this.state.imgsArrangeArr[index]} inverse = {this.inverse(index)}  center = {this.center(index)} />);

            controllerUnits.push(<ControllerUnit arrange = {this.state.imgsArrangeArr[index]} inverse = {this.inverse(index)}  center = {this.center(index)} />);
        }.bind(this));

        return (
            <section className="content">
                <section className="stage" ref="stage">
                    <section className="img-sec">
                        {imgFigures}
                    </section>
                    <nav className="controller-nav">
                        {controllerUnits}
                    </nav>
                </section>
            </section>
        )
    }
});

/*class AppComponent extends React.Component {
  render() {

    return (
    	<section className="content">
          <section className="stage">
              <section className="img-sec">
                {ImgFigures}
              </section>
              <nav className="controller-nav">

              </nav>
          </section>
    	</section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;*/

module.exports = GalleryByReactApp;
