var AverageHash = (function(){
	function AverageHash(url1, url2, threshold, success){
		var imgs = [];
		loadImg(url1, function(img){
			imgs.push(img);
			if(imgs.length === 2){
				success(check(imgs[0], imgs[1]) / (16 * 16) < (threshold/100));
			}
		});
		
		
		loadImg(url2, function(img){
			imgs.push(img);
			if(imgs.length === 2){
				success(check(imgs[0], imgs[1]) / (16 * 16) < (threshold/100));
			}
		});
	}
	
	
	function check(img1, img2){
		var canvas1 = document.createElement('canvas');
		canvas1.width = 16;
		canvas1.height = 16;
		var ctx1 = canvas1.getContext('2d');
		ctx1.drawImage(img1, 0, 0, 16, 16);
		var canvas2 = document.createElement('canvas');
		canvas2.width = 16;
		canvas2.height = 16;
		var ctx2 = canvas2.getContext('2d');
		ctx2.drawImage(img2, 0, 0, 16, 16);
		var buf1, buf2;
		buf1 = ctx1.getImageData(0,0,16,16);
		buf2 = ctx2.getImageData(0,0,16,16);
		reduce(buf1.data, 16, 16);
		reduce(buf2.data, 16, 16);
		ctx1.putImageData(buf1, 0, 0);
		ctx2.putImageData(buf2, 0, 0);
		var bits1 = toArray(buf1.data, mean(buf1.data, 16, 16), 16, 16);
		var bits2 = toArray(buf2.data, mean(buf2.data, 16, 16), 16, 16);
		return compare(bits1,bits2);
	}
	
	function loadImg(url, success){
		var img = new Image();
		img.onload = function(){
			success(img);
		}
		img.src = url;
	}
	
	function getBinary(url, success){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function(){
            if(this.status == 200){
                success(new Uint8Array(this.response));
            }
        }
        xhr.send();
    }
	
	function reduce(buf, width, height){
		for(var y = 0;y < height;y++){
			for(var x = 0;x < width;x++){
				var offset = y*4*width + x * 4;
				var r = buf[offset];
				var g = buf[offset+1];
				var b = buf[offset+2];
				var a = buf[offset+3];
				var val = 0.298912 * r + 0.586611 * g + 0.114478 * b;
				
				buf[offset] = buf[offset+1] = buf[offset+2] = val * a / 255;
			}
		}
	}
	
	function mean(buf, width, height){
		var sum = 0;
		for(var y = 0;y < height;y++){
			for(var x = 0;x < width;x++){
				var offset = y*4*width + x * 4;
				var r = buf[offset];
				//var g = buf[offset+1];
				//var b = buf[offset+2];
				//var a = buf[offset+3];
				sum += r;
			}
		}
		return sum / (width * height);
	}
	
	function toArray(buf, mean, width, height){
		var result = [];
		for(var y = 0;y < height;y++){
			for(var x = 0;x < width;x++){
				var offset = y*4*width + x * 4;
				var r = buf[offset];
				if(r >= mean){
					result.push(1);
				}else{
					result.push(0);
				}
			}
		}
		return result;
	}
	
	function compare(arr1, arr2){
		var dif = 0;
		for(var i = 0;i < arr1.length;i++){
			if(arr1[i] !== arr2[i]){
				dif++;
			}
		}
		return dif;
	}
	
	return AverageHash;
})();