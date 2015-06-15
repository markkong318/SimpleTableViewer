# SimpleTableViewer

This is a database viewer writtern by Backbone. All the table config is controlled by JSON js file

All we know phpMyAdmin is a good tool for viewing table. But it shows too many details for regular people. phpMyAdmin also could not refer some columns from other table and showing the meaning of the column value.

For game director, he want to set a value about ENABLE flag, but he didn`t know what is the value of ENABLE flag. So I did such tool to embedded the meaning into the value. For the usability, all the configs are create by .js file and the table content will create dynamically.

The server side php code is mapping to our private model class. Please re-write it before use them

It is written in my private time and use in our framework

## Installation
1. Re-write the model code

2. Create the js config, and save it as the model name
ex. model is LoginBonusSheet, js config file should be LoginBonusSheet.js

```
var page_title = "マスタ- 連続ログインボーナス";  //タイトル
var model_name = "LoginBonusSheet";               //対応モデル

var model_header = {

    "headers" : [
    {
        "column_key"    : "day",　　　　　　　　　//カラム名
        "column_name"   : "日目",                 //名前
        "edit_flg"      : true,                   //編集フラグ
        "edit_type"     : "text",                 //タイプ
        "edit_default"  : ""
    },
...
    {
        "column_key"    : "item_name",
        "column_name"   : "アイテム名",
        "refer_column_key" : "item_id",           //アイテムID外部参照
        "refer_type"    : "item"
    },
...
]};
```

3. Make sure you have the following js for showing UI
jQuery
Backbone
Underscore
jquery.simplePagination
apprise-v2

4. access url by model_editor.php?model_name={モデル}
model_editor.php?model_name=LoginBonusSheet

## Demo
1. By the description of JS config file, the client will request model data and generate page dynamically
![alt text](https://github.com/markkong318/SimpleTableViewer/blob/master/readme/screenshot/1.png)

2. Also the create and edit page will also generated by JS config file
![alt text](https://github.com/markkong318/SimpleTableViewer/blob/master/readme/screenshot/2.png)

## Future work
1. Support more input type, like selectbox in JS config
