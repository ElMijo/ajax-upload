var addEvent = (function ()
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
})(); 

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
    return this;
};

(function(_w){


    var defaultSetting = {
        element : document,
        debug: false
    };

    var uploadZoneElement = {
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
    };

    var uploadzone = null;

    var stopEvent = function(event)
    {
        if (!!event.preventDefault)
        {
            event.preventDefault();
        }
        if(!!event.dataTransfer)
        {
            event.dataTransfer.dropEffect = 'copy';
        }
        
        return false; 
    };

    var classStatus = function(status)
    {
        var status     = status|| false;
        var classList  = uploadzone.classList;
        uploadzone.classList[!!status?"add":"remove"]("hide");
        return false;
    };

    var ajaxObject = function()
    {
        var xhr = false;

        if (_w.XMLHttpRequest)
        { 
            xhr = new XMLHttpRequest();
        } 
        else if (_w.ActiveXObject)
        {
            try
            {
                xhr = new ActiveXObject("MSXML2.XMLHTTP");
            } 
            catch (e)
            {
                try
                {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } 
                catch (e) {}
            }
        }
        if(!!xhr)
        {
            xhr.isXHR2 = !!xhr.upload;
        }

        return xhr;
    }

    var ajaxUpload = function(files,settings)
    {
        var files = files || [];
        for(I=0;I<files.length;I++)
        {
            var formdata = new FormData(); 
            var ajax = new ajaxObject();     
            var file = new FileUpload(files[I])

            formdata.append("X_FILENAME", files[I]);
            if(!!ajax.isXHR2)
            {
                ajax.upload.addEventListener("progress", function(e){}, false);
                ajax.addEventListener("load", function(e){}, false); 
                ajax.addEventListener("error", function(e){}, false); 
                ajax.addEventListener("abort", function(e){}, false);                
            }
                //console.log(App.fileInfo(files[$I]));
                // 
                //  
 
                // ajax.open("POST", "file_upload_parser.php"); 
                // ajax.send(formdata);    
        }
        console.log(settings)
    }


    var FileUpload = function(file)
    {
        this.file = file;
        return this;
    }
    FileUpload.prototype.bytesMegas = function()
    {
        return Math.round((this.file.size/1024)*100)/100;
    };
    FileUpload.prototype.fileExtencion = function()
    {
        return this.file.name.split(".").pop();
    };
    FileUpload.prototype.fileInfo = function()
    {
        return {
            name : this.file.name,
            size : this.bytesMegas(this.file.size)+"Mb",
            type : this.file.type,
            extn : this.fileExtencion(this.file.name),
            last : this.file.lastModifiedDate.toLocaleDateString()
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
                if (typeof(this.objElem.attr[item])=='string')
                {
                    this.element.setAttribute(item,this.objElem.attr[item]);
                }
            }
        }
        return this;
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
        return this;
    };



    var AjaxUpload = function(settings)
    {
        var ajaxupload = false, self = this;

        if(!!this.validateBrowser())
        {
            this.settings = typeof(settings)=="object"?defaultSetting.merge(settings):defaultSetting;
            this.parent = this.getParent();
            uploadzone = this.getUploadZone();

            addEvent(this.parent,"dragenter",this.dragEnter);
            addEvent(this.parent,"dragover",this.dragEnter);
            addEvent(this.parent,"dragleave",this.dragLeave);
            //addEvent(this.parent,"mouseout",this.dragLeave);
            addEvent(this.parent,"drop",function(event){
                stopEvent(event);
                classStatus(true);
                var files = event.target.files || event.dataTransfer.files;
                ajaxUpload(files,self.settings)
                return false;
            }); 
        }

        return ajaxupload;
    };
    AjaxUpload.prototype.validateBrowser = function()
    {
        var isValid = _w.File && _w.FileList && _w.FileReader;
        if(!isValid && !!this.settings.debug)
        {
            console.log("Este navegador no soporta el API")
        }
        return isValid;
    };
    AjaxUpload.prototype.getParent = function()
    {
        var element = this.settings.element;

        if (typeof(element)=='string')
        {
            var element = document.querySelector(element);
        }

        if(element == null && !!this.settings.debug)
        {
            console.log("No se encontro un Objeto Paadre")
        }

        return element;
    };
    AjaxUpload.prototype.getUploadZone = function()
    {
        var uploadzone = new Element(uploadZoneElement);
        var parentUploadzone = this.parent == document?document.body:this.parent;

        parentUploadzone.appendChild(uploadzone);

        return uploadzone;
    };
    AjaxUpload.prototype.dragEnter = function(event)
    {
        stopEvent(event);
        classStatus();
        return false;
    };
    AjaxUpload.prototype.dragLeave = function(event)
    {
        stopEvent(event);
        classStatus(true);
        return false;
    };
    AjaxUpload.prototype.drop = function(event)
    {

    }

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
            if(_w.File && _w.FileList && _w.FileReader) {
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


    _w.ajaxUpload = function(settings)
    {
        var ajaxUploadObject = new AjaxUpload(settings);
        //App.init()
    };
})(window);

/*
chrome: 4.0
ie: 8.0
firefox:3.5
safari:3.2
opera:10.o 
*/
 