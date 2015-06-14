<?php 
require_once 'lib/header.php';
?>
<script src="js/upclick.js"></script>
<script src="view/js/model_editor/<?=$model_name ?>.js"></script>
<script src="view/js/<?=basename($_SERVER["SCRIPT_NAME"], ".php") ?>.js"></script>
<script type="text/javascript">
$(document).ready(function(){
    $("#page_title").html(page_title);

    var current_page = "master.php";

    $(".actions > ul").each(function(){

        var page_link = $(this).find("a").attr("href");
        var page_text = $(this).find("a").text();

        if(current_page == page_link){
            $(this).find("li").html("<strong>" + page_text + "</strong>");
        }
    });
});
</script>

<h3 id="page_title"></h3>

<div id="tool_panel">
	<table>
		<tr>
			<td>
				<input type="button" class="new" value="新規" />
			</td>
		</tr>
	</table>
</div>

<div id="main_panel">
	<table class="main_table">
		<thead>
		</thead>
		<tbody>
		</tbody>
	</table>

    <script type="text/template" id="tpl_main_header">
        <tr>
            <th style="width:1%; white-space:nowrap;">#</th>

            <% _.each(headers, function(header){ %>
                <th><%=header.column_name %></th>
            <% }); %>

            <th width="1%" style="white-space:nowrap;">操作</th>
        </tr>
    </script>

	<script type="text/template" id="tpl_main_table">
		<td style="width:1%; white-space:nowrap;"><%=model.i %></td>

        <% _.each(headers, function(header){ %>
            <td><%=model[header.column_key] %></td>
        <% }); %>

		<td style="width:1%; white-space:nowrap;">
            <input type='button' class='edit' value='編集' />
            <input type='button' class='delete button_red' value='削除' />
		</td>
	</script>

	<span class="pagination"></span>
    <br />
    <br />
    <a href="" class="csv_download">csvダウンロード</a> <br />
    <a href="" class="csv_upload">csvアップロード</a>

</div>

<div id="edit_panel" class="reveal-modal">
	<h3><span class="panel_title"></span></h3>
	<form id="edit_form" action="#" method="POST">
		<table>
		</table>
	</form>
    <script type="text/template" id="tpl_edit_table">
        <% _.each(headers, function(header){ %>
            <% if(header.edit_flg == true) %>
                <tr>
                    <td width="30%"><%=header.column_name %></td>
                    <td width="70%">
                        <% if(header.edit_type = "text"){ %>
                        <input type="text" name="<%=header.column_key %>" />
                    </td>
                </tr>
            <% } %>
        <% }); %>
    </script>
	<input type="button" class="edit_confirm" value="確定" />&nbsp;
	<input type="button" class="edit_cancel" value="取消" />
</div>
<?php
require_once 'lib/footer.php';