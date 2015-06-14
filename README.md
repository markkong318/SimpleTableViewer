# SimpleTableViewer

This is a database viewer writtern by Backbone. All the table config is controlled by JSON js file

All we know phpMyAdmin is a good tool for viewing table. But it show too many detail people for regular people. phpMyAdmin also could not refer some columns from other table and showing the meaning of the column value.

For game director, he want to set a value about ENABLE flag, but he didn`t know what is the value of ENABLE flag. So I do such tool to embedded the meaning into the value. For the usability, all the configs are create by .js file and the table content will create dynamically.

The server side php code is mapping to our private model class. Please re-write it before use them

It is written in my private time and use in our framework

## Installation
1. Re-write the model code

2. Create the js config
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

3. Make sure you have install Backbone

## Demo
