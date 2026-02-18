/* ============================================================ */
/* SICANTING CUSTOM ALERT - JavaScript Library                  */
/* Versi: 1.0.0 | Tema: #1fa3b7 / #0d7c8a                     */
/*                                                              */
/* Cara Pakai:                                                  */
/*   <link rel="stylesheet" href="sicanting-alert.css">         */
/*   <script src="sicanting-alert.js"></script>                 */
/*                                                              */
/* API:                                                         */
/*   SCA.toast({ type, title, message, duration, position })   */
/*   SCA.alert({ type, title, message }, target)               */
/*   SCA.dialog({ type, title, message, confirm, cancel })     */
/*     .then(result => { if(result) { ... } })                  */
/*   SCA.loading({ title, message })                           */
/*   SCA.close()                                                */
/* ============================================================ */

const SCA = (() => {

    // --------------------------------------------------------
    // CONFIG DEFAULT
    // --------------------------------------------------------
    const ICONS = {
        primary : 'bi bi-info-circle-fill',
        success : 'bi bi-check-circle-fill',
        warning : 'bi bi-exclamation-triangle-fill',
        danger  : 'bi bi-x-circle-fill',
        info    : 'bi bi-info-circle-fill',
        dark    : 'bi bi-moon-fill',
        light   : 'bi bi-sun-fill',
        loading : 'bi bi-arrow-repeat',
    };

    const TITLES = {
        primary : 'Informasi',
        success : 'Berhasil!',
        warning : 'Peringatan!',
        danger  : 'Gagal!',
        info    : 'Informasi',
        dark    : 'Perhatian',
        light   : 'Catatan',
    };

    let _toastContainer = null;
    let _overlayEl = null;
    let _dialogResolve = null;

    // --------------------------------------------------------
    // HELPER: Buat atau ambil toast container
    // --------------------------------------------------------
    function _getContainer(position) {
        position = position || 'top-right';

        // Hapus container lama jika posisi berubah
        if (_toastContainer && !_toastContainer.classList.contains(position)) {
            _toastContainer = null;
        }

        if (!_toastContainer) {
            _toastContainer = document.createElement('div');
            _toastContainer.className = `sca-toast-container ${position}`;
            document.body.appendChild(_toastContainer);
        }

        return _toastContainer;
    }

    // --------------------------------------------------------
    // HELPER: Hapus element dengan animasi
    // --------------------------------------------------------
    function _removeWithAnim(el, className, duration) {
        el.classList.add(className);
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, duration || 350);
    }

    // --------------------------------------------------------
    // 1. TOAST - Notifikasi pojok layar
    // --------------------------------------------------------
    function toast(opts) {
        opts = Object.assign({
            type     : 'primary',
            title    : '',
            message  : '',
            duration : 4000,
            position : 'top-right',
            closable : true,
        }, opts);

        if (!opts.title) opts.title = TITLES[opts.type] || 'Notifikasi';

        const container = _getContainer(opts.position);

        const el = document.createElement('div');
        el.className = `sca-toast ${opts.type}`;
        el.style.setProperty('--duration', (opts.duration / 1000) + 's');

        el.innerHTML = `
            <div class="sca-toast-icon">
                <i class="${opts.icon || ICONS[opts.type] || ICONS.primary}"></i>
            </div>
            <div class="sca-toast-content">
                <div class="sca-toast-title">${opts.title}</div>
                ${opts.message ? `<div class="sca-toast-message">${opts.message}</div>` : ''}
            </div>
            ${opts.closable ? `<button class="sca-toast-close"><i class="bi bi-x"></i></button>` : ''}
        `;

        // Klik toast atau tombol close → tutup
        el.addEventListener('click', () => _removeWithAnim(el, 'hiding', 350));

        container.appendChild(el);

        // Auto-tutup
        if (opts.duration > 0) {
            setTimeout(() => {
                if (el.parentNode) _removeWithAnim(el, 'hiding', 350);
            }, opts.duration);
        }

        return el;
    }

    // --------------------------------------------------------
    // 2. ALERT BANNER - Inline di dalam halaman
    // --------------------------------------------------------
    function alert(opts, targetSelector) {
        opts = Object.assign({
            type      : 'info',
            title     : '',
            message   : '',
            dismissible: true,
        }, opts);

        if (!opts.title) opts.title = TITLES[opts.type] || 'Info';

        const el = document.createElement('div');
        el.className = `sca-alert ${opts.type}`;

        el.innerHTML = `
            <div class="sca-alert-icon">
                <i class="${opts.icon || ICONS[opts.type] || ICONS.info}"></i>
            </div>
            <div class="sca-alert-content">
                <div class="sca-alert-title">${opts.title}</div>
                ${opts.message ? `<div class="sca-alert-message">${opts.message}</div>` : ''}
            </div>
            ${opts.dismissible ? `<button class="sca-alert-close"><i class="bi bi-x"></i></button>` : ''}
        `;

        // Tombol close
        if (opts.dismissible) {
            el.querySelector('.sca-alert-close').addEventListener('click', () => {
                _removeWithAnim(el, 'dismissing', 300);
            });
        }

        // Masukkan ke target
        const target = targetSelector
            ? (typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector)
            : document.body;

        if (target) target.prepend(el);

        return el;
    }

    // --------------------------------------------------------
    // 3. DIALOG - Modal konfirmasi dengan Promise
    // --------------------------------------------------------
    function dialog(opts) {
        opts = Object.assign({
            type           : 'primary',
            title          : 'Konfirmasi',
            message        : 'Apakah Anda yakin?',
            confirmText    : 'Ya, Lanjutkan',
            cancelText     : 'Batal',
            confirmType    : '',
            showCancel     : true,
            icon           : '',
        }, opts);

        // Tentukan tipe tombol konfirmasi
        const confirmBtnType = opts.confirmType || opts.type;

        return new Promise((resolve) => {
            _dialogResolve = resolve;

            // Hapus overlay lama jika ada
            if (_overlayEl) {
                _overlayEl.remove();
                _overlayEl = null;
            }

            _overlayEl = document.createElement('div');
            _overlayEl.className = 'sca-overlay';

            _overlayEl.innerHTML = `
                <div class="sca-dialog">
                    <div class="sca-dialog-icon ${opts.type} sca-icon-${opts.type}">
                        <i class="${opts.icon || ICONS[opts.type] || ICONS.primary}"></i>
                    </div>
                    <div class="sca-dialog-title">${opts.title}</div>
                    <div class="sca-dialog-message">${opts.message}</div>
                    <div class="sca-dialog-actions">
                        ${opts.showCancel ? `<button class="sca-btn cancel" data-action="cancel"><i class="bi bi-x-lg"></i> ${opts.cancelText}</button>` : ''}
                        <button class="sca-btn ${confirmBtnType}" data-action="confirm">
                            <i class="${opts.icon || ICONS[opts.type]}"></i> ${opts.confirmText}
                        </button>
                    </div>
                </div>
            `;

            // Event klik tombol
            _overlayEl.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action === 'confirm') {
                    _closeDialog(true);
                } else if (action === 'cancel') {
                    _closeDialog(false);
                }
                // Klik overlay luar → tutup
                if (e.target === _overlayEl) _closeDialog(false);
            });

            document.body.appendChild(_overlayEl);
        });
    }

    function _closeDialog(result) {
        if (!_overlayEl) return;
        _overlayEl.classList.add('hiding');
        setTimeout(() => {
            if (_overlayEl && _overlayEl.parentNode) {
                _overlayEl.parentNode.removeChild(_overlayEl);
            }
            _overlayEl = null;
        }, 300);
        if (_dialogResolve) {
            _dialogResolve(result);
            _dialogResolve = null;
        }
    }

    // --------------------------------------------------------
    // 4. LOADING - Dialog loading dengan dots animasi
    // --------------------------------------------------------
    function loading(opts) {
        opts = Object.assign({
            title   : 'Memproses...',
            message : 'Mohon tunggu sebentar',
        }, opts);

        if (_overlayEl) {
            _overlayEl.remove();
            _overlayEl = null;
        }

        _overlayEl = document.createElement('div');
        _overlayEl.className = 'sca-overlay';

        _overlayEl.innerHTML = `
            <div class="sca-dialog loading">
                <div class="sca-dialog-icon primary">
                    <i class="bi bi-arrow-repeat"></i>
                </div>
                <div class="sca-dialog-title">${opts.title}</div>
                <div class="sca-dialog-message">${opts.message}</div>
                <div class="sca-loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;

        document.body.appendChild(_overlayEl);
        return _overlayEl;
    }

    // --------------------------------------------------------
    // 5. CLOSE - Tutup dialog/loading yang aktif
    // --------------------------------------------------------
    function close() {
        _closeDialog(null);
    }

    // --------------------------------------------------------
    // 6. SHORTHAND METHODS
    // --------------------------------------------------------
    function success(title, message, isToast) {
        if (isToast) return toast({ type: 'success', title, message });
        return dialog({ type: 'success', title, message, confirmText: 'OK', showCancel: false });
    }

    function error(title, message, isToast) {
        if (isToast) return toast({ type: 'danger', title, message });
        return dialog({ type: 'danger', title, message, confirmText: 'OK', showCancel: false });
    }

    function warning(title, message, isToast) {
        if (isToast) return toast({ type: 'warning', title, message });
        return dialog({ type: 'warning', title, message, confirmText: 'OK', showCancel: false });
    }

    function info(title, message, isToast) {
        if (isToast) return toast({ type: 'info', title, message });
        return dialog({ type: 'info', title, message, confirmText: 'OK', showCancel: false });
    }

    function confirm(title, message, opts) {
        return dialog(Object.assign({
            type        : 'warning',
            title,
            message,
            confirmText : 'Ya, Lanjutkan',
            cancelText  : 'Batal',
            showCancel  : true,
        }, opts));
    }

    function deleteConfirm(itemName) {
        return dialog({
            type        : 'danger',
            title       : 'Hapus Data?',
            message     : `Anda yakin ingin menghapus <strong>${itemName}</strong>?<br><small style="color:#999">Data yang dihapus tidak dapat dikembalikan.</small>`,
            confirmText : 'Ya, Hapus',
            cancelText  : 'Batal',
            showCancel  : true,
        });
    }

    // --------------------------------------------------------
    // PUBLIC API
    // --------------------------------------------------------
    return {
        toast,
        alert,
        dialog,
        loading,
        close,
        success,
        error,
        warning,
        info,
        confirm,
        deleteConfirm,
    };

})();
