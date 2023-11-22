var sizeDict = {
    "size-photo": {
        "width": 600,
        "height": 730
    },
    "size-signature": {
        "width": 788,
        "height": 284
    },
};
window.onload = function () {
    var canvas = document.getElementById('image-canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas context is not available');
    }
    var selectRegionContainer = document.getElementById('select-region-container');
    selectRegionContainer.style.display = "none";
    var selectSizeContainer = document.getElementById('select-size-container');
    selectSizeContainer.style.display = "none";
    var saveButtonContainer = document.getElementById('save-button-container');
    saveButtonContainer.style.display = "none";
    var inputElement = document.getElementById('image-input');
    var sizeTemplate1 = document.getElementById('size-photo');
    var sizeTemplate2 = document.getElementById('size-signature');
    var zoomSlider = document.getElementById('zoom-slider');
    var scaleLabel = document.getElementById('label-scale');
    var saveButton = document.getElementById('save-button');
    var width, height;
    var startX = 0, startY = 0;
    var centerX = 0, centerY = 0;
    var scale = 1.0;
    var isDown = false;
    var img = new Image();
    sizeTemplate1.addEventListener('change', function (event) {
        if (sizeTemplate1.checked) {
            selectRegionContainer.style.display = "block";
            saveButtonContainer.style.display = "block";
            var size = sizeDict['size-photo'];
            height = size["height"];
            width = size["width"];
            recalculateAcceptZoom(ctx, img);
            recalculatePosition();
            drawImage(ctx);
            drawSelectedArea(ctx);
        }
    });
    sizeTemplate2.addEventListener('change', function (event) {
        if (sizeTemplate2.checked) {
            selectRegionContainer.style.display = "block";
            saveButtonContainer.style.display = "block";
            var size = sizeDict['size-signature'];
            height = size["height"];
            width = size["width"];
            recalculateAcceptZoom(ctx, img);
            recalculatePosition();
            drawImage(ctx);
            drawSelectedArea(ctx);
        }
    });
    function recalculatePosition() {
        startX = centerX - (width / 2);
        startY = centerY - (height / 2);
        startX = Math.max(0, startX);
        startY = Math.max(0, startY);
        var offsetX = Math.min(0, canvas.width - (startX + width));
        var offsetY = Math.min(0, canvas.height - (startY + height));
        startX += offsetX;
        startY += offsetY;
    }
    inputElement.addEventListener('change', function (event) {
        var files = event.target.files;
        if (files && files[0]) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                var _a;
                img.onload = function () {
                    recalculateAcceptZoom(ctx, img);
                    recalculatePosition();
                    drawImage(ctx);
                    drawSelectedArea(ctx);
                    selectSizeContainer.style.display = "block";
                };
                img.src = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            };
            fileReader.readAsDataURL(files[0]);
        }
    });
    function recalculateAcceptZoom(ctx, image) {
        if (!image) {
            return;
        }
        var minHorizontalScale = width / image.width;
        var minVerticalScale = height / image.height;
        var minScale = Math.max(minHorizontalScale, minVerticalScale);
        zoomSlider.min = minScale.toString();
        zoomSlider.value = Math.max(minScale, +zoomSlider.value).toString();
        scale = +zoomSlider.value;
        drawImage(ctx);
        recalculatePosition();
        drawSelectedArea(ctx);
    }
    canvas.addEventListener('mouseenter', function (e) {
        drawImage(ctx);
        drawSelectedArea(ctx);
    });
    canvas.addEventListener('mousedown', function (e) {
        isDown = true;
        centerX = e.offsetX;
        centerY = e.offsetY;
        drawImage(ctx);
        recalculatePosition();
        drawSelectedArea(ctx);
    });
    canvas.addEventListener('mousemove', function (e) {
        if (!isDown) {
            return;
        }
        centerX = e.offsetX;
        centerY = e.offsetY;
        drawImage(ctx);
        recalculatePosition();
        drawSelectedArea(ctx);
    });
    canvas.addEventListener('mouseout', function (e) {
        drawImage(ctx);
        drawSelectedArea(ctx);
    });
    canvas.addEventListener('mouseup', function (e) {
        isDown = false;
        centerX = e.offsetX;
        centerY = e.offsetY;
        drawImage(ctx);
        recalculatePosition();
        drawSelectedArea(ctx);
    });
    zoomSlider.addEventListener('input', function () {
        scale = +zoomSlider.value;
        scaleLabel.innerText = Math.round(scale * 100) + "%";
        drawImage(ctx);
        recalculatePosition();
        drawSelectedArea(ctx);
    });
    function drawImage(ctx) {
        if (!img) {
            return;
        }
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    function drawSelectedArea(ctx) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(startX, startY, width, height);
    }
    saveButton.addEventListener('click', function () {
        if (!img.src)
            return;
        var outputCanvas = document.createElement('canvas');
        var outputCtx = outputCanvas.getContext('2d');
        if (!outputCtx)
            return;
        outputCanvas.width = width;
        outputCanvas.height = height;
        outputCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);
        var imageUrl = outputCanvas.toDataURL('image/jpeg');
        var a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'selected-image.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};
