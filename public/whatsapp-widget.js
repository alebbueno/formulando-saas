(function () {
    // 1. Initialize
    const currentScript = document.currentScript;
    const workspaceId = currentScript.getAttribute('data-workspace');

    // Config: Base URL auto-detected from script src
    const scriptSrc = currentScript.src;
    const baseUrl = new URL(scriptSrc).origin;
    const API_CONFIG_URL = `${baseUrl}/api/widgets/whatsapp`;
    const API_CAPTURE_URL = `${baseUrl}/api/leads/whatsapp`;

    if (!workspaceId) {
        console.error('Formulando WhatsApp Widget: workspace_id not provided.');
        return;
    }

    // 2. Fetch Configuration
    fetch(`${API_CONFIG_URL}?workspace_id=${workspaceId}`)
        .then(res => res.json())
        .then(config => {
            if (!config || !config.is_active) {
                // Widget disabled
                return;
            }
            initWidget(config);
        })
        .catch(err => console.error('Error loading widget config:', err));


    // 3. Render Widget (Shadow DOM)
    function initWidget(config) {
        const container = document.createElement('div');
        container.id = 'formulando-whatsapp-widget';
        document.body.appendChild(container);

        // Using Shadow DOM to isolate styles
        const shadow = container.attachShadow({ mode: 'open' });

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                z-index: 99999;
                position: fixed;
                ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
                bottom: 20px;
                display: flex;
                flex-direction: column;
                align-items: ${config.position === 'bottom-left' ? 'flex-start' : 'flex-end'};
            }
            
            /* Button */
            .fab-button {
                background-color: ${config.button_color || '#25D366'};
                color: white;
                border: none;
                border-radius: 50px;
                padding: ${config.button_text ? '12px 24px' : '12px'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                cursor: pointer;
                font-weight: 600;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .fab-button:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 16px rgba(0,0,0,0.2);
            }
            .fab-button:active {
                transform: scale(0.95);
            }
            
            .fab-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
                background: white;
            }

            /* Modal */
            .widget-modal {
                background: white;
                width: 320px;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.12);
                overflow: hidden;
                margin-bottom: 16px;
                opacity: 0;
                transform: translateY(20px);
                pointer-events: none;
                transition: opacity 0.3s, transform 0.3s;
                position: absolute;
                bottom: 60px;
                ${config.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
            }
            .widget-modal.open {
                opacity: 1;
                transform: translateY(0);
                pointer-events: auto;
            }

            .modal-header {
                background-color: ${config.button_color || '#25D366'};
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .modal-title {
                font-weight: 600;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .close-btn {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
                padding: 0;
                line-height: 1;
                opacity: 0.8;
            }
            .close-btn:hover { opacity: 1; }

            .modal-body {
                padding: 20px;
            }
            .modal-desc {
                font-size: 13px;
                color: #666;
                margin-bottom: 16px;
                line-height: 1.4;
            }

            .form-group {
                margin-bottom: 12px;
            }
            .form-label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                color: #333;
                margin-bottom: 4px;
            }
            .form-input {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s;
            }
            .form-input:focus {
                border-color: ${config.button_color || '#25D366'};
            }

            .submit-btn {
                width: 100%;
                background-color: ${config.button_color || '#25D366'};
                color: white;
                border: none;
                padding: 10px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                margin-top: 8px;
            }
            .submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            /* Icons */
            svg { fill: currentColor; }
        `;
        shadow.appendChild(style);

        // HTML Structure
        const wrapper = document.createElement('div');

        // Modal HTML
        const modal = document.createElement('div');
        modal.className = 'widget-modal';

        // Fields Generation
        const fieldsHtml = (config.fields_config || [])
            .sort((a, b) => a.order - b.order)
            .map(field => `
                <div class="form-group">
                    <label class="form-label">${field.label}</label>
                    <input 
                        class="form-input" 
                        type="${field.type}" 
                        name="${field.name}" 
                        placeholder="${field.placeholder || ''}"
                        ${field.required ? 'required' : ''}
                    >
                </div>
            `).join('');

        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            Fale Conosco
                </div>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p class="modal-desc">Preencha seus dados para iniciar o atendimento no WhatsApp.</p>
                <form id="widget-form">
                    ${fieldsHtml}
                    <button type="submit" class="submit-btn" id="submit-btn">Iniciar Conversa</button>
                </form>
            </div>
        `;

        // SVGs
        const icons = {
            whatsapp: '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
            message: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
            phone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
        };

        const iconSvg = icons[config.button_icon || 'whatsapp'] || icons.whatsapp;

        const button = document.createElement('button');
        button.className = 'fab-button';

        // Icon/Avatar Logic
        let renderIcon = iconSvg;
        if (config.icon_type === 'avatar' && config.avatar_url) {
            renderIcon = `<img src="${config.avatar_url}" class="fab-avatar" alt="Avatar" />`;
        }

        button.innerHTML = `
            ${renderIcon}
            ${config.button_text ? `<span>${config.button_text}</span>` : ''}
        `;

        wrapper.appendChild(modal);
        wrapper.appendChild(button);
        shadow.appendChild(wrapper);

        // State & Logic
        let isOpen = false;

        function toggle() {
            isOpen = !isOpen;
            if (isOpen) {
                modal.classList.add('open');
            } else {
                modal.classList.remove('open');
            }
        }

        button.addEventListener('click', toggle);
        modal.querySelector('.close-btn').addEventListener('click', toggle);

        const form = modal.querySelector('#widget-form');

        // Phone Mask Logic
        const phoneInput = form.querySelector('input[name="phone"]') || form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, "");
                // Max length for (XX) XXXXX-XXXX is 11 digits + formatting
                if (v.length > 11) v = v.slice(0, 11);

                // Apply mask
                if (v.length > 2) {
                    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
                }
                if (v.length > 7) { // (XX) X...
                    // Mobile 9 digits + 2 area = 11. Format: (XX) XXXXX-XXXX
                    // Landline 8 digits + 2 area = 10. Format: (XX) XXXX-XXXX
                    // Let's assume dynamic behavior
                    if (v.length > 14) { // Including formatting chars
                        v = v.replace(/(\d{5})(\d{4})$/, "$1-$2");
                    } else {
                        // Temporary invalid state or typing
                    }
                }

                // Simpler regex replace that handles both well enough for simple mask
                // Re-calculating from raw digits
                let raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                if (raw.length > 2) {
                    raw = raw.replace(/^(\d{2})(\d)/, "($1) $2");
                }
                if (raw.length > 9) { // 10 or 11 digits
                    // If 11 digits (mobile): (XX) XXXXX-XXXX
                    // If 10 digits (landline): (XX) XXXX-XXXX
                    // Straight replace for trailing part
                    if (raw.length > 14) { // (XX) XXXXX-XXXX -> 15 chars
                        // Already formatted
                    } else {
                        // Simple logic: last 4 digits are suffix
                        raw = raw.replace(/(\d)(\d{4})$/, "$1-$2");
                    }
                }
                e.target.value = raw;
            });
            // Better simpler version for the tool
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = modal.querySelector('#submit-btn');
            const originalBtnText = submitBtn.textContent;

            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            try {
                const res = await fetch(API_CAPTURE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workspace_id: workspaceId,
                        data: data
                    })
                });

                const result = await res.json();

                if (result.success && result.redirect_url) {
                    // Success! Redirect to WhatsApp
                    window.location.href = result.redirect_url;
                } else {
                    alert('Erro ao processar envio.');
                }
            } catch (err) {
                console.error('Submission error:', err);
                alert('Ocorreu um erro. Tente novamente.');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

})();
