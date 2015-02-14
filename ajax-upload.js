/*var addEvent = (function ()
{
	if (document.addEventListener)
	{
		return function (el, type, fn)
		{
			if (el && el.nodeName || el === window)
			{
				el.addEventListener(type, fn, false);
			}
			else if (el && el.length)
			{
				for (var i = 0; i < el.length; i++)
				{
					addEvent(el[i], type, fn);
				}
			}
		};
	}
	else
	{
		return function (el, type, fn) {
			if (el && el.nodeName || el === window)
			{
				el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
			}
			else if (el && el.length)
			{
				for (var i = 0; i < el.length; i++)
				{
					addEvent(el[i], type, fn);
				}
			}
		};
	}
})(); */

Object.prototype.merge = function(newObject)
{
	for (var item in newObject)
	{
		if(newObject[item].constructor==Object)
		{
			this[item].merge(newObject[item]);
		}
		else
		{
			this[item] = newObject[item];
		}
	}
};
/*Object.prototype.mergeRecursive(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;
}*/
(function(_w){

	var FileUpload = function(file)
	{
		this.file = file;
	}
	FileUpload.prototype.bytesMegas = function(){
		return Math.round((this.file.size/1024)*100)/100;
	};
	FileUpload.prototype.fileExtencion = function(){
		return this.file.name.split(".").pop();
	};
	FileUpload.prototype.fileInfo = function(file){
		return {
			name : file.name,
			size : this.bytesMegas(file.size)+"Mb",
			type : file.type,
			extn : this.fileExtencion(file.name)
		};
	};

	var Element = function(objElem)
	{

		this.objElem = objElem;
		this.element = null;
		if(!!objElem.tag)
		{
			this.element = document.createElement(objElem.tag);
			
			this
				.attr()
				.content()
			;
		}
		return this.element;		
	};

	Element.prototype.attr = function()
	{
		if (!!this.objElem.attr)
		{
			for(var item in this.objElem.attr)
			{
				this.element.setAttribute(item,this.objElem.attr[item]);
			}
		}
	};

	Element.prototype.content = function()
	{
		if (!!this.objElem.content)
		{
			this.objElem.content
			switch(typeof(this.objElem.content))
			{
				case "string":
					this.element.innerHTML=this.objElem.content
					break;
				case "object":
					var elem  = new Element(this.objElem.content);
					this.element.appendChild(elem);
					break;
			}
		}
	};

	var defaultSetting = {
		element : document
	};

	var AjaxUpload = function(settings)
	{
		var settings = typeof(settings)=="object"?defaultSetting.merge(settings):defaultSetting;

		
		// var paarent = 			var elem = elem || document;
		// var cont = App.nElem('contenedor');
		// var mrco = App.nElem('marco');

	};

	AjaxUpload.prototype.elements = [
		{
			tag: 'div',
				attr:{
				id:'ajax-upload',
				class:"default hide"
			},
			content:{
				tag:'div',
				attr:{
					id:'ajax-upload-marco'
				},
				content:{
					tag:'center',
					content:'Suelte Aquí para comenzar a subir'
				}
			}
		}
	];



/*	AjaxUpload.prototype.getElement = function(name)
	{
		var data = this.elementos[name]||null, elem = null;
		if(!!data)
		{
			elem = document.createElement(data[0]);
		}
	}*/


	var App = {
		elementos:{
			contenedor : ['div',{id:'ajax-upload',class:"default hide"}],
			marco:['div',{id:'ajax-upload-marco'},"<center>Suelte Aquí para comenzar a subir</center>"]
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
/*		bytesMegas:function(num){return Math.round((num/1024)*100)/100;},
		fileExtencion:function(nm){ return nm.split(".").pop();},
		fileInfo:function(file){
			return {
				name : file.name,
				size : App.bytesMegas(file.size)+"Mb",
				type : file.type,
				extn : App.fileExtencion(file.name)
			};
		},*/
		classStatus:function(stt){
			var stt        = stt|| false;
			var elem       = document.querySelector('#ajax-upload');
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


	function progressHandler(event)
	{
		_("loaded_n_total").innerHTML = "Uploaded "+event.loaded+" bytes of "+event.total; 
		var percent = (event.loaded / event.total) * 100; _("progressBar").value = Math.round(percent); 
		_("status").innerHTML = Math.round(percent)+"% uploaded... please wait";
	} 
	function completeHandler(event)
	{ 
		_("status").innerHTML = event.target.responseText; _("progressBar").value = 0;
	} 
	function errorHandler(event)
	{
		_("status").innerHTML = "Upload Failed";
	} 
	function abortHandler(event)
	{ 
		_("status").innerHTML = "Upload Aborted";
	}
	_w.ajaxUpload = function(url){
		App.init()
	};
})(window);

/*
chrome: 4.0
ie: 8.0
firefox:3.5
safari:3.2
opera:10.o 
*/
 