var page_title = "マスタ- 連続ログインボーナス";
var model_name = "LoginBonusSheet";

var model_header = {

    "headers" : [
    {
        "column_key"    : "day",
        "column_name"   : "日目",
        "edit_flg"      : true,
        "edit_type"     : "text",
        "edit_default"  : ""
    },
    {
        "column_key"    : "item_id",
        "column_name"   : "アイテムID",
        "edit_flg"      : true,
        "edit_type"     : "text",
        "edit_default"  : "0"
    },
    {
        "column_key"    : "item_name",
        "column_name"   : "アイテム名",
        "refer_column_key" : "item_id",
        "refer_type"    : "item"
    },
    {
        "column_key"    : "count",
        "column_name"   : "個数",
        "edit_flg"      : true,
        "edit_type"     : "text",
        "edit_default"  : "0"
    }
]};