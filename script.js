document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeBtn = document.getElementById('themeBtn');
    const body = document.body;
    
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) body.setAttribute('data-theme', savedTheme);
    themeBtn.addEventListener('click', toggleTheme);

    // Image Processor
    const elements = {
        imageInput: document.getElementById('imageInput'),
        uploadBtn: document.getElementById('uploadBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        autoEnhanceBtn: document.getElementById('autoEnhanceBtn'),
        originalImage: document.getElementById('originalImage'),
        enhancedImage: document.getElementById('enhancedImage'),
        brightness: document.getElementById('brightness'),
        contrast: document.getElementById('contrast'),
        saturation: document.getElementById('saturation'),
        sharpness: document.getElementById('sharpness'),
        resetBtn: document.getElementById('resetBtn'),
        slider: document.querySelector('.slider'),
        rotateLeftBtn: document.getElementById('rotateLeftBtn'),
        rotateRightBtn: document.getElementById('rotateRightBtn'),
        formatSelect: document.getElementById('formatSelect')
    };

    let state = {
        currentImage: null,
        enhancedCanvas: null,
        isDragging: false,
        rotationAngle: 0
    };

    // Event Listeners
    elements.uploadBtn.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', handleImageUpload);
    elements.slider.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', handleDragging);
    document.addEventListener('mouseup', stopDragging);
    elements.resetBtn.addEventListener('click', resetControls);
    elements.autoEnhanceBtn.addEventListener('click', autoEnhance);
    elements.rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    elements.rotateRightBtn.addEventListener('click', () => rotateImage(90));
    elements.downloadBtn.addEventListener('click', downloadImage);
    
    [elements.brightness, elements.contrast, elements.saturation, elements.sharpness]
        .forEach(control => control.addEventListener('input', updateImage));

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            elements.originalImage.onload = () => {
                initializeImageProcessing(event.target.result);
            };
            elements.originalImage.src = event.target.result;
            elements.enhancedImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }


    function initializeImageProcessing(imageSrc) {
        state.enhancedCanvas = new fabric.Canvas(null, {
            width: elements.originalImage.naturalWidth,
            height: elements.originalImage.naturalHeight
        });

        fabric.Image.fromURL(imageSrc, (img) => {
            state.currentImage = img;
            state.enhancedCanvas.add(state.currentImage);
            updateImage();
        });
    }

    function updateImage() {
        if (!state.currentImage) return;

        const filters = [
            new fabric.Image.filters.Brightness({
                brightness: elements.brightness.value / 100
            }),
            new fabric.Image.filters.Contrast({
                contrast: elements.contrast.value / 100
            }),
            new fabric.Image.filters.Saturation({
                saturation: elements.saturation.value
            }),
            new fabric.Image.filters.Convolute({
                matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0],
                opacity: elements.sharpness.value / 100
            })
        ];

        state.currentImage.filters = filters;
        state.currentImage.applyFilters();
        state.enhancedCanvas.renderAll();
        elements.enhancedImage.src = state.enhancedCanvas.toDataURL();
    }
function downloadImage() {
        if (!state.enhancedCanvas) return;
        
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        const scaleFactor = 2;
        
        tempCanvas.width = state.enhancedCanvas.width * scaleFactor;
        tempCanvas.height = state.enhancedCanvas.height * scaleFactor;
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(state.enhancedCanvas.getElement(), 0, 0);
        
        const link = document.createElement('a');
        link.download = `enhanced-image.${elements.formatSelect.value}`;
        link.href = tempCanvas.toDataURL(`image/${elements.formatSelect.value}`, 1.0);
        link.click();
    }

    function resetControls() {
        elements.brightness.value = 0;
        elements.contrast.value = 0;
        elements.saturation.value = 0;
        elements.sharpness.value = 0;
        state.rotationAngle = 0;
        updateImage();
    }

    function startDragging(e) {
        state.isDragging = true;
        document.body.style.cursor = 'col-resize';
    }
function handleDragging(e) {
        if (!state.isDragging) return;
        const rect = elements.enhancedImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const pos = Math.max(0, Math.min(100, percentage));
        
        elements.enhancedImage.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
        elements.slider.style.left = `${pos}%`;
    }

    function stopDragging() {
        state.isDragging = false;
        document.body.style.cursor = 'default';
    }
});
