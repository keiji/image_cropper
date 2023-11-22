const sizeDict = {
	"size-photo": {
		"width": 600,
		"height": 730
	},
	"size-signature": {
		"width": 788,
		"height": 284
	},
}

window.onload = () => {
	const canvas = document.getElementById('image-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

	if (!ctx) {
        throw new Error('Canvas context is not available');
    }

    const inputElement = document.getElementById('image-input') as HTMLInputElement;
	const sizeTemplate1 = document.getElementById('size-photo') as HTMLInputElement;
    const sizeTemplate2 = document.getElementById('size-signature') as HTMLInputElement;

	const zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement;
    const saveButton = document.getElementById('save-button') as HTMLButtonElement;

	let width: number, height: number;
    let startX: number, startY: number;
    let centerX: number, centerY: number;
	let scale: number = 1.0;

	let isDown = false;

	const img = new Image();

	sizeTemplate1.addEventListener('change', (event) => {
		if(sizeTemplate1.checked) {
			const size = sizeDict['size-photo'];
			height = size["height"];
			width = size["width"];

			recalculateAcceptZoom(ctx, img)
			recalculatePosition();
			drawImage(ctx);
			drawSelectedArea(ctx);
		}
	});
	sizeTemplate2.addEventListener('change', (event) => {
		if(sizeTemplate2.checked) {
			const size = sizeDict['size-signature'];
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

		const offsetX = Math.min(0, canvas.width - (startX + width));
		const offsetY = Math.min(0, canvas.height - (startY + height));

		startX += offsetX;
		startY += offsetY;
	}


	inputElement.addEventListener('change', (event) => {
        const files = (event.target as HTMLInputElement).files;
        if (files && files[0]) {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                img.onload = () => {
					recalculateAcceptZoom(ctx, img);
					recalculatePosition();
					drawImage(ctx);
					drawSelectedArea(ctx);
                };
                img.src = e.target?.result as string;
            };

			fileReader.readAsDataURL(files[0]);
        }
    });

	function recalculateAcceptZoom(ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
		if (!image) {
			return;
		}

		const minHorizontalScale = width / image.width
		const minVerticalScale = height / image.height

		const minScale = Math.max(minHorizontalScale, minVerticalScale)
		zoomSlider.min = minScale.toString();
		zoomSlider.value = Math.max(minScale, +zoomSlider.value).toString();

		scale = +zoomSlider.value;

		drawImage(ctx);
		recalculatePosition();
		drawSelectedArea(ctx);
	}

	canvas.addEventListener('mouseenter', (e) => {
		drawImage(ctx);
		drawSelectedArea(ctx);
    });
	canvas.addEventListener('mousedown', (e) => {
        isDown = true;
        centerX = e.offsetX;
        centerY = e.offsetY;

		drawImage(ctx);
		recalculatePosition();
		drawSelectedArea(ctx);
	});

    canvas.addEventListener('mousemove', (e) => {
        if (!isDown) {
			return;
		}
        centerX = e.offsetX;
        centerY = e.offsetY;

		drawImage(ctx);
		recalculatePosition();
		drawSelectedArea(ctx);
    });

	canvas.addEventListener('mouseout', (e) => {
		drawImage(ctx);
		drawSelectedArea(ctx);
    });

	canvas.addEventListener('mouseup', (e) => {
        isDown = false;
        centerX = e.offsetX;
        centerY = e.offsetY;

		drawImage(ctx);
		recalculatePosition();
		drawSelectedArea(ctx);
    });

	zoomSlider.addEventListener('input', () => {
		scale = +zoomSlider.value;
		drawImage(ctx)
		recalculatePosition();
		drawSelectedArea(ctx);
    });

	function drawImage(ctx: CanvasRenderingContext2D) {
        if (!img) {
			return;
		}
		canvas.width = img.width * scale;
		canvas.height = img.height * scale;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

	function drawSelectedArea(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(startX, startY, width, height);
    }

	saveButton.addEventListener('click', () => {
        if (!img.src) return;
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d');
        if (!outputCtx) return;

        outputCanvas.width = width;
        outputCanvas.height = height;
        outputCtx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

        const imageUrl = outputCanvas.toDataURL('image/jpeg');
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = 'selected-image.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
};
