/* global module, wx, window: false, document: false */
'use strict';

import WxChart from './base'
import {extend, is} from '../util/helper'

// Legend default config
const WX_LEGEND_DEFAULT_CONFIG = {
    'display': true,
    /**
     * position can set to :top, bottom, left(same as left bottom), right(same as right bottom), left top, left bottom, right top, right bottom
     */
    'position': 'top',
    'fullWidth': true, // if the fullWidth is false, the 'width' property should be existed.
    'labels': {
        'boxWidth': 30,
        'fontSize': 10,
        'padding': 5 // Padding width between legend items
    }
};

const WX_LEGEND_DEFAULT_ITEM_CONFIG = {
    'lineWidth': 2
};

export default class WxLegend {
    constructor(wxChart, config) {
        let me = this;

        if (!wxChart || !wxChart instanceof WxChart) {
            throw new Error('Should be an WxChart instance');
        }
        me.wxChart = wxChart;
        me.config = extend(true, {}, WX_LEGEND_DEFAULT_CONFIG, config);

        //
        // The datasets is an empty array at the first time
        // When you set 'data' attribute, the legend items will draw on Canvas
        // Format
        // {
        //    text: 'Displayed Text String',
        //    fillStyle: 'Color', // Fill style of the legend box
        //    hidden: Boolean, // If true, this item represents a hidden datasets. Label will be rendered with a strike-through effect,
        //    strokeStyle: 'Color'
        //    lineCap: String,
        //    lineJoin: String,
        //    lineWidth: Number
        // }
        this._datasets = [];
    }

    /**
     * Update datasets config
     * @param datasets
     * @param area
     * area's example: {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            lx: canvas.width - padding,
            ly: canvas.height - padding,
        };
     */
    update(datasets, area) {
        let me = this;

        if (is.Undefined(area) || is.Undefined(datasets)) {
            return;
        }

        me.clear();
        let config = me.config;
        let labelsConfig = config.labels || {};

        // Reset legendBox
        // Calculate the legend items
        datasets = me.calculateLegendItem(datasets, labelsConfig);
        // Calculate the top-lef point and width and height
        let box = me.calculateBox(datasets, area, labelsConfig);

        me._datasets = datasets;
        me.box = box;

        if (!!config.display) {
            me.draw(me._datasets);
        }
    }

    calculateLegendItem(datasets, labelsConfig) {
        let me = this;
        labelsConfig = labelsConfig || {};

        let ctx = me.wxChart.ctx;
        let boxWidth = labelsConfig.boxWidth;
        let fontSize = labelsConfig.fontSize;
        if (!is.Array(datasets) && is.Object(datasets)) {
            datasets = [datasets];
        }

        datasets = datasets.map(function (dt) {
            let dataset = extend({}, WX_LEGEND_DEFAULT_ITEM_CONFIG, dt);
            let textWidth = ctx.measureText(dataset.text).width;

            let width = boxWidth + (fontSize / 2) + textWidth;
            dataset._prop = {
                'fontSize': fontSize,
                'boxHeight': fontSize,
                'boxWidth': boxWidth,
                'textWidth': textWidth,
                'width': width
            };
            return dataset;
        });

        return datasets;
    }

