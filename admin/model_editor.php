<?php
require_once 'lib/ctrl_web.php';
require_once 'admin/lib/auth.php';
require_once 'admin/lib/TableArray/all.php';
require_once 'admin/lib/Csv/CsvExporter.php';
require_once 'lib/item.php';
require_once 'lib/Class/SshSwitch.php';
require_once 'lib/Class/DbSwitch.php';
include 'lib/PhpSecLib/Net/SSH2.php';
include 'lib/PhpSecLib/Net/SFTP.php';


if(isset($_GET['j'])){
    $type = $_GET['type'];

    if($type == 'item'){
        $item_id = $_GET['item_id'];

        $item_name = getItemName($item_id);

        echo json_encode(array('name' => $item_name));
        exit;
    }
}

//モデルネームを取得
$model_name = $_GET['model_name'];

//モデルを初期化
$m_model = $model_name::getInstance();

if(isset($_GET['b'])){
	
	$page_action = $_GET['page_action'];
    appli_log_s("model:".$model_name);

	if($page_action == "relational_model"){
		
		$sql = "SELECT count(*) AS count FROM `{$m_model->table}` WHERE delete_dt IS NULL";
		$sql_result = $m_model->sql($sql);
		$count = $sql_result[0]['count'];
		
		$current_page = $_GET['currentPage'];
		$item_on_page = $_GET['itemsOnPage'];
		
		$limit_from = ($current_page - 1) * $item_on_page;
		
		$sql = "SELECT * FROM `{$m_model->table}` WHERE delete_dt IS NULL ORDER BY id ASC LIMIT {$limit_from},{$item_on_page}";
		$models = $m_model->sql($sql);
		
		$result = array(
				'currentPage' => $current_page,
				'itemsOnPage' => $item_on_page,
				'items' => $count,
				'models' => $models,
		);

        appli_log_s(print_r($result,true));
		
		echo json_encode($result);
		exit;
		
	}else if($page_action == "model"){

	
		if($_SERVER['REQUEST_METHOD'] == 'GET'){
			
			$models = $m_model->list_where();
			
			echo json_encode($models);
			exit;
		}else if($_SERVER['REQUEST_METHOD'] == 'POST'){
			$query = json_decode(file_get_contents('php://input'), TRUE);

            unset($query['i']);
            unset($query['create_dt']);
            unset($query['update_dt']);
            unset($query['delete_dt']);

            //データを追加する
			$id = $m_model->add($query);
			
			$query['id'] = $id;

            //キャッシュクリア
            $m_model->flush_cache();
			
			echo json_encode($query);
			exit;
		}else if($_SERVER['REQUEST_METHOD'] == 'PUT'){
			$query = json_decode(file_get_contents('php://input'), TRUE);

            //設置いらないカラム
            unset($query['i']);
            unset($query['create_dt']);
            unset($query['update_dt']);
            unset($query['delete_dt']);

            //アップデートする
			$m_model->set_where(array(
					"id" => $_GET['id'],
			), $query);

            //キャッシュクリア
            $m_model->flush_cache();
			
			echo json_encode($query);
			exit;
		}else if($_SERVER['REQUEST_METHOD'] == 'DELETE'){
			$query = json_decode(file_get_contents('php://input'), TRUE);
			
			appli_log_s("delete id:".$_GET['id']);

            //削除する
			$m_model->delete($_GET['id']);

            //キャッシュクリア
            $m_model->flush_cache();
			
			echo json_encode(array());
			exit;
		}
	}else if($page_action == "csv_download") {
        $models = $m_model->list_where();

        header('Content-Type: application/csv');
        header('Content-Disposition: attachement; filename="'.$model_name.'.csv";');

        $fp = CsvExporter::fopen('php://output', 'w');

        foreach($models as $model){
            CsvExporter::fput($fp, $model);
        }

        exit;
    }else if($page_action == "csv_upload"){

        //アップロードファイルを処理する
        $tmp_file_name = $_FILES['Filedata']['tmp_name'];
        $move_file_path = '/tmp/'.basename($tmp_file_name);

        move_uploaded_file($tmp_file_name, $move_file_path);

        //csvファイルはDBサーバへアップロードする
        $ssh_config = SshSwitch::get_ssh_config();
        $db_config = DbSwitch::get_db_config();

        $key = new Crypt_RSA();
        $key->loadKey(file_get_contents(APP_ROOT_DIR."lib/SSH/Key/".$ssh_config['ssh_key']));

        $sftp = new Net_SFTP($db_config['host_master']);
        if (!$sftp->login($ssh_config['ssh_user'], $key)) {
            exit('DB Login Failed'."\n");
        }

        $sftp->put($move_file_path, $move_file_path, NET_SFTP_LOCAL_FILE);
        $sftp->disconnect();

        //モデルデータ全部削除
        $m_model->truncate();

        $sql = <<<eof
LOAD DATA INFILE '{$move_file_path}'
INTO TABLE `{$m_model->table}`
CHARACTER SET UTF8
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
eof;
        $m_model->sql($sql);

        //IDを直す
        $sql = <<<eof
SET @count = 0;
UPDATE `{$m_model->table}` SET `{$m_model->table}`.`id` = @count:= @count + 1;
eof;
        $m_model->sql($sql);

        //Max IDをリセット
        $sql = <<<eof
ALTER TABLE `{$m_model->table}` AUTO_INCREMENT = 1;
eof;
        $m_model->sql($sql);

        //キャッシュクリア
        $m_model->flush_cache();

        exit;
    }else{
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
        exit;
	}
}


require_once APP_ADMIN_VIEW_DIR.basename($_SERVER["SCRIPT_NAME"]);
