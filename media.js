function Media(node) {
	this.playState = false;    //播放状态
	this.currentTime = 0;      //当前播放时间
	this.duration = 0;         //总播放时间
	this.ended = false;        //时候播放完成
	this.volume = 0.5;         //音量
	this.prevVolume = 0;	   //静音前的音量
	this.node = node;          //音频节点
	this.startflag = true;     //初始化设置开始时间
	this.b = true;             //圆点移动完成
}

//事件初始化
Media.prototype.init = function() {
	var that = this;

	//播放结束
	this.node.onended = function() {  
		that.pause();
	};

	//可以开始播放
	this.node.oncanplay = function() { 
		if (that.startflag) {
			that.node.currentTime = that.currentTime;
			var  startPer = that.currentTime/that.node.duration;
			that.setTime();
			that.setProgressBar(startPer, 'play');
			that.setProgressBar(that.volume, 'volume');
			that.startflag = false;
		}
	};

	//播放和暂停
	$(".z-audio").on("click", ".z-switch", function() {   
		if (that.playState) {
			that.pause();
		}
		else {
			that.play();
		}
	});

	//声音是否静音
	$(".z-audio").on("click", ".z-volume", function() {   
		if ($(this).hasClass("fa-volume-up")) {
			that.prevVolume = that.node.volume;
			that.setVolume(0);
			$(this).removeClass("fa-volume-up");
		}
		else {
			that.setVolume(that.prevVolume);
			$(this).addClass("fa-volume-up");
		}
	});


	//移动鼠标事件绑定
	$(".z-progress-bar").on("mousedown", ".z-move-circle" , function() {
		$(".z-audio").off("click", ".z-progress-bar");
		that.moveCircle(); 
		return false;                                     
	});

	//移动鼠标事件解绑
	$(".z-progress-bar").on("mouseup", ".z-move-circle",  function() {
		that.b = false;
		 that.barClick();
		$(".z-audio").off("mousemove", ".z-progress-bar");
		return false;                      
	});

	that.barClick();

};

Media.prototype.setVolume =function(per) {
	this.node.volume = per;
	this.volume = per;
};

//进度条位置移动
Media.prototype.barClick =function() {
	var that = this;
	$(".z-audio").on("click", ".z-progress-bar", function(event) {  
		if (that.b) {
			var e = window.event||event;
			var _content = $(this).attr("_content");
			that.moveNewPos(e, _content);
		}
		else {
			that.b = true;
		}
	});
}

//鼠标移动圆点绑定
Media.prototype.moveCircle = function() {
	var that = this;
	$(".z-audio").on("mousemove", ".z-progress-bar", function(event) {
		var e = e||event;
		if (that.b) {
			var _content = $(this).attr("_content");
			that.moveNewPos(e, _content);
			return false;
		}
	})
}

//停止播放事件
Media.prototype.pause = function() {
	$(".z-switch").find("i").removeClass("fa-pause");
	this.playState = false;
	this.node.pause();
}

//开始播放事件
Media.prototype.play = function() {
	$(".z-switch").find("i").addClass("fa-pause");
	this.playState = true;
	this.node.play();
	this.setTime();
}

//设置播放时间
Media.prototype.setTime = function() {
	var that = this;

	this.duration = parseInt(this.node.duration);
	$(".z-total-time").text(formatTime(this.duration));
	that.currentTime = parseInt(that.node.currentTime);
	$(".z-now-time").text(formatTime(that.currentTime));

	if (this.playState) { //设置已播放时间
		clearInterval(this.timer);
		this.timer = setInterval(function() {
			that.currentTime = parseInt(that.node.currentTime);
			var per = that.currentTime/that.duration;

			$(".z-now-time").text(formatTime(that.currentTime));
			that.setProgressBar (per, 'play');
		},100);
	}
}

//设置进度条和声音条
Media.prototype.setProgressBar = function(per, np) {
	if (np == 'volume') {
		this.setVolume(per);
	}
	var vp = per*$(".z-"+np+"-bar").width();
	$(".z-"+np+"-bar .z-prog-active-line").width(vp);
	$(".z-"+np+"-bar .z-move-circle").css({"margin-left":vp});
}

//进度条和声音条移动到新位置
Media.prototype.moveNewPos = function(event, np) {
	if ($(event.target || event.srcElement).hasClass("z-progress-bar") || $(event.target || event.srcElement).hasClass("z-prog-line") || $(event.target || event.srcElement).hasClass("z-prog-active-line") ) {
		var box = (event.target || event.srcElement).getBoundingClientRect();
		var offsetX = event.clientX - box.left;  //获取距离左边距离
		var xper = offsetX/$(".z-"+np+"-bar").width();
		
		this.setProgressBar(xper, np);
		if (np == 'play') {
			this.node.currentTime = parseInt(xper*this.duration);
			this.setTime();
			if (this.playState) {
				this.play();
			}
			else {
				this.pause();
			}
		}
	}


}

//时间格式化
function formatTime(time) {
	var hh = parseInt(time/3600);
	var mm = parseInt((time - hh*3600)/60);
	var ss = time - hh*3600 - mm*60;
	hh = toTwo(hh, 1);
	mm = toTwo(mm, 2);
	ss = toTwo(ss, 3);

	function toTwo(t, b) {
		if (t == 0) {
			t = (b == 1) ? '' : ((b == 2) ? '00:' : '00');
		}
		else if (t >0 && t<10) {
			t = (b==1) ? '0'+t+':' : ((b == 2) ? '0'+t+':':'0'+t);
		}
		else {
			t = (b==1) ? t+":" : ((b == 2) ? t + ':':t);
		}
		return t;
	}
	var timee = hh+mm+ss

	return timee;
}