    calculateBox(datasets, area, labelsConfig) {
        let me = this;
        let outerWidth, outerHeight,
            width, height;
        let wxChart = me.wxChart,
            ctx = wxChart.ctx,
            fontSize = ctx.fontSize;
        let x = area.x, y = area.y;
        let padding = labelsConfig.padding||10;

        if (me.isHorizontal()) {
            width = !!me.config.fullWidth ? (area.width - padding * 2) : me.config.width;
            outerWidth = !!me.config.fullWidth ? area.width: me.config.width;
            height = fontSize;
            outerHeight = height + padding * 2;

            // Calculate all items
            let lineNum = 0, currentLineWidth = 0, maxLineWidth = 0;
            datasets.forEach(function (dataset) {
                let prop = dataset._prop,
                    outerWidth = prop.width + padding;
                let lineWidth = currentLineWidth + outerWidth;
                if (lineWidth > width) {
                    // The previous line width
                    maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;
                    // We should take a new line
                    lineNum++;
                    // Set currentLineWidth = 0
                    currentLineWidth = outerWidth;

                    // The first item width insufficient..
                    if (outerWidth > width) {
                        // The width options is tooooo small!
                        console.warn('The width options is too small! width=', width, '.The chart will set to ', lineWidth);
                        width = outerWidth;
                    }
                } else {
                    currentLineWidth += outerWidth;
                }

                prop.padding = padding;
                prop.lineNum = lineNum;
                prop.outerWidth = outerWidth;
            });
            maxLineWidth = maxLineWidth < currentLineWidth ? currentLineWidth : maxLineWidth;

            // Re calculate the height of legend
            if (lineNum > 0) {
                height = fontSize*(lineNum+1) + lineNum*fontSize/2;
                outerHeight = height + padding * 2
            }

            x += (width - maxLineWidth) / 2;
            if (me.config.position == 'bottom') {
                y = area.ly - outerHeight;
                y = y < area.y ? area.y : y;
            }
        } else {
            let position = me.config.position.match(/left/) ? 'left' : 'right';
            let align = me.config.position.match(/top/) ? 'top' : 'bottom';
            let width = 0, lineNum = 0;
            datasets.forEach(function (dataset) {
                let wh = dataset._prop.width;
                width = width < wh ? wh : width;

                dataset._prop.padding = padding;
                dataset._prop.lineNum = lineNum;
                // not use to set prop.outerWidth
                dataset._prop.outerWidth = null;
                lineNum++;
            });
            outerWidth = width + padding * 2;
            height = fontSize*(lineNum+1) + lineNum*padding/2;
            outerHeight = height + padding * 2;

            if (align == 'bottom') {
                y = area.ly - outerHeight;
                y = y < area.y ? area.y : y;
            }
            if (position == 'right') {
                x = area.lx - outerWidth;
                x = x < 0 ? 0 : x;
            }
        }

        return {x, y, width, outerWidth, height, outerHeight};
    }

    /**
     * Draw legend
     * @param [datasets]
     */
    draw(datasets) {
        let me = this, ctx = me.wxChart.ctx;
        let {x, y, width, outerWidth, height, outerHeight} = me.box;

        // Clear the area of legend
        me.clear();

        // Begin a new sub-context
        ctx.save();
        // Draw all items
        datasets = datasets || me._datasets;
        let currentLineNum = -1;
        let currentX = x, currentY = y;
        datasets.forEach(function(dataset){
            let {text, hidden, fillStyle, strokeStyle, lineCap, lineJoin, lineWidth} = dataset;
            let {width, fontSize, textWidth, padding, lineNum, boxWidth, boxHeight, outerWidth} = dataset._prop;

            if (!width) {
                // No need to draw
                return;
            }

            // Set style
            ctx.textBaseline = 'top';
            ctx.textAlign = 'start';
            ctx.fillStyle = fillStyle;
            ctx.strokeStyle = strokeStyle;
            ctx.lineCap = lineCap;
            ctx.lineJoin = lineJoin;
            ctx.lineWidth = lineWidth;

            if (currentLineNum < lineNum) {
                currentLineNum = lineNum;
                currentX = x + padding;
                currentY = y + (lineNum*fontSize*1.5) + padding;
            }
            let thisX = currentX;
            // draw rect
            if (ctx.lineWidth != 0) {
                ctx.strokeRect(currentX, currentY, boxWidth, boxHeight);
            }
            ctx.fillRect(currentX, currentY, boxWidth, boxHeight);

            // draw text
            currentX += boxWidth + (fontSize / 2);
            ctx.fillText(text, currentX, currentY);

            // draw hidden strike through
            if (hidden) {
                ctx.save();
                // Strike through the text if hidden
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.moveTo(currentX,  currentY + (fontSize / 2));
                ctx.lineTo(currentX + textWidth, currentY + (fontSize / 2));
                ctx.stroke();
                ctx.restore();
            }

            currentX = thisX + outerWidth;
        });
        ctx.restore();

        ctx.draw();
    }

    clear() {
        let me = this;
        if (me.box) {
            me.wxChart.ctx.clearRect(
                me.box.x,
                me.box.y,
                me.box.outerWidth,
                me.box.outerHeight
            );
            me.wxChart.ctx.draw();
        }
    }

    isHorizontal() {
        let position = this.config.position;
        return position == 'top' || position == 'bottom';
    }
}