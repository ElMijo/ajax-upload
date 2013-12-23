<?php 
	define("X_FILENAME", (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false));



function ajaxUploadFile($path){
	if(X_FILENAME){
		try{
			$arch = $path.X_FILENAME;
			file_put_contents($arch,file_get_contents('php://input'));
			exit("archivo subido con Exito");
		}
		catch(Exception $err){}
	}else{
	    extract($_FILES["X_FILENAME"]);
	    $arch     = "$path$name";
	    if(move_uploaded_file($tmp_name, $arch)){ 
			exit("archivo subido con Exito");				
		} 
	} 
}

ajaxUploadFile("uploads/");
/*

class upload{
	protected $xf; 
	protected $path;
	function __contruct($path){
		$this->xf   = ;
		$this->path = $path;
	}

}
$fn = (isset($_SERVER['HTTP_X_FILENAME']) ? $_SERVER['HTTP_X_FILENAME'] : false);

if ($fn) {

	// AJAX call
	file_put_contents(
		'uploads/' . $fn,
		file_get_contents('php://input')
	);
	echo "$fn uploaded";
	exit();
	
}
else {
	$fileName = $_FILES["X_FILENAME"]["name"]; // The file name 
	$fileTmpLoc = $_FILES["X_FILENAME"]["tmp_name"]; //  File in the PHP tmp folder 
	$fileType = $_FILES["X_FILENAME"]["type"]; // The type of file it is 
	$fileSize = $_FILES["X_FILENAME"]["size"]; // File size in bytes 
	$fileErrorMsg = $_FILES["X_FILENAME"]["error"]; // 0 for false... and 1 for true 
	if (!$fileTmpLoc) { 
		// if file not chosen 
		echo "ERROR: Please browse for a file before clicking the upload button."; 
		exit(); 
	} 
	if(move_uploaded_file(
		$fileTmpLoc, "uploads/$fileName")){ 
			echo "$fileName upload is complete"; 
	} 
	else { echo "move_uploaded_file function failed"; }

	// form submit
	/*var_dump($_FILES['X_FILENAME']);exit;
	$file = $_FILES['X_FILENAME'];

	foreach ($file['error'] as $id => $err) {
		if ($err == UPLOAD_ERR_OK) {
			$fn = $file['name'][$id];
			move_uploaded_file(
				$file['tmp_name'][$id],
				'uploads/' . $fn
			);
			echo "<p>File $fn uploaded.</p>";
		}
	}*/

//}
/*
	$fileName = $_FILES["file1"]["name"]; // The file name 
	$fileTmpLoc = $_FILES["file1"]["tmp_name"]; //  File in the PHP tmp folder 
	$fileType = $_FILES["file1"]["type"]; // The type of file it is 
	$fileSize = $_FILES["file1"]["size"]; // File size in bytes 
	$fileErrorMsg = $_FILES["file1"]["error"]; // 0 for false... and 1 for true 
	if (!$fileTmpLoc) { 
		// if file not chosen 
		echo "ERROR: Please browse for a file before clicking the upload button."; 
		exit(); 
	} 
	if(move_uploaded_file(
		$fileTmpLoc, "test_uploads/$fileName")){ 
			echo "$fileName upload is complete"; 
	} 
	else { echo "move_uploaded_file function failed"; } */
?>