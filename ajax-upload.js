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
        debug: false,
        element : document,
        acceptedTypes:[],
        uploadVerbose : true,
        fieldname : 'X_FILENAME',
        delayRemoveItemVerbose: 2000
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

    var cajaUpload = {
        tag:'div',
        attr:{
            id:'caja-load'
        }
    };

    var uploadzone = null;
    var cajaupload = null;

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

    var FileUpload = function(file)
    {
        this.originalFile = file;
        return this;
    }
    
    FileUpload.prototype.bytesMegas = function()
    {
        return Math.round((this.originalFile.size/1024)*100)/100;
    };
    FileUpload.prototype.fileExtencion = function()
    {
        return this.originalFile.name.split(".").pop();
    };
    FileUpload.prototype.getOriginalFile = function()
    {
        return this.originalFile;
    };    
    FileUpload.prototype.getFileInfo = function()
    {
        return {
            name  : this.originalFile.name,
            size  : this.bytesMegas(this.originalFile.size)+"Mb",
            type  : this.originalFile.type,
            extn  : this.fileExtencion(this.originalFile.name),
            last  : this.originalFile.lastModifiedDate.toLocaleDateString(),
            ofile : this.getOriginalFile()
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
            switch(this.objElem.content.constructor)
            {
                case String:
                    this.element.innerHTML=this.objElem.content
                    break;
                case Object:
                    var elem  = new Element(this.objElem.content);
                    this.element.appendChild(elem);
                    break;
                case Array:
                    for(var II=0;II<this.objElem.content.length;II++)
                    {
                        var elem  = new Element(this.objElem.content[II]);
                        this.element.appendChild(elem);
                    }
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
            this.uploadEvents = {};
            this.settings = typeof(settings)=="object"?defaultSetting.merge(settings):defaultSetting;
            this.parent = this.getParent();
            uploadzone = this.getUploadZone();
            cajaupload = this.getCajaUpload();

            addEvent(this.parent,"dragover",this.dragOver);
            addEvent(this.parent,"dragleave",this.dragLeave);
            addEvent(this.parent,"ondragend",this.dragLeave);
            addEvent(this.parent,"drop",function(event){
                stopEvent(event);
                classStatus(true);
                var files = event.target.files || event.dataTransfer.files || [];
                self.upload(files,self.uploadEvents)
                return false;
            }); 
        }

        return ajaxupload;
    };

    AjaxUpload.prototype.validateBrowser = function()
    {
        var isValid = _w.File && _w.FileList && _w.FileReader && _w.FormData;
        if(!isValid && !!this.settings.debug)
        {
            console.log("Este navegador no soporta las tecnologias para subir archivos por ajax")
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
            console.log("No se encontro un Objeto Padre Valido")
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

    AjaxUpload.prototype.getCajaUpload = function()
    {
        var cajaupload = new Element(cajaUpload);
        document.body.appendChild(cajaupload);
        return cajaupload;
    };
    AjaxUpload.prototype.dragOver = function(event)
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

    AjaxUpload.prototype.upload = function(files,uploadEvents)
    {
        for(I=0;I<files.length;I++)
        {
            var file = new FileUpload(files[I]);

            if(!!this.validateFile(file.getFileInfo()))
            {
                var uploaditem = new AjaxUploadItem(this.settings,file.getFileInfo(),uploadEvents);
                uploaditem.sendFormData();
            } 
        }
    };

    AjaxUpload.prototype.validateFile = function(validatefile)
    {
        var validatefile = true;

        if(!!this.settings.acceptedTypes.length)
        {
            validatefile = file.type in this.settings.acceptedTypes;
        }

        return validatefile;
    }

    var AjaxUploadItem = function(settings,file,uploadEvents)
    {
        this.ajax = new ajaxObject();
        this.ajax.uploadItem = this;
        this.ajax.formdata = new FormData(); 
        this.ajax.formdata.append(settings.fieldname, file.ofile);
        this.ajax.open("POST", settings.url);
        this.ajax.cajauploaditem = null;
        this.ajax.cajauploaditemstatus = null;
        this.ajax.cajauploaditemclose = null;
        this.ajax.uploadVerbose = settings.uploadVerbose;
        this.ajax.uploadevents = uploadEvents;
        this.ajax.delayRemoveItemVerbose = settings.delayRemoveItemVerbose;

        this.initCajauploaditem(settings.uploadVerbose,file.name);

        this.ajax.addEventListener("loadstart",this.loadStartEvent,false);

        if(!!this.ajax.isXHR2)
        {
            this.ajax.upload.addEventListener("progress",this.progressEvent,false);
            this.ajax.upload.ajax = this.ajax;
        }
        else
        {
            this.ajax.addEventListener("progress",this.loadStartEvent,false);
        }

        this.ajax.addEventListener("error",this.errorEvent,false);
        this.ajax.addEventListener("abort",this.abortEvent,false);
        this.ajax.addEventListener("timeout",this.timeoutEvent,false);
        this.ajax.addEventListener("load",this.loadEvent,false);
        this.ajax.addEventListener("loadend",this.loadendEvent,false);

        this.ajax.sendFormData = function(){this.send(this.formdata)};
        this.ajax.statusStyle = this.statusStyle;

        return this.ajax;
    }
    AjaxUploadItem.prototype.initCajauploaditem = function(verbose,filename)
    {
        if (!!verbose)
        {
            var ajax = this.ajax;
            ajax.cajauploaditem = new Element(this.cajaUploadItemObject);
            ajax.cajauploaditemstatus = ajax.cajauploaditem.querySelector('#barstatus');
            ajax.cajauploaditemclose = ajax.cajauploaditem.querySelector('.close-item-load');
            ajax.cajauploaditem.querySelector('p').innerHTML = filename;
            ajax.cajauploaditemstatus.style.width = '1%';
            addEvent(ajax.cajauploaditem.querySelector('.close-item-load span'),'click',function(event){
                event.preventDefault();
                ajax.abort();
            });
        }
    }

    AjaxUploadItem.prototype.loadStartEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            cajaupload.appendChild(this.cajauploaditem);
        }
        if(!!this.uploadevents.loadstart)
        {
            this.uploadevents.loadstart(event);
        }
    }

    AjaxUploadItem.prototype.progressEvent = function(event)
    {
        if (!!this.ajax.uploadVerbose&&!!event.lengthComputable)
        {
            this.ajax.cajauploaditemstatus.style.width = ((event.loaded / event.total) * 100) + '%';
        }
        if(!!this.ajax.uploadevents.progress)
        {
            this.ajax.uploadevents.progress(event);
        }
    };

    AjaxUploadItem.prototype.errorEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            this.statusStyle('error');
        }
        if(!!this.uploadevents.error)
        {
            this.uploadevents.error(event);
        }
    };
    AjaxUploadItem.prototype.abortEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            this.statusStyle('error');
        }
        if(!!this.uploadevents.abort)
        {
            this.uploadevents.abort(event);
        }
    };
    AjaxUploadItem.prototype.timeoutEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            this.statusStyle('warning');
        }
        if(!!this.uploadevents.timeout)
        {
            this.uploadevents.timeout(event);
        }
    };
    AjaxUploadItem.prototype.loadEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            this.statusStyle(this.status == 200?'success':'error');
        }
        if(!!this.uploadevents.load)
        {
           this.uploadevents.load(event);
        }
    };
    AjaxUploadItem.prototype.loadendEvent = function(event)
    {
        if(!!this.uploadVerbose)
        {
            var cajauploaditem = this.cajauploaditem;
            setTimeout(function(){cajaupload.removeChild(cajauploaditem);},this.delayRemoveItemVerbose);
        }
        if(!!this.uploadevents.loadend)
        {
           this.uploadevents. loadend(event);
        }        
    };

    AjaxUploadItem.prototype.statusStyle = function(style)
    {
        this.cajauploaditemclose.innerHTML = style == 'success'?'✓':'⊗';
        this.cajauploaditemclose.classList.add(style);
        this.cajauploaditemstatus.classList.add(style);
    }
    AjaxUploadItem.prototype.cajaUploadItemObject = {
        tag:'div',
        attr:{
            class:'item-load'
        },
        content:[
            {
                tag:'div',
                attr:{
                    class:'content-item-load'
                },
                content:[
                    {
                        tag:'p'
                    },
                    {
                        tag:'div',
                        attr:{
                            id:'content-barstatus'
                        },
                        content:{
                            tag:'span',
                            attr:{
                                id:'barstatus'
                            }
                        }
                    }
                ]
            },
            {
                tag:'div',
                attr:{
                    class:'close-item-load'
                },
                content:{
                    tag:'span',
                    content:'✗'
                }
            }
        ]        
    };

    _w.ajaxUpload = function(settings)
    {
        var ajaxUploadObject = new AjaxUpload(settings);

        return {
            on:function(e,fn){
                if (e in ['loadstart','progress','error','abort','timeout','load','loadend'])
                {
                    ajaxUploadObject.eventUpload[e] = fn;
                }
                return this;
            }
        };
    };
})(window);

/*
chrome: 7.0
ie: 10.0
firefox:,4.0
safari:5.0
opera:12
*/
 