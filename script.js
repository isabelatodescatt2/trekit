document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.querySelector('.btn-remove-image');
    const form = document.getElementById('trilhaForm');
    const locationInput = document.getElementById('trilhaLocation');
    const mapView = document.getElementById('mapView');
    const mapPlaceholder = document.getElementById('mapPlaceholder');
    
    // Drag and drop functionality
    const uploadContainer = document.querySelector('.image-upload-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadContainer.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadContainer.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadContainer.classList.remove('highlight');
    }
    
    uploadContainer.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        imageUpload.files = files;
        handleFiles(files);
    }
    
    // Handle file selection
    imageUpload.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Criar elemento de imagem
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = "Imagem da trilha";
                img.classList.add('img-fluid');
                
                // Esconder o placeholder
                const uploadPlaceholder = document.getElementById('uploadPlaceholder');
                uploadPlaceholder.classList.add('d-none');
                
                // Adicionar a imagem ao container
                const uploadContainer = document.querySelector('.image-upload-container');
                uploadContainer.appendChild(img);
                uploadContainer.classList.add('has-image');
                
                // Mostrar botão de remover
                imagePreview.classList.remove('d-none');
            }
            
            reader.readAsDataURL(file);
        }
    }
}
    
    // Remove image functionality
    removeImageBtn.addEventListener('click', function() {
        const uploadContainer = document.querySelector('.image-upload-container');
        const img = uploadContainer.querySelector('img');
        
        if (img) {
            img.remove();
        }
        
        uploadContainer.classList.remove('has-image');
        const uploadPlaceholder = document.querySelector('.image-upload-placeholder');
        uploadPlaceholder.classList.remove('d-none');
        
        imagePreview.classList.add('d-none');
        imageUpload.value = '';
    });
    
    // Mapa functionality - atualização do mapa quando o link é inserido
    let debounceTimer;
    locationInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateMapView(this.value);
        }, 800);
    });
    
    function updateMapView(url) {
        if (isValidGoogleMapsUrl(url)) {
            try {
                // Mostrar indicador de carregamento
                mapPlaceholder.innerHTML = '<i class="bi bi-hourglass"></i><p>Carregando mapa...</p>';
                mapPlaceholder.classList.remove('d-none');
                mapView.classList.add('d-none');
                
                // Solução simplificada - usar o URL diretamente com output=embed
                let embedUrl = url;
                
                // Adicionar parâmetro de embed se não tiver
                if (!embedUrl.includes('output=embed')) {
                    embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'output=embed';
                }
                
                // Forçar visualização de mapa (evitar modo street view)
                if (!embedUrl.includes('map_mode=map')) {
                    embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'map_mode=map';
                }
                
                mapView.src = embedUrl;
                mapView.onload = function() {
                    mapView.classList.remove('d-none');
                    mapPlaceholder.classList.add('d-none');
                    locationInput.classList.remove('is-invalid');
                };
                
                mapView.onerror = function() {
                    showMapError();
                };
                
            } catch (error) {
                console.error('Erro ao carregar mapa:', error);
                showMapError();
            }
        } else {
            resetMapView();
            
            if (url && !isValidGoogleMapsUrl(url)) {
                locationInput.classList.add('is-invalid');
            } else {
                locationInput.classList.remove('is-invalid');
            }
        }
    }
    
    function showMapError() {
        mapView.src = '';
        mapView.classList.add('d-none');
        mapPlaceholder.classList.remove('d-none');
        mapPlaceholder.innerHTML = '<i class="bi bi-exclamation-triangle"></i><p>Não foi possível carregar o mapa. Tente um link diferente.</p>';
        locationInput.classList.add('is-invalid');
    }
    
    function resetMapView() {
        mapView.src = '';
        mapView.classList.add('d-none');
        mapPlaceholder.classList.remove('d-none');
        mapPlaceholder.innerHTML = '<i class="bi bi-map"></i><p>Visualização do mapa aparecerá aqui</p>';
    }
    
    function isValidGoogleMapsUrl(url) {
        if (!url) return false;
        
        // Padrões comuns de URLs do Google Maps
        const patterns = [
            /https?:\/\/(www\.)?google\.[a-z]+\/maps/,
            /https?:\/\/goo\.gl\/maps/,
            /https?:\/\/maps\.app\.goo\.gl/,
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar URL do mapa
        const locationValue = locationInput.value.trim();
        if (locationValue && !isValidGoogleMapsUrl(locationValue)) {
            locationInput.classList.add('is-invalid');
            alert('Por favor, insira um link válido do Google Maps.');
            return;
        }
        
        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        if (valid) {
            // Here you would typically send the data to a server
            alert('Trilha publicada com sucesso!');
            form.reset();
            imagePreview.classList.add('d-none');
            if (imagePreview.querySelector('img')) {
                imagePreview.querySelector('img').remove();
            }
            // Resetar o mapa também
            resetMapView();
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });
    
    // Remove validation styles when user starts typing
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
});