var addEvent = (function () {
	if (document.addEventListener) {
		return function (el, type, fn) {
			if (el && el.nodeName || el === window) {
				el.addEventListener(type, fn, false);
			} else if (el && el.length) {
				for (var i = 0; i < el.length; i++) {
					addEvent(el[i], type, fn);
				}
			}
		};
	} else {
		return function (el, type, fn) {
			if (el && el.nodeName || el === window) {
				el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
			} else if (el && el.length) {
				for (var i = 0; i < el.length; i++) {
					addEvent(el[i], type, fn);
				}
			}
		};
	}
})(); 

(function(_w){
	var App = {
		elementos:{
			contenedor : ['div',{class:"ajax-upload hide"}],
			marco:['div',{class:'marco'},"<center>Suelte Aquí para comenzar a subir</center>"]
		},
		nElem : function (nm){
			var data = App.elementos[nm]||null;
			var elem = null;
			if (!!data){
				elem = document.createElement(data[0]);
				if(!!data[1]){
					for(var item in data[1]){
						elem.setAttribute(item,data[1][item]);
					}
				}
				if(!!data[2]){
					switch(typeof(data[2])){
						case "string":
							elem.innerHTML=data[2]
						break;
					}
					
				}
			}
			return elem;
		},
		stop:function(e){
			if (e.preventDefault) e.preventDefault();
  			e.dataTransfer.dropEffect = 'copy';
			return false; 
		},
		esXHR2 : function(){
			return !!App.xhr()?App.xhr().upload:false;
		},
		XHR: function(){
        	if (_w.XMLHttpRequest){ return new XMLHttpRequest();} 
        	else if (_w.ActiveXObject)
        	{
                try {return  new ActiveXObject("MSXML2.XMLHTTP");} 
                catch (e) {
                    try {return  new ActiveXObject("Microsoft.XMLHTTP");} 
                    catch (e) {}
                }
        	}
        	return false;
		},
		bytesMegas:function(num){return Math.round((num/1024)*100)/100;},
		fileExtencion:function(nm){ return nm.split(".").pop();},
		fileInfo:function(file){
			return {
				name : file.name,
				size : App.bytesMegas(file.size)+"Mb",
				type : file.type,
				extn : App.fileExtencion(file.name)
			};
		},
		classStatus:function(stt){
			var stt        = stt|| false;
			var elem       = document.querySelector('.ajax-upload');
			var classList  = elem.classList;
			elem.classList[!!stt?"add":"remove"]("hide");
			return false;
			//elem.classList[classList.contains('hide')?"remove":"add"]("hide");
		},
		leave:function(e){
			App.stop(e);
			App.classStatus(true);
			return false;
		},
		over: function(e){
			App.stop(e);
			App.classStatus();
			return false;
		},
		hover: function(e) {App.stop(e);App.classStatus();return false;},
		drop:function(e) {
			App.stop(e);App.classStatus(true);
			var files = e.target.files || e.dataTransfer.files;
			App.upload(files);
			return false;

		},
		upload:function(files){
			var files = files || [];
			for($I=0;$I<files.length;$I++){
				var formdata = new FormData(); 
				var ajax = new App.XHR();
				console.log(App.fileInfo(files[$I]));
				formdata.append("X_FILENAME", files[$I]); 
				ajax.upload.addEventListener("progress", function(e){}, false); 
				ajax.addEventListener("load", function(e){}, false); 
				ajax.addEventListener("error", function(e){}, false); 
				ajax.addEventListener("abort", function(e){}, false); 
				ajax.open("POST", "file_upload_parser.php"); 
				ajax.send(formdata);	
			}
		},
		init:function(elem){
			var elem = elem || document;
			var cont = App.nElem('contenedor');
			var mrco = App.nElem('marco');
			if(_w.File && _w.FileList && _w.FileReader)	{
				elem.addEventListener("dragenter", App.hover, false);
				elem.addEventListener("dragleave", App.leave, false);
				elem.addEventListener("drop", App.drop, false);
				elem.addEventListener("dragover",App.over,false);
				document.body.appendChild(cont);
				cont.appendChild(mrco);
			}

		}

	};


	function progressHandler(event){ _("loaded_n_total").innerHTML = "Uploaded "+event.loaded+" bytes of "+event.total; var percent = (event.loaded / event.total) * 100; _("progressBar").value = Math.round(percent); _("status").innerHTML = Math.round(percent)+"% uploaded... please wait"; } 
	function completeHandler(event){ _("status").innerHTML = event.target.responseText; _("progressBar").value = 0; } 
	function errorHandler(event){ _("status").innerHTML = "Upload Failed"; } 
	function abortHandler(event){ _("status").innerHTML = "Upload Aborted"; }
	_w.ajaxUpload = function(url,){
		App.init()
	};
})(window);
