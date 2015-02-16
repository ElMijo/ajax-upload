<?php 

if(!!isset($_FILES))
{
	$upload_path = realpath('./uploads');
	extract($_FILES["X_FILENAME"]);
	$filename = "$upload_path/$name";
	if(!!isset($error))
	{
		if($error == UPLOAD_ERR_OK)
		{
			if(!!move_uploaded_file($tmp_name, $filename))
			{
				exit("<p>FILE UPLOADED TO: $filename</p>");
			}
			else
			{
				$msg = 'MOVE UPLOADED FILE FAILED!!';
			}
		}
		else
		{
			$msg = getUploadFileError($error);
		}
	}
	else
	{
		$msg = 'The uploaded file is very big.';
	}

	header("HTTP/1.0 500 Internal Server Error");
	echo "<p>$msg</p>";
    print_r(error_get_last());
}


function getUploadFileError($error)
{
	return array(
		'There is no error, the file uploaded with success.',
		'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
		'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
		'The uploaded file was only partially uploaded.',
		'No file was uploaded.',
		'Missing a temporary folder. Introduced in PHP 4.3.10 and PHP 5.0.3.',
		'Failed to write file to disk. Introduced in PHP 5.1.0.',
		'File upload stopped by extension. Introduced in PHP 5.2.0.'
	)[$error];
}
?>