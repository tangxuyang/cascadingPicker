## 介绍
cascadingPicker是参考jquery-weui中的cityPicker写成的。支持多层次级联。建立在jquery-weui中的picker的基础上。暂时只支持全量数据加载，还不支持异步加载。

## 用法
1.引入依赖
* weui.min.css
* jquery-weui.min.css
* query-weui.min.js
* cascadingPicker.js  

2.调用
```javascript
$('input').cascadingPicker({
        title:"选择板块",
        toolbarCloseText:"关闭",
        data:[{
                text: "北京",
                id: "0000",
                nodes: [{
                    text: "朝阳区",
                    id: "0002",
                    nodes:[{
                        text:"某个地方",
                        id:"0030",
                        nodes:[{
                            text:"地方一",
                            id:"00301"
                        },{
                            text:"地方二",
                            id:"00302"
                        }]
                    }]
                }]
            }, {
                text: "上海",
                id: "0001",
                nodes: [{
                    text: "长宁区",
                    id: "0011",
                    nodes:[{
                        text:"福泉路",
                        id:"00111",
                        nodes:[{
                            text:"携程",
                            id:"001111"
                        },{
                            text:"东航",
                            id:"001112"
                        }]
                    },{
                        text:"虹桥路",
                        id:"00112",
                        nodes:[{
                            text:"悟空找房",
                            id:"001121"
                        },{
                            text:"地铁站",
                            id:"001122"
                        }]
                    }]
                }, {
                    text: "浦东新区",
                    id: "0012",
                    nodes:[{
                        text:"金桥",
                        id:"00121",
                        nodes:[{
                            text:"金桥一",
                            id:"001211"
                        },{
                            text:"金桥二",
                            id:"001212"
                        }]
                    },{
                        text:"花木",
                        id:"00122",
                        nodes:[{
                            text:"世纪大道",
                            id:"001221"
                        },{
                            text:"火狐",
                            id:"001222"
                        }]
                    }]
                }, {
                    text: "闵行区",
                    id: "0013",
                    nodes:[{
                        text:"交大",
                        id:"00131",
                        nodes:[{
                            text:"东川陆",
                            id:"001311"
                        }]
                    }]
                }]
            }]
    });
```