/*  数据格式[{
    text:"",
    id:"",
    nodes:[{
      text:"",
      id:""
      nodes:[...]
    }]
  }]

  selects:[{    
    url:null,//查询接口地址
    //paramName:null,//查询的参数字段
    paramNameForNext:null,//带给下个select的查询的参数字段
    selected:function(){},//选中触发的事件
    data:{//附加参数

    },
    processResults:function(data){

    }
  }]
  */

+ function($) {
    "use strict";

    var defaults;    
    //data是数组，d是，result是数组
    var getSubItems = function(data,d,level,result){
      //console.log('level:'+level);
      if(!data || data.length === 0) return;
      if(level===0){
        for(var i = 0; i < data.length; i++){
          if(data[i].id === d || data[i].text === d){
            result.push(data[i].nodes);
            return;
          }
        }
      }else{
        for(var i = 0; i < data.length; i++){
          getSubItems(data[i].nodes,d,level-1,result);
        }
      }      
    }

    var parseInitValue = function(data,val) { //初始化值，val是text不是id
        var tokens = val.split('-'); //用空格分隔
        var tmpData = data;
        var index = 0;
        var result = [];
        var tmpItem;
        while(tmpData){
          tmpData.map(function(d){
            if(d.text === tokens[index]) tmpItem = d;
          });
          tmpData = tmpItem.nodes;
          result.push(tmpItem.id);
          index++;
        }

        return result;
    }

    $.fn.cascadingPicker = function(params) {
        params = $.extend({}, defaults, params); //综合params和defaults
        return this.each(function() {
            var self = this;

            var currentDisplayValues = [];
            var currentValues = [];
            var cols = [];
            var onChange = null;
            var cb = null;

            //收集cols
            var data = params.data;
            if(data){//全量数据
                var tmpData = data;
                var index = 1;
                while (tmpData && tmpData.length > 0) {
                    //console.log("tmpData:"+index);
                    var displayValues, values, cssClass = "col-" + index;
                    displayValues = tmpData.map(function(d) {
                        return d.text;
                    });
                    values = tmpData.map(function(d) {
                        return d.id;
                    });
                    cols.push({
                        displayValues: displayValues,
                        values: values,
                        cssClass: cssClass
                    });
                    currentDisplayValues.push(tmpData[0].text);
                    currentValues.push(tmpData[0].id);
                    tmpData = tmpData[0].nodes;//sub(tmpData[0]);
                    index++;
                }

                onChange = function(picker, values, displayValues) {
                    for (var i = 0; i < currentDisplayValues.length; i++) {
                        var currentDisplayValue = currentDisplayValues[i];
                        var newDisplayValue = picker.cols[i].displayValue;
                        if (newDisplayValue !== currentDisplayValue) {
                            var tmpDisplayValue = newDisplayValue;
                            for (var j = i + 1; j < currentDisplayValues.length; j++) {
                                var subItems = [];
                                getSubItems(data,tmpDisplayValue,j - 1,subItems);
                                picker.cols[j].replaceValues(subItems[0].map(function(d) {
                                    return d.id;
                                }), subItems[0].map(function(d) {
                                    return d.text;
                                }));
                                currentDisplayValues[j] = tmpDisplayValue;
                                tmpDisplayValue = subItems[0][0].text;
                            }
                            currentDisplayValues[i] = newDisplayValue;
                            picker.updateValue();
                            return false;
                        }
                    }
                    
                    $(self).attr('data-code', values[values.length - 1]);
                    $(self).attr('data-codes', values.join(','));
                    if (params.onChange) {
                        params.onChange.call(self, picker, values, displayValues);
                    }
                };
            }else{//异步
                params.selects.forEach(function(select,index){
                    cols.push({
                        displayValues:[""],
                        values:["null"],
                        cssClass:"col-" + index
                    });
                    currentDisplayValues.push('');
                    currentValues.push('null');
                });

                onChange = function(picker,values,displayValues){
                    console.log("async onchange");
                    for (var i = 0; i < currentDisplayValues.length; i++) {
                        var currentDisplayValue = currentDisplayValues[i];
                        var newDisplayValue = picker.cols[i].displayValue;
                        var currentValue = currentValues[i];
                        var newValue = values[i];
                        if (/*newDisplayValue !== currentDisplayValue*/newValue != currentValue ) {
                            //var tmpDisplayValue = newDisplayValue;
                            for (var j = i + 1; j < currentDisplayValues.length; j++) {
                                var subItems = [];
                                //getSubItems(data,tmpDisplayValue,j - 1,subItems);
                                picker.cols[j].replaceValues(["null"], [""]);
                                currentValues[j] = 'null';
                                currentDisplayValues[j] = '';
                                //currentDisplayValues[j] = tmpDisplayValue;
                                //tmpDisplayValue = subItems[0][0].text;
                            }
                            currentDisplayValues[i] = newDisplayValue;
                            currentValues[i] = newValue;
                            
                            //刷新数据
                            var parentSelect = params.selects[i];
                            var select = params.selects[i+1];
                            if(select&&values[i]!='null'){
                                var param = $.extend({},select.data);
                                if(parentSelect.paramNameForNext){
                                    param[parentSelect.paramNameForNext] = values[i];
                                }
                                $.ajax({
                                    url: select.url,
                                    data:param,
                                    success:function(data){
                                        data = select.processResults && select.processResults(data) || data;

                                        picker.cols[i+1].replaceValues(data.map(function(d){
                                            return d.id;
                                        }),data.map(function(d){
                                            return d.text;
                                        }))

                                        picker.updateValue();
                                    }
                                });
                            }
                            picker.updateValue();
                            return false;
                        }
                    }
                    
                    //picker.updateValue();
                    return false;
                };

                //获取第一个的数据
                cb = function(){
                    var param = $.extend({},params.selects[0].data);
                    var select = params.selects[0];
                    var picker = $(self).data('picker');
                    $.ajax({
                        url: params.selects[0].url,
                        data:param,
                        success:function(data){
                            data = select.processResults && select.processResults(data) || data;

                            picker.params.cols[0].values = data.map(function(d){
                                return d.id;
                            });
                            picker.params.cols[0].displayValues = data.map(function(d){
                                return d.text;
                            });
                            /*picker.cols[0].replaceValues(data.map(function(d){
                                return d.id;
                            }),data.map(function(d){
                                return d.text;
                            }))*/

                            //picker.updateValue();
                        }
                    });
                };
            }

            var config = {

                cssClass: "city-picker",
                rotateEffect: false, //为了性能
                formatValue: function(p, values, displayValues) {
                    return params.formatValue && params.formatValue(p,values,displayValues) || displayValues.join('-');
                },
                onChange: onChange,
                cols: cols
            };

            if (!this) return;
            var p = $.extend({}, params, config);

            var val = $(this).val();
            /*if (!val){ 
              val = currentDisplayValues.map(function(){
                return "xx";
              }).join(' ');
            }*///没有值就给个默认值

            if (val) {
                p.value = parseInitValue(data,val); //
                var index = 0;
                var value = p.value[index];
                while(index < currentDisplayValues.length - 1){
                  var subItems = [];
                  getSubItems(data,value,index,subItems);
                  p.cols[index+1].values = subItems[0].map(function(d){
                    return d.id;
                  });
                  p.cols[index+1].displayValues = subItems[0].map(function(d){
                    return d.text;
                  });

                  index++;
                  value = p.value[index];
                }                
              }
            
                                    
            $(this).picker(p);

            cb && cb();
        });
    };

    //暂时没有
    defaults = $.fn.cascadingPicker.prototype.defaults = {

    };
}($);
