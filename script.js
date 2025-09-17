document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const mainImageContainer = document.getElementById('mainImageContainer');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const additionalImagesContainer = document.getElementById('additionalImagesContainer');
    const additionalImages = document.getElementById('additionalImages');
    const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');
    const form = document.getElementById('trilhaForm');
    const locationInput = document.getElementById('trilhaLocation');
    const mapView = document.getElementById('mapView');
    const mapPlaceholder = document.getElementById('mapPlaceholder');
    
    // Array para armazenar as imagens
    let mainImage = null;
    let additionalImagesList = [];
    
    // Inicializar eventos de drag and drop
    function initDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            mainImageContainer.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            mainImageContainer.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            mainImageContainer.addEventListener(eventName, unhighlight, false);
        });
        
        mainImageContainer.addEventListener('drop', handleDrop, false);
    }
    
    // CORREÇÃO: Remover a inicialização duplicada de eventos de clique
    // O evento já está sendo tratado pelo label com for="imageUpload"
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        mainImageContainer.classList.add('highlight');
    }
    
    function unhighlight() {
        mainImageContainer.classList.remove('highlight');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleMainImage(files[0]);
        }
    }
    
    // Handle file selection
    imageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleMainImage(this.files[0]);
        }
    });
    
    function handleMainImage(file) {
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Se já existe uma imagem principal, movê-la para adicionais
                if (mainImage) {
                    moveMainImageToAdditional();
                }
                
                // Definir nova imagem principal
                mainImage = {
                    file: file,
                    dataUrl: e.target.result
                };
                
                // Atualizar a visualização
                updateMainImagePreview();
                
                // Mostrar botão para adicionar mais imagens
                addMoreImagesBtn.classList.remove('d-none');
            }
            
            reader.readAsDataURL(file);
        }
    }
    
    function moveMainImageToAdditional() {
        if (mainImage) {
            additionalImagesList.unshift(mainImage);
            mainImage = null;
            updateAdditionalImagesPreview();
        }
    }
    
    function updateMainImagePreview() {
        // Limpar o container
        mainImageContainer.innerHTML = '';
        
        // Criar elemento de preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'image-preview';
        
        const img = document.createElement('img');
        img.src = mainImage.dataUrl;
        img.alt = "Imagem principal da trilha";
        
        // Botão para remover a imagem
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove-main-image';
        removeBtn.innerHTML = '<i class="bi bi-x-circle"></i> Remover';
        removeBtn.onclick = removeMainImage;
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeBtn);
        mainImageContainer.appendChild(previewDiv);
    }
    
    function removeMainImage() {
        // Se houver imagens adicionais, mover a primeira para principal
        if (additionalImagesList.length > 0) {
            mainImage = additionalImagesList.shift();
            updateMainImagePreview();
            updateAdditionalImagesPreview();
        } else {
            // Se não houver imagens adicionais, resetar para o placeholder
            mainImage = null;
            resetMainImageContainer();
            addMoreImagesBtn.classList.add('d-none');
        }
    }
    
    function resetMainImageContainer() {
        mainImageContainer.innerHTML = '';
        
        // Recriar o input file e label
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'imageUpload';
        input.accept = 'image/*';
        input.className = 'd-none';
        
        const label = document.createElement('label');
        label.htmlFor = 'imageUpload';
        label.className = 'image-upload-label';
        
        // Clonar o placeholder original
        const placeholderClone = uploadPlaceholder.cloneNode(true);
        label.appendChild(placeholderClone);
        
        mainImageContainer.appendChild(input);
        mainImageContainer.appendChild(label);
        
        // Re-atachar o event listener
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleMainImage(this.files[0]);
            }
        });
        
        // Re-inicializar eventos de drag and drop
        initDragAndDrop();
    }
    
    function updateAdditionalImagesPreview() {
        // Limpar o container
        additionalImages.innerHTML = '';
        
        // Adicionar cada imagem adicional
        additionalImagesList.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'additional-image-item position-relative';
            
            const img = document.createElement('img');
            img.src = image.dataUrl;
            img.alt = "Imagem adicional da trilha";
            img.className = 'w-100 h-100';
            
            // Botão para remover imagem individual
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-danger btn-sm position-absolute top-0 end-0 m-1';
            removeBtn.innerHTML = '<i class="bi bi-x"></i>';
            removeBtn.style.width = '24px';
            removeBtn.style.height = '24px';
            removeBtn.style.padding = '0';
            removeBtn.style.borderRadius = '50%';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeAdditionalImage(index);
            };
            
            imageItem.appendChild(img);
            imageItem.appendChild(removeBtn);
            additionalImages.appendChild(imageItem);
        });
        
        // Mostrar/ocultar container de imagens adicionais
        if (additionalImagesList.length > 0) {
            additionalImagesContainer.classList.remove('d-none');
        } else {
            additionalImagesContainer.classList.add('d-none');
        }
    }
    
    function removeAdditionalImage(index) {
        // Remover a imagem do array
        additionalImagesList.splice(index, 1);
        
        // Atualizar a visualização
        updateAdditionalImagesPreview();
    }
    
    // Botão para adicionar mais imagens
    addMoreImagesBtn.addEventListener('click', function() {
        // Criar um input file temporário
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = 'image/*';
        tempInput.multiple = true;
        
        tempInput.onchange = function() {
            if (this.files.length > 0) {
                Array.from(this.files).forEach(file => {
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            // Adicionar à lista de imagens adicionais
                            additionalImagesList.push({
                                file: file,
                                dataUrl: e.target.result
                            });
                            
                            // Atualizar a visualização
                            updateAdditionalImagesPreview();
                        }
                        
                        reader.readAsDataURL(file);
                    }
                });
            }
        };
        
        tempInput.click();
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
        
        // Validar se pelo menos uma imagem foi selecionada
        if (!mainImage) {
            alert('Por favor, adicione pelo menos uma imagem da trilha.');
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
            // Aqui você normalmente enviaria os dados para um servidor
            // Incluindo a imagem principal e as adicionais
            const allImages = [mainImage, ...additionalImagesList];
            console.log('Imagens a serem enviadas:', allImages.length);
            
            alert('Trilha publicada com sucesso!');
            form.reset();
            resetImages();
            // Resetar o mapa também
            resetMapView();
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });
    
    function resetImages() {
        mainImage = null;
        additionalImagesList = [];
        resetMainImageContainer();
        additionalImagesContainer.classList.add('d-none');
        additionalImages.innerHTML = '';
        addMoreImagesBtn.classList.add('d-none');
    }
    
    // Remove validation styles when user starts typing
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Inicializar eventos
    initDragAndDrop();
});