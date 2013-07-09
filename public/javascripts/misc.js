(function(e){"use strict";function t(e){return new RegExp("(^|\\s+)"+e+"(\\s+|$)")}function s(e,t){var s=n(e,t)?i:r;s(e,t)}var n,r,i;if("classList"in document.documentElement){n=function(e,t){return e.classList.contains(t)};r=function(e,t){e.classList.add(t)};i=function(e,t){e.classList.remove(t)}}else{n=function(e,n){return t(n).test(e.className)};r=function(e,t){if(!n(e,t)){e.className=e.className+" "+t}};i=function(e,n){e.className=e.className.replace(t(n)," ")}}var o={hasClass:n,addClass:r,removeClass:i,toggleClass:s,has:n,add:r,remove:i,toggle:s};if(typeof define==="function"&&define.amd){define(o)}else{e.classie=o}})(window);var ModalEffects=function(){function e(){var e=document.querySelector(".md-overlay");[].slice.call(document.querySelectorAll(".md-trigger")).forEach(function(t,n){function s(e){classie.remove(r,"md-show");if(e){classie.remove(document.documentElement,"md-perspective")}}function o(){s(classie.has(t,"md-setperspective"))}var r=document.querySelector("#"+t.getAttribute("data-modal")),i=r.querySelector(".md-close");t.addEventListener("click",function(n){classie.add(r,"md-show");e.removeEventListener("click",o);e.addEventListener("click",o);if(classie.has(t,"md-setperspective")){setTimeout(function(){classie.add(document.documentElement,"md-perspective")},25)}});i.addEventListener("click",function(e){e.stopPropagation();o()})})}e()}();!function(e){"use strict";var t=function(t,n){this.$element=e(t);this.options=e.extend({},e.fn.typeahead.defaults,n);this.matcher=this.options.matcher||this.matcher;this.sorter=this.options.sorter||this.sorter;this.highlighter=this.options.highlighter||this.highlighter;this.updater=this.options.updater||this.updater;this.source=this.options.source;this.$menu=e(this.options.menu);this.shown=false;this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");this.$element.val(this.updater(e)).change();return this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.position(),{height:this.$element[0].offsetHeight});this.$menu.insertAfter(this.$element).css({top:t.top+t.height,left:t.left}).show();this.shown=true;return this},hide:function(){this.$menu.hide();this.shown=false;return this},lookup:function(t){var n;this.query=this.$element.val();if(!this.query||this.query.length<this.options.minLength){return this.shown?this.hide():this}n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source;return n?this.process(n):this},process:function(t){var n=this;t=e.grep(t,function(e){return n.matcher(e)});t=this.sorter(t);if(!t.length){return this.shown?this.hide():this}return this.render(t.slice(0,this.options.items)).show()},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift()){if(!i.toLowerCase().indexOf(this.query.toLowerCase()))t.push(i);else if(~i.indexOf(this.query))n.push(i);else r.push(i)}return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;t=e(t).map(function(t,r){t=e(n.options.item).attr("data-value",r);t.find("a").html(n.highlighter(r));return t[0]});t.first().addClass("active");this.$menu.html(t);return this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();if(!r.length){r=e(this.$menu.find("li")[0])}r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();if(!n.length){n=this.$menu.find("li").last()}n.addClass("active")},listen:function(){this.$element.on("focus",e.proxy(this.focus,this)).on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this));if(this.eventSupported("keydown")){this.$element.on("keydown",e.proxy(this.keydown,this))}this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this)).on("mouseleave","li",e.proxy(this.mouseleave,this))},eventSupported:function(e){var t=e in this.$element;if(!t){this.$element.setAttribute(e,"return;");t=typeof this.$element[e]==="function"}return t},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault();this.prev();break;case 40:e.preventDefault();this.next();break}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=~e.inArray(t.keyCode,[40,38,9,13,27]);this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation();e.preventDefault()},focus:function(e){this.focused=true},blur:function(e){this.focused=false;if(!this.mousedover&&this.shown)this.hide()},click:function(e){e.stopPropagation();e.preventDefault();this.select();this.$element.focus()},mouseenter:function(t){this.mousedover=true;this.$menu.find(".active").removeClass("active");e(t.currentTarget).addClass("active")},mouseleave:function(e){this.mousedover=false;if(!this.focused&&this.shown)this.hide()}};var n=e.fn.typeahead;e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;if(!i)r.data("typeahead",i=new t(this,s));if(typeof n=="string")i[n]()})};e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1};e.fn.typeahead.Constructor=t;e.fn.typeahead.noConflict=function(){e.fn.typeahead=n;return this};e(document).on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;n.typeahead(n.data())})}(window.jQuery)
function addPastData() {
  var x = document.getElementById('past-date');
  if (x.className == 'hidden'){
    x.className = 'unhidden';
  }
  else{
    x.className = 'hidden';
  }
}