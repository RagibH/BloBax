(function () {

    'use strict';



    const cropSection = document.getElementById('med-crop-section');

    const cropImage = document.getElementById('med-crop-image');

    const previewSection = document.getElementById('med-preview-section');

    const previewImage = document.getElementById('med-preview-image');

    const croppedInput = document.getElementById('med-cropped-input');

    const predictBtn = document.getElementById('med-predict-btn');

    const predictForm = document.getElementById('med-predict-form');

    const resultArea = document.getElementById('med-result-area');

    const scanOverlay = document.getElementById('med-scan-overlay');

    const fileInput = document.getElementById('med-file-input');

    const dropzone = document.getElementById('med-dropzone');

    const steps = document.querySelectorAll('.bx-med-step');



    let cropper = null;

    let cameraStream = null;



    function setActiveStep(stepNum) {

        steps.forEach((el) => {

            el.classList.toggle('active', el.dataset.step === String(stepNum));

        });

    }



    function stopCamera() {

        if (cameraStream) {

            cameraStream.getTracks().forEach((t) => t.stop());

            cameraStream = null;

        }

        const video = document.getElementById('med-video');

        if (video) video.srcObject = null;

    }



    function destroyCropper() {

        if (cropper) {

            cropper.destroy();

            cropper = null;

        }

    }



    function showCropSection() {

        cropSection.classList.remove('d-none');

        previewSection.classList.add('d-none');

        predictBtn.disabled = true;

        setActiveStep(2);

    }



    function initCropper(src) {

        destroyCropper();

        cropImage.src = src;

        showCropSection();



        cropImage.onload = function () {

            cropper = new Cropper(cropImage, {

                aspectRatio: NaN,

                viewMode: 1,

                dragMode: 'crop',

                autoCropArea: 0.85,

                responsive: true,

                background: false,

                guides: true,

                cropend: updatePreview,

            });

            setTimeout(updatePreview, 100);

        };

    }



    function canvasToBlob(canvas) {

        return new Promise((resolve) => {

            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);

        });

    }



    async function updatePreview() {

        if (!cropper) return;



        const canvas = cropper.getCroppedCanvas({

            width: 224,

            height: 224,

            imageSmoothingEnabled: true,

            imageSmoothingQuality: 'high',

        });



        if (!canvas) return;



        previewImage.src = canvas.toDataURL('image/jpeg', 0.92);

        previewSection.classList.remove('d-none');



        const blob = await canvasToBlob(canvas);

        const file = new File([blob], 'medicine_crop.jpg', { type: 'image/jpeg' });

        const dt = new DataTransfer();

        dt.items.add(file);

        croppedInput.files = dt.files;

        predictBtn.disabled = false;

        setActiveStep(2);

    }



    function loadImageFile(file) {

        if (!file || !file.type.startsWith('image/')) return;

        setActiveStep(1);

        const reader = new FileReader();

        reader.onload = (e) => initCropper(e.target.result);

        reader.readAsDataURL(file);

    }



    function confTagLabel(level) {

        if (level === 'high') return 'High confidence';

        if (level === 'low') return 'Low confidence';

        return 'Medium confidence';

    }



    function renderResult(data) {

        if (!data) return;



        if (data.error) {

            resultArea.innerHTML = `<div class="bx-med-error bx-reveal"><i class="fas fa-circle-exclamation me-2"></i>${escapeHtml(data.error)}</div>`;

            animateIn(resultArea.firstElementChild);

            return;

        }



        setActiveStep(3);



        const level = data.confidence_level || 'medium';

        const topItems = (data.top_predictions || [])

            .slice(0, 5)

            .map((item, i) => `

                <div class="bx-med-top-item${i === 0 ? ' bx-med-top-item--first' : ''}" data-rank="${i + 1}">

                    <span class="bx-med-top-rank">${i + 1}</span>

                    <div class="bx-med-top-info">

                        <strong>${escapeHtml(item.medicine)}</strong>

                    </div>

                    <span class="bx-med-top-pct">${item.probability}%</span>

                </div>`)

            .join('');



        resultArea.innerHTML = `

            <div class="bx-med-result bx-med-result--${level} bx-reveal">

                <div class="bx-med-result-glow"></div>

                <div class="bx-med-result-top">

                    <div class="bx-med-result-icon"><i class="fas fa-capsules"></i></div>

                    <div>

                        <h3 class="bx-med-result-name">${escapeHtml(data.medicine || data.label)}</h3>

                        <span class="bx-med-conf-tag bx-med-conf-tag--${level}">

                            <i class="fas fa-signal"></i> ${confTagLabel(level)}

                        </span>

                    </div>

                </div>

                <div class="bx-med-confidence">

                    <div class="bx-med-conf-label">

                        <span>Confidence</span>

                        <span id="med-conf-pct">0%</span>

                    </div>

                    <div class="bx-med-conf-bar">

                        <div class="bx-med-conf-fill" id="med-conf-fill"></div>

                    </div>

                </div>

                <div class="bx-med-top-list">

                    <h6>Top matches</h6>

                    ${topItems}

                </div>

            </div>`;



        const card = resultArea.firstElementChild;

        animateIn(card);

        animateTopItems(card);

        animateConfidence(data.probability || 0);

    }



    function escapeHtml(str) {

        const d = document.createElement('div');

        d.textContent = str;

        return d.innerHTML;

    }



    function animateIn(el) {

        if (typeof gsap !== 'undefined' && el) {

            gsap.fromTo(

                el,

                { opacity: 0, y: 28, scale: 0.96 },

                { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' }

            );

        }

    }



    function animateTopItems(card) {

        const items = card.querySelectorAll('.bx-med-top-item');

        items.forEach((item, i) => {

            setTimeout(() => {

                item.classList.add('is-visible');

                if (typeof gsap !== 'undefined') {

                    gsap.fromTo(

                        item,

                        { opacity: 0, x: -16 },

                        { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' }

                    );

                }

            }, 180 + i * 90);

        });

    }



    function animateConfidence(target) {

        requestAnimationFrame(() => {

            const fill = document.getElementById('med-conf-fill');

            const pct = document.getElementById('med-conf-pct');

            if (fill) fill.style.width = target + '%';

            if (!pct) return;



            if (typeof gsap === 'undefined') {

                pct.textContent = target + '%';

                return;

            }

            const obj = { val: 0 };

            gsap.to(obj, {

                val: target,

                duration: 1.2,

                ease: 'power2.out',

                onUpdate: () => { pct.textContent = obj.val.toFixed(1) + '%'; },

            });

        });

    }



    document.querySelectorAll('.bx-med-tab').forEach((tab) => {

        tab.addEventListener('click', () => {

            document.querySelectorAll('.bx-med-tab').forEach((t) => t.classList.remove('active'));

            tab.classList.add('active');

            const mode = tab.dataset.mode;

            document.getElementById('panel-upload').classList.toggle('d-none', mode !== 'upload');

            document.getElementById('panel-camera').classList.toggle('d-none', mode !== 'camera');

            if (mode !== 'camera') stopCamera();

        });

    });



    fileInput.addEventListener('change', (e) => {

        if (e.target.files[0]) loadImageFile(e.target.files[0]);

    });



    dropzone.addEventListener('dragover', (e) => {

        e.preventDefault();

        dropzone.classList.add('dragover');

    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {

        e.preventDefault();

        dropzone.classList.remove('dragover');

        if (e.dataTransfer.files[0]) loadImageFile(e.dataTransfer.files[0]);

    });



    document.getElementById('med-start-camera').addEventListener('click', async () => {

        try {

            stopCamera();

            setActiveStep(1);

            cameraStream = await navigator.mediaDevices.getUserMedia({

                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },

                audio: false,

            });

            const video = document.getElementById('med-video');

            video.srcObject = cameraStream;

            document.getElementById('med-start-camera').classList.add('d-none');

            document.getElementById('med-snap-photo').classList.remove('d-none');

        } catch (err) {

            alert('Could not access camera. Please allow camera permission or use upload instead.');

        }

    });



    document.getElementById('med-snap-photo').addEventListener('click', () => {

        const video = document.getElementById('med-video');

        const canvas = document.getElementById('med-capture-canvas');

        canvas.width = video.videoWidth;

        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);

        stopCamera();

        document.getElementById('med-start-camera').classList.remove('d-none');

        document.getElementById('med-snap-photo').classList.add('d-none');

        initCropper(canvas.toDataURL('image/jpeg', 0.92));

        document.querySelector('.bx-med-tab[data-mode="upload"]').click();

    });



    document.getElementById('med-reset-crop').addEventListener('click', () => {

        if (cropper) cropper.reset();

        updatePreview();

    });



    document.getElementById('med-change-image').addEventListener('click', () => {

        destroyCropper();

        cropSection.classList.add('d-none');

        previewSection.classList.add('d-none');

        predictBtn.disabled = true;

        fileInput.value = '';

        croppedInput.value = '';

        setActiveStep(1);

    });



    predictForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        if (!croppedInput.files.length) return;



        scanOverlay.classList.remove('d-none');

        predictBtn.disabled = true;

        predictBtn.querySelector('.bx-med-btn-text').classList.add('d-none');

        predictBtn.querySelector('.bx-med-btn-loading').classList.remove('d-none');



        const formData = new FormData(predictForm);



        try {

            const res = await fetch(window.location.href, {

                method: 'POST',

                headers: { 'X-Requested-With': 'XMLHttpRequest' },

                body: formData,

            });

            const data = await res.json();

            renderResult(data);

            resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {

            renderResult({ error: 'Something went wrong. Please try again.' });

        } finally {

            scanOverlay.classList.add('d-none');

            predictBtn.disabled = false;

            predictBtn.querySelector('.bx-med-btn-text').classList.remove('d-none');

            predictBtn.querySelector('.bx-med-btn-loading').classList.add('d-none');

        }

    });



    const initEl = document.getElementById('med-init-result');

    if (initEl) {

        try {

            renderResult(JSON.parse(initEl.textContent));

        } catch (_) { /* ignore */ }

    }



    setActiveStep(1);

    window.addEventListener('beforeunload', stopCamera);

})();

