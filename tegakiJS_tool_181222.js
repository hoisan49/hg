// ===== 上書き分 =====

function ChangeDraw(mode){
	var d=document,txvs,oevs,t,j=false,jm=false,v="visible",h="hidden",b="block",n="none";
	if(!swfloaded){
		swfloaded=true;
		tegakiJs.Init("oe3",344,135);
		if(t=d.getElementById("oebtnf")){t.style.display="none";}
	}
	if(d.getElementById("oe3").style.visibility==v){
		txvs=v;oevs=h;
		j=true;
		if('ontouchstart' in window){
			d.body.style.setProperty('-webkit-touch-callout','default');
			d.body.style.setProperty('-webkit-user-select','text;');
		}
	}else{
		txvs=h;oevs=v;
		jm=true;
		if('ontouchstart' in window){
			d.body.style.setProperty('-webkit-touch-callout','none');
			d.body.style.setProperty('-webkit-user-select','none');
		}
	}
	d.getElementById("ftxa").style.visibility=txvs;
	d.getElementById("oe3").style.visibility=oevs;
	if(t=d.getElementById("oebtnj")){t.style.display=j?b:n;}
	if(t=d.getElementById("oebtnjm")){t.style.display=jm?b:n;}
	if(t=d.getElementById("oebtnud")){t.style.display=jm?b:n;}
}


