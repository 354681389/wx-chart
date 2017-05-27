# wx-chart
[![NPM version][npm-version-image]][npm-url]
[![MIT License][license-image]][license-url]
跨平台微信小程序图形库

## 介绍
wx-chart是一个适用于微信小程序以及H5页面的跨平台的图形库。

### 特点
* 跨平台：可以使用在普通页面以及微信小程序中
* 封装性：基于自有开发的Canvas兼容层，支持W3C的Canvas标准。
* 自动化：图形绘画参数简单，颜色填充和布局分发可以自动化
* 扩展性：组件化设计，支持图形扩展（接口待开放）

当前持续更新中，有任何问题欢迎在 [Issues](https://github.com/xch89820/wx-chart/issues) 中讨论。

### 支持图表
* 线状图
  单维度/多维度曲线图(Line)，单维度/多维度区域曲线图(Area Line)
* 饼状图
  单维度饼状图(Pie)，单维度多纳圈图(Doughnut)
* 柱状图
  单维度/多维度柱状图(Bar)，多维度堆叠柱状图(Stacked Bar)

##### 待计划支持图表
* 泡状图
* 雷达图

## 安装部署

### 安装
您有几种方式下载wx-chart

* 直接下载 [releases](https://github.com/xch89820/wx-chart/releases) 工程并使用`dist`文件夹中的版本
* 下载 [master](https://github.com/xch89820/wx-chart) 分支，并手工使用`npm install && gulp build`编译最新版本使用
* 使用`npm install wx-chart --save-dev`命令下载

#### 微信小程序环境部署
在微信小程序环境中，你需要拷贝`wx-chart.min.js`(如果需要调试，可以拷贝`wx-chart.js`)至你的程序文件夹下，而后使用`require`函数加载
```js
let WxChart = require("/path/to/wx-chart.min.js");
//..

let wxBar = new WxChart.WxBar('youCanvasId', { //... });
//...
```
可参见微信小程序实例：https://github.com/xch89820/wx-chart-demo

#### AMD环境部署
在浏览器AMD环境（实例中假设已经引用require.js)
```
// 配置入口
require.config({
    path :{
        "wx-chart" : "/path/to/wx-chart.min.js"
    }
});
```
而后在js中使用
```
require(["wx-chart"], function(WxChart){
    let wxBar = new WxChart.WxBar('youCanvasId', { //... });
    //...
});
```
#### 浏览器环境部署
在普通浏览器中，在HTML中直接引用`wx-chart.min.js`
```html
<script src="/path/to/wx-chart.min.js"></script>
```
而后在js中使用全局变量`WxChart`
```js
var wxDoughnut = new WxChart.WxDoughnut('youCanvasId', { //... });
//...
```
可参见dome文件夹中的```base.html```文件

## 实际效果以及Demo
![pie](https://cloud.githubusercontent.com/assets/4920540/26517971/893602c2-42d7-11e7-9009-3cdfebf16f63.JPG)
![bar](https://cloud.githubusercontent.com/assets/4920540/26517970/8933f522-42d7-11e7-8e78-a93c567f3bc0.JPG)
![stacked](https://cloud.githubusercontent.com/assets/4920540/26517972/8937459c-42d7-11e7-9fe9-eaf8acc2e852.JPG)
![line](https://cloud.githubusercontent.com/assets/4920540/26517973/89460140-42d7-11e7-8576-e1503e7cf4df.JPG)
![doughnut](https://cloud.githubusercontent.com/assets/4920540/26517974/894c57a2-42d7-11e7-9856-a300fa72a2c8.JPG)

微信小程序实例，请参见：
https://github.com/xch89820/wx-chart-demo

## 文档
待编写...

## License

wx-chart 遵循 [MIT license](http://opensource.org/licenses/MIT)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://opensource.org/licenses/MIT

[npm-url]: https://www.npmjs.com/package/wx-chart
[npm-version-image]: http://img.shields.io/npm/v/wx-chart.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/wx-chart.svg?style=flat