var tegakiJs=(function(){
	'use strict';
	var drawing = false,x,y,timestamp=0,lastX,lastY,lastT,oejs,ctx,drewInside=false;
	var ua = window.navigator.userAgent.toLowerCase();
	var slider,sliderout,sliderin,slidervalue,sliderheight;
	var dragging = false,dragged = false,colcel=0,coltmp=["#800000","#f0e0d6"];
	var oepldisp=false,Dialogdisp=false,undomax=10,undop=1,undostart=0;
	var undo=[];for(var i=0;i<=10;i++){undo.unshift("");}
	var undoOpNa=[];for(var i=0;i<=10;i++){undoOpNa.unshift('');}
	var undoSS=[];for(var i=0;i<=10;i++){undoOpNa.unshift('');}
	var isTouch,browser,oecolorel,oest0,supportsPassive,useCapture;
	var smoothMode = true;
	var delayedX = 0;
	var delayedY = 0;
	var delayedLastX = 0;
	var delayedLastY = 0;
	var bogoLength = 0;
	var originalWidth = 344;
	var originalHeight = 135;
	var superScale = 1;
	var viewScale = 1.0;
	var flipToggle=false;
	var penRatio = 0;
	var lastTipTimerID = false;

	function dispTip(message,t) {
		var stt = document.getElementById("oe3_tab");
		stt.innerHTML = message;
		if (lastTipTimerID){clearTimeout(lastTipTimerID);}
		lastTipTimerID = setTimeout(function(){stt.innerHTML=""}, t*1000);
	}

	function oeInit(target,width,height){//関数初期化
		apendOejsHtml(target,width,height);
		oest0=document.getElementById("oe3");
		oejs = document.getElementById("oejs");
		ctx = oejs.getContext('2d');
		if('imageSmoothingEnabled' in ctx){
			ctx.imageSmoothingEnabled = false;
		}else{
			ctx.mozImageSmoothingEnabled = false;
			ctx.msImageSmoothingEnabled = false;
			ctx.webkitImageSmoothingEnabled = false;
		}
		supportsPassive = false;
		try {
			var opt = Object.defineProperty({}, 'passive', {
				get: function() {
					supportsPassive = true;
				}
			});
			var listner=function(){};
			window.addEventListener( "checkpassive", listner, opt );
			window.removeEventListener( "checkpassive", listner, opt );
		} catch ( err ) {}
		if(supportsPassive){
			useCapture={ passive: false };
		}else{
			useCapture=false;
		}
		Erase();//画面クリア
		Erase();Erase();Erase();Erase();Erase();Erase();Erase();Erase();//Undoの先詰め
		slider = document.getElementById('slider1');
		sliderout = document.getElementById('slider1o');
		sliderin = slider.getElementsByTagName('div')[1];
		slidervalue = sliderout.value;
		sliderheight = sliderin.clientHeight / 2;
		slider.addEventListener("click",sliderClick,false);
		set_value();
//		isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0 || navigator.maxTouchPoints > 0;
		isTouch = 'ontouchstart' in window;
		var ELflag="",pd,pu,pm;
		if (window.PointerEvent) {
				pd='pointerdown';pu='pointerup';pm='pointermove';ELflag+="p";
		}else{
			if(isTouch){
				pd='touchstart';pu='touchend';pm='touchmove';ELflag+="t";
			}else{
				pd='mousedown';pu='mouseup';pm='mousemove';ELflag+="m";
			}
		}
		document.addEventListener(pd,DrawStart,false);
		document.getElementById("oepb").addEventListener(pd,pbclick,false);
		document.addEventListener(pu,DrawEnd,false);
		document.addEventListener(pm,Draw,useCapture);
		sliderin.addEventListener(pd,sliderMouseDown,false);
		document.addEventListener(pu,sliderMouseUp,false);
		document.addEventListener(pm,sliderMouseMove,useCapture);
//		if(scriptSource.indexOf('base4.js') === -1){
//			document.getElementsByName("email").item(0).value="v31 "+
//			"ot:"+(0+('ontouchstart' in window)) +" "+
//			"ms:"+(0+(navigator.msMaxTouchPoints > 0)) +" "+
//			"mT:"+(0+(navigator.maxTouchPoints > 0))+" "+
//			"po:"+(0+!!(window.PointerEvent))+ELflag;
//		}
		document.addEventListener("mouseenter",storexy,false);
		document.getElementById("oejsErase").addEventListener("click",EraseDialog,false);
		document.getElementById("sw0label").addEventListener("click",switchcol,false);
		document.getElementById("sw1label").addEventListener("click",switchcol,false);

		appendcol(document.getElementById('oepalet'));
		oecolorel = document.getElementById('oecolor');
		oecolorel.value = coltmp[0];
		document.getElementById("oepb").style.backgroundColor = coltmp[0];
		document.getElementsByClassName("oepli")[0].addEventListener("keypress",oeplikp,false);
		document.getElementsByClassName("oezk")[0].getElementsByTagName('input')[0].addEventListener("click",EraseDialogYes,false);
		document.getElementsByClassName("oezk")[0].getElementsByTagName('input')[1].addEventListener("click",EraseDialogNo,false);
		document.getElementsByClassName("oezk")[0].addEventListener("keydown",EraseDialogKey,false);
		document.addEventListener("keydown",ctrlZKeyDown,false);
		document.getElementById("oest4").getElementsByTagName("svg")[0].addEventListener("click",function(e){ sliderThick(e,true)},false);
		document.getElementById("oest4").getElementsByTagName("svg")[1].addEventListener("click",function(e){ sliderThick(e,false)},false);
//		var i=document.getElementById("baseform").parentNode.getElementsByTagName("input");
//		for (var j=0; j < i.length; j ++) {
//			if (i[j].type == 'submit'){
//				i[j].addEventListener("click",updateDataUri,false);
//			}
//		}
		browser="";
		if (ua.indexOf('opera') !== -1) {
			browser="o";
		} else if (ua.indexOf('edge') !== -1) {
			browser="d";
		} else if (ua.indexOf('chrome') !== -1) {
			browser="c";
		} else if (ua.indexOf('firefox') !== -1) {
			browser="f";
		} else if(ua.match(/msie/) || ua.match(/trident/)) {
			if(parseFloat(ua.match(/(msie\s|rv:)([\d\.]+)/)[2])>=10){
				browser="e";
			}
		}
		if(!document.getElementById("oebtnud")){
			var undoel=document.createElement('div');
			undoel.id = "oebtnud";
			undoel.addEventListener('click',ctrlZKeyDown,false);
			document.getElementById("oebtnd").appendChild(undoel);
		}
	}

	function removeEvent(){//イベント削除
		isTouch = 'ontouchstart' in window;
		var ELflag="",pd,pu,pm;
		if (window.PointerEvent) {
				pd='pointerdown';pu='pointerup';pm='pointermove';ELflag+="p";
		}else{
			if(isTouch){
				pd='touchstart';pu='touchend';pm='touchmove';ELflag+="t";
			}else{
				pd='mousedown';pu='mouseup';pm='mousemove';ELflag+="m";
			}
		}
		document.removeEventListener("mouseenter",storexy,false);
		document.removeEventListener(pd,DrawStart,false);
		document.removeEventListener(pu,DrawEnd,false);
		document.removeEventListener(pm,Draw,useCapture);
		sliderin.removeEventListener(pd,sliderMouseDown,false);
		document.removeEventListener(pu,sliderMouseUp,false);
		document.removeEventListener(pm,sliderMouseMove,useCapture);
		document.removeEventListener("keydown",ctrlZKeyDown,false);
	}
	function pbclick(e){//パレットを表示or隠す
		e.stopPropagation();
		var disp;
		if(oepldisp){
			disp="none";
		}else{
			disp="block";
			var el=document.getElementById('oepb');
			var col=el.style.getPropertyValue('background-color');
			document.getElementsByClassName("oeplc")[0].style.backgroundColor=col;
			if(col.charAt(0)=="#"){
				col = col.substr(1);
			}else{
				col = col.replace("rgb(","");
				col = col.replace(")","");
				col = col.split(",");
				col = to16(parseInt(col[0])) + to16(parseInt(col[1])) + to16(parseInt(col[2]));
			}
			document.getElementsByClassName("oepli")[0].value=col.toUpperCase();
		}
		document.getElementsByClassName("oeplframe")[0].style.display=disp;
		oepldisp=!oepldisp;
	}
	function switchcol(e){//ペンの色を入れ替える
		var btn=document.getElementById(e.target.getAttribute("for"));
		btn.checked = true;//Firefoxバグ対策
		var t=btn.value;
		if(t==colcel){
			return;
		}
		coltmp[1-t]=oecolorel.value;
		oecolorel.value=coltmp[t];
		document.getElementById("oepb").style.backgroundColor = coltmp[t];
		colcel=t;
	}
	function getPenStat(e){//左クリックの状態を取得する
		if("touches" in e){
			drawing=e.touches.length>0;
			return;
		}
		switch(browser){
			case 'o':
				var opv=parseFloat(ua.match(/(version\/)([\d\.]+)/)[2]);
				if(opv>=15){
					if(typeof e.buttons!="undefined"){
						drawing = (e.buttons & 1);
					}else{
						drawing = (e.which === 1);
					}
				}
				break;
			case 'c':
			case 'd':
				if(typeof e.buttons!="undefined"){
					drawing = (e.buttons & 1);
				}else{
					drawing = (e.which === 1);
				}
				break;
			case 'f':
				if(typeof e.buttons!="undefined"){
					drawing = (e.buttons & 1);
				}
				break;
			case 'e':
				drawing = (e.buttons & 1);
				break;
			default:
		}
	}
	function isTouchCanvas(e){//canvas内でのタッチを検出
		if("touches" in e){
			var len=e.touches.length;
			var xy=getPosition(oejs);
			var left=xy.x;
			var top=xy.y;
			var w=oejs.clientWidth * viewScale;
			var h=oejs.clientHeight * viewScale;
			for(var i=0;i<len;i++){
				var adj=adjTouch(e.touches[i]);
				var cx=e.touches[i].clientX - left - adj.x;
				var cy=e.touches[i].clientY - top  - adj.y;
				if(cx>=0 && cy>=0 && cx<=w && cy<=h){
					return true;
				}
			}
		}
		return false;
	}
	function Draw(e){//ペンが動いた時
		if(oest0.style.visibility=="hidden"){
			return;
		}
		if(drawing && x>0 && y>0 && x<oejs.width && y<oejs.height && window.getSelection() && window.getSelection().rangeCount>0){
			window.getSelection().removeAllRanges();
		}
		if(isTouchCanvas(e)){
//			e.preventDefault();
			(e.preventDefault) ? e.preventDefault():e.returnValue=false;
		}
		getxy(e);
		getPenStat(e);
//		if(scriptSource.indexOf('base4.js') === -1){
//			console.log(drawing,e.pointerType,e.type,parseInt(x),parseInt(y),timestamp,lastT,(timestamp-lastT));
//		}
		if(browser=="d" && (navigator.msMaxTouchPoints>0||navigator.maxTouchPoints>0) &&
				e.pointerType == "touch" && timestamp - lastT >100){
			drawing=false;//edgeバグ
		}
		if(drawing){
			Drawsub(lastX,lastY,x,y);
		}
		lastX = x;
		lastY = y;
		lastT = timestamp;
	}
	function Drawsub(lastX,lastY,x,y){//線を描く
		x *= superScale;
		y *= superScale;
		lastX *= superScale;
		lastY *= superScale;
		var dscale = ua.match(/ipad/i) ? 0.69 : 0.29;
		delayedX += (x - delayedX) * dscale;
		delayedY += (y - delayedY) * dscale;
		delayedLastX += (lastX - delayedLastX) * dscale;
		delayedLastY += (lastY - delayedLastY) * dscale;
		//hypot
		Math.hypot = Math.hypot || function() {
			var y = 0;
			var length = arguments.length;
			for (var i = 0; i < length; i++) {
				if (arguments[i] === Infinity || arguments[i] === -Infinity) {
					return Infinity;
				}
				y += arguments[i] * arguments[i];
			}
			return Math.sqrt(y);
		};
		var delta = Math.hypot(x - delayedX, y - delayedY);
		//
		bogoLength += delta;
		x = delayedX;
		y = delayedY;
		lastX = delayedLastX;
		lastY = delayedLastY;
		if(oepldisp||Dialogdisp){
			return;
		}
		if(0<=x && x<=ctx.canvas.width && 0<=y && y<=ctx.canvas.height){
			drewInside=true;
		}
		var rgba = oecolorel.value;
		var rr_hex = rgba.match(/^#(.{2})(.{2})(.{2})/);
		if (rr_hex) {
			rgba = "rgba(" + parseInt(rr_hex[1], 16) + "," + parseInt(rr_hex[2], 16) + "," + parseInt(rr_hex[3], 16) + ",";
		} else {
			var rr_rgb = rgba.match(/^rgb\(([^,]+),([^,]+),(.+)\)/);
			if (rr_rgb) {
				rgba = "rgba(" + rr_rgb[1] + "," + rr_rgb[2] + "," + rr_rgb[3] + ",";
			}
		}
		ctx.beginPath();
		var width=(widthcal(sliderout.value)+penRatio)*superScale;
		var adj=width%2/2;
		
		if(parseInt(lastX)==parseInt(x) && parseInt(lastY)==parseInt(y)){
			if (smoothMode){
				//Smooth mode
				ctx.save();
				if (browser == 'c' && ctx.globalCompositeOperation == 'source-over'){
					ctx.globalCompositeOperation = 'source-atop';//Chromeの色対策
				}
				ctx.fillStyle = rgba + "1.00)";
				ctx.arc(x+adj,y+adj,width/2,0,2*Math.PI,true);
				ctx.fill();
				ctx.restore();
			} else {
				//Classic mode
				ctx.fillStyle = rgba + "1.00)";
				if(width==1){
					ctx.fillRect(x,y,1,1);
				}else{
					ctx.arc(parseInt(x)+adj,parseInt(y)+adj,width/2,0,2*Math.PI,true);
					ctx.fill();
				}
			}
		}else{
			if (smoothMode){
				//Smooth mode
				ctx.save();
				if (browser == 'c' && ctx.globalCompositeOperation == 'source-over'){
					ctx.globalCompositeOperation = 'source-atop';//Chromeの色対策
				}
				
				ctx.lineCap = "round";
				
				ctx.lineWidth = width;
				ctx.moveTo(lastX+adj,lastY+adj);
				ctx.lineTo(x+adj,y+adj);
				ctx.strokeStyle = rgba + (0.67) + ")";
				ctx.stroke();
				
				ctx.lineWidth = width - ((width < 2) ? 0.4 : 1.4);
				ctx.moveTo(lastX+adj,lastY+adj);
				ctx.lineTo(x+adj,y+adj);
				ctx.strokeStyle = rgba + (0.94) + ")";
				ctx.stroke();
				
				ctx.restore();
				
			} else {
				//Classic mode
				ctx.lineWidth = width;
				ctx.lineCap = "round";
				ctx.moveTo(parseInt(lastX)+adj,parseInt(lastY)+adj);
				ctx.lineTo(parseInt(x)+adj,parseInt(y)+adj);
				ctx.strokeStyle = rgba + "1.00)";
				ctx.stroke();
			}
		}
	}
	function widthcal(v){//ペンの太さを計算 線の太さ0->24 54->1
		return parseInt(24-v*23/54);
	}
	function DrawStart(e){//ペンが下がった時
		if(oest0.style.visibility=="hidden"){
			return;
		}
		if(isTouchCanvas(e) && !oepldisp && !Dialogdisp){
			e.preventDefault();
		}
		storexy(e);
		getPenStat(e);
		delayedX = delayedLastX = x*superScale;
		delayedY = delayedLastY = y*superScale;
		bogoLength = 0;
		if (drawing){
			Drawsub(x,y,x,y);
		}
		if(oepldisp){
			var p=document.getElementsByClassName('oeplframe')[0];
			if(y<p.offsetTop ||x<p.offsetLeft ||
					y>p.offsetTop+p.offsetHeight ||
					x>p.offsetLeft+p.offsetWidth){
				p.style.display="none";
				oepldisp=false;
			}
			return;
		}
		drawing = true;
	}
	function ctrlZKeyDown(e){//Ctrl-Zが押された時
		if((e.keyCode != 90 || !e.ctrlKey ) && (!e.target || e.target.id!="oebtnud")){
			return;
		}
		var recentp=undop;
		if (undostart==0){undostart=undop;}
		undop--;
		if (undop<1){undop=undomax;}
		if (undo[undop]==""){
			undop++;
			if(undop>undomax){undop=1;}
			return;
		}
		//Undoが一周した場合
		if (undostart==undop){
			if (undoSS[recentp]!=undoSS[undop]){
				setSuperScale(undoSS[undop],'undo');
				superScale = undoSS[undop];
				var sus=document.getElementById('oejs_sus');
				if (superScale == 1){
					sus.style.color = 'black';
				}else{
					sus.style.color = 'orange';
				}
			}
			resizeCanvas(undo[undop].width/superScale,undo[undop].height/superScale,'undo');
		}
		//
		
		switch (undoOpNa[recentp]){
			case 'draw':
				ctx.putImageData(undo[undop],0,0);
				break;
			case 'erase':
				ctx.putImageData(undo[undop],0,0);
				break;
			case 'flip':
				canvasFlip('undo');
				break;
			case 'fill':
				ctx.putImageData(undo[undop],0,0);
				break;
			case 'resize':
				resizeCanvas(undo[undop].width/superScale,undo[undop].height/superScale,'undo');
				ctx.putImageData(undo[undop],0,0);
				break;
			case 'superscale':
				setSuperScale(undoSS[undop],'undo');
				superScale = undoSS[undop];
				ctx.putImageData(undo[undop],0,0);
				var sus=document.getElementById('oejs_sus');
				if (superScale == 1){
					sus.style.color = 'black';
				}else{
					sus.style.color = 'orange';
				}
				break;
			default:
				ctx.putImageData(undo[undop],0,0);
				break;
		}
	}
	function DrawEnd(e){//ペンが上がった時
		getxy(e);
		if (drawing && (lastX!=x || lastY!=y)){
			Drawsub(lastX,lastY,x,y);
		}
		drawing = false;
		if(drewInside){
			recUndo('draw');
			drewInside=false;
		}
	}
	function updateDataUri(){//canvasをdataURIに変換して格納
		if (superScale != 1.0) {
			var tmp_oejs = downScaleCanvas(oejs, 1.0/superScale);
			oejs.width = originalWidth;
			oejs.height = originalHeight;
			ctx.drawImage(tmp_oejs, 0, 0);
		}
		var dataUri = oejs.toDataURL('image/png');
		dataUri=dataUri.replace(/^.*,/, '');
		var b=document.getElementById("baseform");
		if(b){b.value=dataUri;}
		return true;
	}
	function EraseDialog(e){//ダイアログを開いて消去するかどうか訊ねる
		Dialogdisp=true;
		document.getElementsByClassName('oezkbk')[0].style.display="block";
		document.getElementsByClassName("oezk")[0].getElementsByTagName('input')[0].focus();
	}
	function EraseDialogNo(e){//ダイアログを閉じる
		e.stopPropagation();
		document.getElementsByClassName('oezkbk')[0].style.display="none";
		Dialogdisp=false;
	}
	function EraseDialogYes(e){//消してダイアログを閉じる
		e.stopPropagation();
		Erase();
		document.getElementsByClassName('oezkbk')[0].style.display="none";
		Dialogdisp=false;
//		updateDataUri();
	}
	function EraseDialogKey(e){//escで閉じる
		if(!Dialogdisp){
			return;
		}
		if(e.keyCode==27){
			EraseDialogNo(e);
		}
	}
	function Erase(){//canvasを空白で埋める
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = "#f0e0d6";
		ctx.fillRect(0, 0, oejs.width, oejs.height);
		ctx.restore();
		recUndo('erase');
	}
	function getPosition(elm) {//getBoundingClientRect代替
		if(typeof elm.getBoundingClientRect == 'function'){
			return {x: elm.getBoundingClientRect().left,
							y: elm.getBoundingClientRect().top};
		}else{
			var xPos = 0, yPos = 0;
			while(elm) {
				xPos += (elm.offsetLeft - elm.scrollLeft + elm.clientLeft);
				yPos += (elm.offsetTop - elm.scrollTop + elm.clientTop);
				elm = elm.offsetParent;
			}
			return { x: xPos, y: yPos };
		}
	}
	function adjTouch(touch){//iOS4.3バグ対応
		if(touch.clientX==touch.pageX && touch.clientY==touch.pageY &&
				ua.indexOf('applewebkit/533') !== -1){
			var scX = (window.pageXOffset !== undefined) ? window.pageXOffset :
				(document.documentElement || document.body.parentNode || document.body).scrollLeft;
			var scY = (window.pageYOffset !== undefined) ? window.pageYOffset :
				(document.documentElement || document.body.parentNode || document.body).scrollTop;
			return {x:scX,y:scY};
		}else{
			return {x:0,y:0};
		}
	}
	function getxy(e){//マウスの座標を得る
		if(oest0.style.visibility=="hidden"){
			return;
		}
		var cx,cy;
		if("touches" in e && e.touches.length>0){
			var adj=adjTouch(e.touches[0]);
			cx=e.touches[0].clientX - adj.x;
			cy=e.touches[0].clientY - adj.y;
		}else{
			cx = e.clientX;
			cy = e.clientY;
		}
		var xy=getPosition(oejs);
		x=cx-xy.x;
		y=cy-xy.y;
		x/=viewScale;
		y/=viewScale;
		timestamp=e.timeStamp;
	}
	function storexy(e){//マウスの座標を格納する
		getxy(e);
		lastX = x;
		lastY = y;
		lastT = timestamp;
	}
	function recUndo(opName){// Undo記録処理
		undop++;
		if(undop>undomax){undop=1;}
		undostart=0;
		undo[undop] = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
		undoOpNa[undop] = opName || '';
		undoSS[undop] = superScale || '';
	}
	function set_value(){//スライダーの値を反映させる
	  sliderin.style.top = ( slidervalue - sliderheight/2) + 'px';
	  sliderout.value = slidervalue;
	}
	function sliderClick(e){// スライダーの目盛り部分をクリック
		if(dragging || dragged){
			return;
		}
		dragging = true;dragged = true;
		sliderMouseMove(e);
		sliderMouseUp(e);
		silderTipDisp(e,true);
	}
	function sliderMouseDown(e){// スライダーを掴む
	  dragging = true;dragged = true;
		getxy(e);
		silderTipDisp(e,false);
		return false;
	}
	function sliderMouseUp(e){// スライダーを離す
		if (dragging) {
			dragging = false;
			setTimeout(function(){dragged = false;},300);
			sliderout.value = slidervalue;
			var stt;
			while(stt = document.getElementsByClassName('slidertip')[0]){
				stt.parentNode.removeChild(stt);
			}
	  }
	}
	function sliderMouseMove(e){//スライダーを動かす
		var top;
		if(!dragging){
			return;
		}// ドラッグ途中
		e.preventDefault();
		if(!e){
			e = window.event;
		}
		if(e.touches){
			var adj=adjTouch(e.touches[0]);
			top =e.touches[0].clientY-adj.y;
		}else{
			top = e.clientY;
		}
		var xy=getPosition(slider);
		// マウス座標とスライダーの位置関係で値を決める
		slidervalue = Math.round(top - xy.y - sliderheight);
		// スライダーからはみ出したとき
		if (slidervalue < 0) {
			slidervalue = 0;
		} else if (slidervalue > parseInt(slider.clientHeight - sliderheight/2)) {
			slidervalue = parseInt(slider.clientHeight - sliderheight/2);
		}
		set_value();
		var stt = document.getElementsByClassName('slidertip')[0];
		if(stt){
			var tmp = y*viewScale - 14;
			if(tmp>45 && tmp<100){
				stt.style.top = tmp + "px";
			}
			stt.innerHTML = widthcal(slidervalue);
		}
	}
	function sliderThick(e,b){//ペンを太くor細くする
		var st=widthcal(slidervalue);
		do{
			if( b && slidervalue>0 || !b && slidervalue<parseInt(slider.clientHeight - sliderheight/2)){
				if(b){
					slidervalue--;
				}else{
					slidervalue++;
				}
			}else{
				break;
			}
		}while(st==widthcal(slidervalue));
		sliderout.value = slidervalue;
		set_value();
		silderTipDisp(e,true);
	}
	function silderTipDisp(e,autoremove){//ツールチップを表示する
		var stt = document.createElement('div');
		stt.className = 'slidertip';
		stt.style.position = 'absolute';
		stt.style.left = (x*viewScale - 37) + "px";
		stt.style.top = (y*viewScale -14)+ "px";
		stt.innerHTML = widthcal(slidervalue);
		oest0.appendChild(stt);
		if(autoremove){
			setTimeout(function(){
				if(stt){stt.parentNode.removeChild(stt);}
				}
				, 300);
		}
	}
	function palcol(x,y){//座標に応じたパレットの色を返す
		if(x==0){
			var col=["#000","#333","#666","#999","#ccc","#fff","#f00","#0f0","#00f","#ff0","#0ff","#f0f"];
			return col[y];
		}
		if(x==1){
			var col=["#111","#222","#444","#555","#777","#888","#aaa","#bbb","#ddd","#eee","#800000","#f0e0d6"];
			return col[y];
		}
		var r,g,b;
		x-=2;
		r=(parseInt(x/6)*3+parseInt(y/6)*9).toString(16);
		g=(x%6*3).toString(16);
		b=(y%6*3).toString(16);
		return "#"+r+g+b;
	}
	function appendcol(node){//色のタグをパレットに追加
		var df=document.createDocumentFragment();
		for(var j=0;j<12;j++){
			var d0 = document.createElement('div');
			d0.className = 'oeplx';
			for(var i=0;i<20;i++){
				var d1 = document.createElement('div');
				d1.className = 'oepla';
				d1.style.backgroundColor = palcol(i,j);
				d1.addEventListener("mousedown",piccol,false);
				d1.addEventListener("mouseenter",monicol,false);
				d0.appendChild(d1);
			}
			df.appendChild(d0);
		}
		node.appendChild(df);
	}
	function monicol(e){//パレットの色見本を表示する
		var el=e.target;
		var col=el.style.getPropertyValue('background-color');
		document.getElementsByClassName("oeplc")[0].style.backgroundColor=col;
		if(col.charAt(0)=="#"){
			col = col.substr(1);
		}else{
			col = col.replace("rgb(","");
			col = col.replace(")","");
			col = col.split(",");
			col = to16(parseInt(col[0])) + to16(parseInt(col[1])) + to16(parseInt(col[2]));
		}
		document.getElementsByClassName("oepli")[0].value=col.toUpperCase();
	}
	function to16(num){//16進数を返す
		return ('0' + num.toString(16)).slice(-2);
	}
	function piccol(e){//クリックで色を決定
		var el=e.target;
		var col=window.getComputedStyle(el).backgroundColor;
//		if(scriptSource.indexOf('base4.js') === -1){
//			document.getElementsByName("name").item(0).value="col:"+col;
//		}
		oecolorel.value = col;
		document.getElementById("oepb").style.backgroundColor = col;
		document.getElementsByClassName('oeplframe')[0].style.display="none";
		oepldisp=false;
	}
	function oeplikp(e){//色を16進数で入力
		var val=e.target.value;
		val=val.replace(/[^0-9a-f]/ig, "");
		if(val.length<4){
			var col='#'+ (val + "000").slice(0,3);
		}else{
			var col='#'+ (val + "00").slice(0,6);
		}
		document.getElementsByClassName("oeplc")[0].style.backgroundColor = col;
		if(e.keyCode!==13){
			return;
		}
		e.preventDefault();
		oecolorel.value = col;
		document.getElementById("oepb").style.backgroundColor = col;
		document.getElementsByClassName('oeplframe')[0].style.display="none";
		oepldisp=false;
	}
	function apendOejsHtml(target,width,height){//htmlタグをbodyに追加
		var d0=fragmentFromString('<div id="oest1"><canvas id="oejs" width="'+width+'" height="'+height+'"></canvas></div>\
	<div id="oest2">\
		<input type="input" name="c4" value="" size="12" id="oecolor"/>\
		<div id="oepb">\
			<div class="oepbb"><div class="oepba"></div></div>\
		</div>\
		<div id="oest5">\
			<input type="radio" name="switch" id="sw0" value="0" class="css-checkbox" checked/><label for="sw0" id="sw0label" class="oelabel"></label>\
			<input type="radio" name="switch" id="sw1" value="1" class="css-checkbox"/><label for="sw1" id="sw1label" class="oelabel"></label>\
		</div>\
		<div id="oest3">\
			<div id="oest4">\
				<svg width="14" height="32">\
					<circle cx="7" cy="7" r="6.5" fill="#000"></circle>\
				</svg>\
				<svg width="13" height="32">\
					<circle cx="9" cy="26" r="1" fill="#000"></circle>\
				</svg>\
			</div>\
			<div id="oest6">\
				<input type="hidden" name="slider" id="slider1o" value="45">\
				<div id="slider1" class="js-slider">\
					<div class="bar"></div>\
					<div class="knob"></div>\
				</div>\
			</div>\
		</div>\
		<input type="button" class="zbtn" id="oejsErase">\
	</div>\
<!--パレット-->\
	<div class="oeplframe">\
		<div class="oepl" id="oepalet">\
			<div class="oeplt">\
				<div class="oeplc"></div>\
				<input class="oepli">\
			</div>\
		</div>\
	</div>\
<!--全消しダイアログ-->\
	<div class="oezkbk">\
		<div class="oezk">\
			<div>全消し</div>\
			<div>全部消しますか？</div>\
			<div><input type="button" value="Yes"><input type="button" value="No"></div>\
		</div>\
	</div>');
		document.getElementById(target).appendChild(d0);
	}
	
	// http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
	// scales the canvas by (float) scale < 1
	// returns a new canvas containing the scaled image.
	function downScaleCanvas(cv, scale) {
		if (!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
		var sqScale = scale * scale; // square scale = area of source pixel within target
		var sw = cv.width; // source image width
		var sh = cv.height; // source image height
		var tw = Math.floor(sw * scale); // target image width
		var th = Math.floor(sh * scale); // target image height
		var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
		var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
		var tX = 0, tY = 0; // rounded tx, ty
		var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
		// weight is weight of current source point within target.
		// next weight is weight of current source point within next target's point.
		var crossX = false; // does scaled px cross its current px right border ?
		var crossY = false; // does scaled px cross its current px bottom border ?
		var sBuffer = cv.getContext('2d').
			getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
		var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
		var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
		/* untested !
		   var sA = 0;  //source alpha  */    

		for (sy = 0; sy < sh; sy++) {
			ty = sy * scale; // y src position within target
			tY = 0 | ty;     // rounded : target pixel's y
			yIndex = 3 * tY * tw;  // line index within target array
			crossY = (tY != (0 | ty + scale)); 
			if (crossY) { // if pixel is crossing botton target pixel
				wy = (tY + 1 - ty); // weight of point within target pixel
				nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
			}
			for (sx = 0; sx < sw; sx++, sIndex += 4) {
				tx = sx * scale; // x src position within target
				tX = 0 |  tx;    // rounded : target pixel's x
				tIndex = yIndex + tX * 3; // target pixel index within target array
				crossX = (tX != (0 | tx + scale));
				if (crossX) { // if pixel is crossing target pixel's right
					wx = (tX + 1 - tx); // weight of point within target pixel
					nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
				}
				sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
				sG = sBuffer[sIndex + 1];
				sB = sBuffer[sIndex + 2];

				/* !! untested : handling alpha !!
				   sA = sBuffer[sIndex + 3];
				   if (!sA) continue;
				   if (sA != 0xFF) {
                   sR = (sR * sA) >> 8;  // or use /256 instead ??
                   sG = (sG * sA) >> 8;
                   sB = (sB * sA) >> 8;
				   }
				*/
				if (!crossX && !crossY) { // pixel does not cross
					// just add components weighted by squared scale.
					tBuffer[tIndex    ] += sR * sqScale;
					tBuffer[tIndex + 1] += sG * sqScale;
					tBuffer[tIndex + 2] += sB * sqScale;
				} else if (crossX && !crossY) { // cross on X only
					w = wx * scale;
					// add weighted component for current px
					tBuffer[tIndex    ] += sR * w;
					tBuffer[tIndex + 1] += sG * w;
					tBuffer[tIndex + 2] += sB * w;
					// add weighted component for next (tX+1) px                
					nw = nwx * scale
					tBuffer[tIndex + 3] += sR * nw;
					tBuffer[tIndex + 4] += sG * nw;
					tBuffer[tIndex + 5] += sB * nw;
				} else if (crossY && !crossX) { // cross on Y only
					w = wy * scale;
					// add weighted component for current px
					tBuffer[tIndex    ] += sR * w;
					tBuffer[tIndex + 1] += sG * w;
					tBuffer[tIndex + 2] += sB * w;
					// add weighted component for next (tY+1) px                
					nw = nwy * scale
					tBuffer[tIndex + 3 * tw    ] += sR * nw;
					tBuffer[tIndex + 3 * tw + 1] += sG * nw;
					tBuffer[tIndex + 3 * tw + 2] += sB * nw;
				} else { // crosses both x and y : four target points involved
					// add weighted component for current px
					w = wx * wy;
					tBuffer[tIndex    ] += sR * w;
					tBuffer[tIndex + 1] += sG * w;
					tBuffer[tIndex + 2] += sB * w;
					// for tX + 1; tY px
					nw = nwx * wy;
					tBuffer[tIndex + 3] += sR * nw;
					tBuffer[tIndex + 4] += sG * nw;
					tBuffer[tIndex + 5] += sB * nw;
					// for tX ; tY + 1 px
					nw = wx * nwy;
					tBuffer[tIndex + 3 * tw    ] += sR * nw;
					tBuffer[tIndex + 3 * tw + 1] += sG * nw;
					tBuffer[tIndex + 3 * tw + 2] += sB * nw;
					// for tX + 1 ; tY +1 px
					nw = nwx * nwy;
					tBuffer[tIndex + 3 * tw + 3] += sR * nw;
					tBuffer[tIndex + 3 * tw + 4] += sG * nw;
					tBuffer[tIndex + 3 * tw + 5] += sB * nw;
				}
			} // end for sx 
		} // end for sy

		// create result canvas
		var resCV = document.createElement('canvas');
		resCV.width = tw;
		resCV.height = th;
		var resCtx = resCV.getContext('2d');
		var imgRes = resCtx.getImageData(0, 0, tw, th);
		var tByteBuffer = imgRes.data;
		// convert float32 array into a UInt8Clamped Array
		var pxIndex = 0; //  
		for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
			tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
			tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
			tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
			tByteBuffer[tIndex + 3] = 255;
		}
		// writing result to canvas.
		resCtx.putImageData(imgRes, 0, 0);
		return resCV;
	}
	
	function setViewScale(scale){//表示の拡大縮小
		if (scale!=''){
			viewScale = scale;
			canvasRedraw(originalWidth,originalHeight)
			dispTip('X'+viewScale,1);
		}else{
			return viewScale;
		}
	}
	function resizeCanvas(width,height,state){//キャンバスリサイズ
		originalWidth = width;
		originalHeight = height;
		var message='';
		canvasRedraw(width,height);
		if (state!='undo'){recUndo('resize')};
		message='w:'+width+'px h:'+height+'px';
		if (superScale>1){message='倍密 '+message+' (w:'+width*superScale+'px h:'+height*superScale+'px)';}
		dispTip(message,1);
	}
	function setSuperScale(scale,state){//キャンバス倍密設定
		if (scale!=superScale){
			var result = true;
			if (state!='undo'){result = confirm('すでに絵のある場合、密度変換で画質が劣化します。続けますか？');}
			if (result){
				ctx.save();
				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = 'source-over';
				superScale = scale;
				var width,height,url,img,message='';
				width = originalWidth;
				height = originalHeight;
				if (state!='undo'){
					//変更前画像保存
					var url = oejs.toDataURL();
					var img = new Image();
					img.src = url;
					//
					canvasRedraw(width,height);
					//変更後リスケール描き戻し・アンドゥ記録
					img.onload = function(){ctx.drawImage(img,0,0,width*superScale,height*superScale);recUndo('superscale');}
					//
				}else{
					canvasRedraw(width,height);
				}
				ctx.restore();
				message='w:'+width+'px h:'+height+'px';
				if (superScale>1){message='倍密 '+message+' (w:'+width*superScale+'px h:'+height*superScale+'px)';}
				dispTip(message,1);
				return true;
			}else{
				return false;
			}
		}else{return false;}
	}
	function setSmoothMode(){//スムーズモード設定
		smoothMode = !smoothMode;
		return smoothMode;
	}
	function canvasFlip(state){//キャンバス左右反転
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		ctx.translate(oejs.width,0);
		ctx.scale(-1,1);
		ctx.drawImage(oejs,0,0);
		ctx.restore();
		if (state!='undo'){recUndo('flip');}
		flipToggle = !flipToggle;
		if(document.getElementById('oejs_flip')){
			document.getElementById('oejs_flip').style.color = flipToggle ? 'orange' : 'black';
		}
	}
	function fillColor(){//指定色で塗りつぶし
		var color=oecolorel.value;
		ctx.save();
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle=color;
		ctx.fillRect(0,0,oejs.width,oejs.height);
		ctx.restore();
		recUndo('fill');
	}
	function canvasRedraw(width,height){//設定変更に伴う再描画
		var oe3,oest1,w,h,img;
		oe3 = document.getElementById('oe3');
		oest1 = document.getElementById('oest1');
		//ペン情報の退避
		var blendMode = ctx.globalCompositeOperation;
		var filterType = ctx.filter;
		var blendLevel= ctx.globalAlpha;
		//ctx.save();
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = 'source-over';
		w=oejs.width;
		h=oejs.height;
		img=ctx.getImageData(0,0,w,h);
		oejs.width = w = width*superScale;
		oejs.height = h = height*superScale;
		oejs.style.transform = 'scale('+(1/superScale)+')';
		ctx.fillStyle="#f0e0d6";
		ctx.fillRect(0,0,w,h);
		ctx.putImageData(img,0,0,0,0,w,h);
		//ペン情報のリストア
		ctx.globalCompositeOperation = blendMode;
		ctx.filter = filterType;
		ctx.globalAlpha = blendLevel;
		//ctx.restore();
		oest1.style.width = (w/superScale) + 'px';
		oest1.style.height = (h/superScale) + 'px';
		oest1.style.transform = 'scale(' + viewScale + ')';
		if (w/superScale*viewScale > 344){w = ~~(w/superScale*viewScale);}else{w = 344;}
		if (h/superScale*viewScale > 135){h = ~~(h/superScale*viewScale);}else{h= 135;}
		oe3.style.width = (w+46)+'px';
		oe3.style.height = (h+20)+'px';
	}
	function setPenRatio(ratio){//ペンサイズ微調整率
		penRatio = ratio;
	}
	
	return {'Init':oeInit, 'oeUpdate':updateDataUri, 'reset':removeEvent, 'setViewScale':setViewScale, 'resizeCanvas':resizeCanvas, 'setSuperScale':setSuperScale, 'setSmoothMode':setSmoothMode, 'canvasFlip':canvasFlip, 'fillColor':fillColor, 'setPenRatio':setPenRatio, 'dispTip':dispTip};
})();



// ===== 追加分 =====

function rewriteInit(){
	var d=document;
	
	// HTML要素の再設定
	var swfc,oe3,oe3tab,oest1,oejs,oest2,tool,tolltab,ftxa;
	swfc=d.getElementById('swfContents');
	
	oe3=d.getElementById('oe3');
	oe3.style.position='absolute';
	oe3.style.backgroundColor='#f0d0c3';
	oe3.style.width='344px';
	oe3.style.height='155px';
	oe3.style.boxShadow='2px 6px 4px rgba(0,0,0,0.3)';
	oe3.style.visibility='visible';
	
	oest1=d.getElementById('oest1');
	oest1.style.width='344px';
	oest1.style.height='135px';
	oest1.style.transform='scale(1)';
	oest1.style.transformOrigin='0 0';
	
	oejs=d.getElementById('oejs');
	oejs.style.transformOrigin='0 0';
	
	oest2=d.getElementById('oest2');
	oest2.style.float='right';
	
	var tmp = d.createElement('div');
	tmp.id = 'oe3_tab';
	tmp.style.backgroundColor='coral';
	tmp.style.height='20px';
	tmp.style.cursor='move';
	oe3.insertBefore(tmp,oest1);
	oe3tab=d.getElementById('oe3_tab');
	
	var oepalet=d.getElementById('oepalet');
	oepalet.parentNode.style.left='auto';
	oepalet.parentNode.style.right='-185px';
	oepalet.parentNode.style.top='42px';
	
	
	(function () {
		var str='<!-- oejsToolBar -->\
	<style>\
		#oejs_tl {width:484px;position:absolute;overflow:visible;top:-50px;left:0;background-color:lightgrey;box-shadow: 2px 4px 2px rgba(0,0,0,0.3);}\
		#oejs_tl div {color:#BBB;background-color:gray;font-size:0.5em;text-align:right;padding-right:0.5em;height:12px;cursor:move;}\
		#oejs_tl i.material-icons {color:black;float:left;margin:4px 0 4px 8px;cursor:pointer;}\
		#oejs_tl i.lsp {padding-left:8px; border-left:solid 2px white;}\
		#oejs_tl i.rsp {padding-right:8px;}\
		#oejs_tl i.sel, #oejs_tl i:hover {color:orange;}\
	</style>\
	<div id="oejs_tl">\
		<div id="oejs_tltb">ver.181222</div>\
		<i class="material-icons" title="リサイズ" id="oejs_rsze">&#xE56B;</i>\
		<i class="material-icons lsp" title="倍密度" id="oejs_sus">&#xE024;</i>\
		<i class="material-icons lsp" title="縮小" id="oejs_zm1">&#xE900;</i>\
		<i class="material-icons sel" title="等倍" id="oejs_zm2">&#xE85B;</i>\
		<i class="material-icons" title="拡大" id="oejs_zm3">&#xE8FF;</i>\
		<i class="material-icons sel lsp" title="スムージング" id="oejs_smth">&#xE3A5;</i>\
		<i class="material-icons" title="マーカー" id="oejs_mkr">&#xE22B;</i>\
		<i class="material-icons" title="ペン調整-1" id="oejs_bi1">&#xE3CB;</i>\
		<i class="material-icons sel" title="ペン調整 0" id="oejs_bi2">&#xE39E;</i>\
		<i class="material-icons" title="ペン調整+1" id="oejs_bi3">&#xE3CD;</i>\
		<i class="material-icons lsp" title="塗りつぶし" id="oejs_fill">&#xE243;</i>\
		<i class="material-icons lsp" title="反転" id="oejs_flip">&#xE3E8;</i>\
		<i class="material-icons lsp rsp" title="情報" id="oejs_info">&#xE88F;</i>\
	</div>';
		var f=d.createDocumentFragment(),
		tmp=d.createElement('body'),
		child;
		tmp.innerHTML=str;
		while (child=tmp.firstChild){
			f.appendChild(child);
		}
		oe3.appendChild(f);
	})();
	
	
	// フォームの整形
	tool=d.getElementById('oejs_tl');
	tooltab=d.getElementById('oejs_tltb');
	ftxa=d.getElementById('ftxa');
	oe3.style.width=(344+46)+'px';
	ftxa.parentNode.style.position='relative';
	swfc.style.width='344px';
	swfc.style.height='135px';
	ftxa.parentNode.style.maxWidth='none';
	ftxa.style.position='absolute';
	ftxa.style.top=ftxa.style.left=0;
	
	// カラーパレットの数値入力補助
	var oepli = d.getElementsByClassName('oepli')[0];
	oepli.addEventListener("mouseenter",function(){
		oepli.select();
	},false);
	
	
	// Googleのアイコンフォント設定
	var link,head;
	link=d.createElement('link');
	link.href='https://fonts.googleapis.com/icon?family=Material+Icons';
	link.rel='stylesheet';
	link.type='text/css';
	head=d.getElementsByTagName('head')[0];
	head.appendChild(link);
	
	// フロートキャンバス・ツールバー動作
	var mx,my;
	var flag='';
	
	function dragPreOe3(event) {
		flag='oe3';
		dragOn(event,flag);
	}
	function dragPreTool(event) {
		flag='tool';
		dragOn(event,flag);
	}
	function dragOn(event,flag) {
		var rect;
		if(flag=='oe3'){
			rect=swfc.getBoundingClientRect();
		}else{
			rect=oe3.getBoundingClientRect();
		}
		mx=rect.left+event.offsetX+(d.body.scrollLeft || d.documentElement.scrollLeft);
		my=rect.top+event.offsetY+(d.body.scrollTop || d.documentElement.scrollTop);
	}
	function dragOff() {flag='';}
	function dragMove(event){
		if (flag!='') {
			if(flag=='oe3'){
				var tx,ty;
				tx=oe3.offsetLeft;
				ty=oe3.offsetTop;
				oe3.style.left=~~(event.pageX-mx)+'px';
				oe3.style.top=~~(event.pageY-my)+'px';
				tx-=oe3.offsetLeft;
				ty-=oe3.offsetTop;
				tool.style.left=~~(tool.offsetLeft+tx)+'px';
				tool.style.top=~~(tool.offsetTop+ty)+'px';
			}else{
				tool.style.left=~~(event.pageX-mx)+'px';
				tool.style.top=~~(event.pageY-my)+'px';
			}
		}
	}
	
	isTouch = 'ontouchstart' in window;
	if (window.PointerEvent) {
			oe3tab.addEventListener('pointerdown',dragPreOe3,false);
			tooltab.addEventListener('pointerdown',dragPreTool,false);
			d.addEventListener('pointerup',dragOff,false);
			d.addEventListener('pointermove',dragMove,false);
			
	}else{
		if(isTouch){
			oe3tab.addEventListener('touchstart',dragPreOe3,false);
			tooltab.addEventListener('touchstart',dragPreTool,false);
			d.addEventListener('touchend',dragOff,false);
			d.addEventListener('touchmove',dragMove,false);
		}
		oe3tab.addEventListener('mousedown',dragPreOe3,false);
		tooltab.addEventListener('mousedown',dragPreTool,false);
		d.addEventListener('mouseup',dragOff,false);
		d.addEventListener('mousemove',dragMove,false);
	}
	
	
	// 各ツール動作
	var rsze,sus,zm1,zm2,zm3,smth,mkr,bi1,bi2,bi3,bi4,bi5,flip;
	rsze=d.getElementById('oejs_rsze');
	sus=d.getElementById('oejs_sus');
	zm1=d.getElementById('oejs_zm1');
	zm2=d.getElementById('oejs_zm2');
	zm3=d.getElementById('oejs_zm3');
	smth=d.getElementById('oejs_smth');
	mkr=d.getElementById('oejs_mkr');
	bi1=d.getElementById('oejs_bi1');
	bi2=d.getElementById('oejs_bi2');
	bi3=d.getElementById('oejs_bi3');
	fill=d.getElementById('oejs_fill');
	flip=d.getElementById('oejs_flip');
	info=d.getElementById('oejs_info');
	
	rsze.addEventListener('click',frsze,false);
	sus.addEventListener('click',fsus,false);
	zm1.addEventListener('click',fzm1,false);
	zm2.addEventListener('click',fzm2,false);
	zm3.addEventListener('click',fzm3,false);
	smth.addEventListener('click',fsmth,false);
	mkr.addEventListener('click',fmkr,false);
	bi1.addEventListener('click',fbi1,false);
	bi2.addEventListener('click',fbi2,false);
	bi3.addEventListener('click',fbi3,false);
	fill.addEventListener('click',ffill,false);
	flip.addEventListener('click',fflip,false);
	info.addEventListener('click',finfo,false);
	
	// リサイズ
	function frsze(){
		var ctx,cw,ch,w,h,str,ss;
		ctx=oejs.getContext('2d');
		cw=oejs.width;
		ch=oejs.height;
		str=oejs.style.transform.split(/\(|\)/);
		ss=str[1];
		if( !ss || isNaN(ss) ){ss=1;}else{ss=~~(1/ss);}
	
		w=prompt('幅(100-400) 初期値：344(px)',~~(cw/ss));
		if (w!=null){
			h=prompt('高さ(100-400) 初期値：135(px)',~~(ch/ss));
			if (h!=null){
				if(isNaN(w+h)||!w||!h){
					alert('数値を入力してください w:'+w+'h:'+h);
					h=null;
				}else{
					if(w<100){w=100;}
					if(w>400){w=400;}
					if(h<100){h=100;}
					if(h>400){h=400;}
				}
			}
		}
		if(!w||!h){
			w=~~(cw/ss);
			h=~~(ch/ss);
		}
		tegakiJs.resizeCanvas(w,h);
	}
	
	// 表示の拡大縮小
	function fzm1(){
		var scale = tegakiJs.setViewScale('');
		if (scale < 1){scale = 0.5;} else {scale -= 0.5;}
		tegakiJs.setViewScale(scale);
		fzmSelect(scale);
	}
	function fzm2(){
		tegakiJs.setViewScale(1.0);
		fzmSelect(1.0);
	}
	function fzm3(){
		var scale = tegakiJs.setViewScale('');
		if (scale >= 8){scale = 8.0;} else {scale += 0.5;}
		tegakiJs.setViewScale(scale);
		fzmSelect(scale);
	}
	function fzmSelect(scale){
		if (scale==1){zm2.style.color = 'orange';}else{zm2.style.color = 'black';}
	}
	
	// スーパーサンプリング
	function fsus(){
		var scale;
		if (sus.style.color == 'orange'){
			scale = 1;
		}else{
			scale = 2;
		}
		var result = tegakiJs.setSuperScale(scale);
		if (result){
			if (scale == 1){
				sus.style.color = 'black';
			}else{
				sus.style.color = 'orange';
			}
		}
	}
	
	// スムージング切り替え
	function fsmth(){
		var smoothMode = tegakiJs.setSmoothMode();
		smth.style.color = smoothMode ? 'orange' : 'black';
	}
	
	// マーカー
	function fmkr(){
		var ctx=oejs.getContext('2d');
		if ((ctx.globalCompositeOperation != 'source-over') || (ctx.globalAlpha != 1)){
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = 'source-over';
			ctx.filter = 'none';
			mkr.style.color = 'black';
		}else{
			ctx.globalCompositeOperation = 'darken';
			if(ctx.globalCompositeOperation != null){
				ctx.globalAlpha = 0.5;
				mkr.style.color = 'orange';
			}else{
				ctx.globalCompositeOperation = 'source-over';
				alert('このブラウザはマーカーモードに対応していません');
			};
		}
	}
	
	// ペンバイアス
	function fbi1(){
		tegakiJs.setPenRatio(-0.3);
		fbiSelRst();
		bi1.style.color = 'orange';
	}
	function fbi2(){
		tegakiJs.setPenRatio(0.0);
		fbiSelRst();
		bi2.style.color = 'orange';
	}
	function fbi3(){
		tegakiJs.setPenRatio(0.3);
		fbiSelRst();
		bi3.style.color = 'orange';
	}
	function fbiSelRst(){
		bi1.style.color=bi2.style.color=bi3.style.color='black';
	}
	
	// 塗りつぶし
	function ffill(){
		if (confirm('描画色で画面を塗りつぶします')){
			tegakiJs.fillColor();
		}
	}
	
	// 反転
	function fflip(){
		tegakiJs.canvasFlip();
	}
	
	// 情報
	function finfo(){
		var ctx,vscale='',width,height;
		ctx=oejs.getContext('2d');
		vscale=tegakiJs.setViewScale(vscale);
		message='X'+vscale+' ';
		width=oejs.width;
		height=oejs.height;
		if (oejs.style.transform=="scale(0.5)"){
			message+='倍密 w:'+width/2+'px h:'+height/2+'px (w:'+width+'px h:'+height+'px) ';
		} else {
			message+='通常 w:'+width+'px h:'+height+'px ';
		}
		tegakiJs.dispTip(message,3);
	}
	
}


// tegakiJsと再設定の起動部分
(function(){
	var d=document;
	if(d.getElementById('oe3').innerHTML!=''){
		alert('手書きjsが動く前に、このスクリプトを使用してください');
	}else{
		if(swfloaded){
			alert('Flash版手書きには使用できません');
		}else{
			ChangeDraw('j');
			// 構築を待機して設定
			var timer=setInterval(function(){
				if(d.getElementById('oe3').innerHTML!=''){
					clearInterval(timer);
					rewriteInit();
				}
			},500);
		}
	}
})()
