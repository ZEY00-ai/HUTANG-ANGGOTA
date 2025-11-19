// Fungsi khusus untuk halaman detail anggota
function initializeMemberPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const memberName = currentPage.replace('.html', '');
    
    // Update data khusus anggota
    updateMemberData(memberName);
    
    // Setup event listeners untuk modal
    setupMemberModals(memberName);
    
    // Tampilkan riwayat hutang dan pembayaran anggota
    displayMemberDebts(memberName);
    displayMemberPayments(memberName);
}

// Fungsi untuk update data anggota
function updateMemberData(memberName) {
    const totalDebt = getTotalDebtByMember(memberName);
    const totalPaid = getTotalPaidByMember(memberName);
    const activeDebts = getActiveDebtsCount(memberName);
    
    // Update tampilan
    const totalDebtElement = document.querySelector('.total-debt');
    if (totalDebtElement) {
        totalDebtElement.textContent = formatRupiah(totalDebt);
    }
    
    // Update statistik
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 2) {
        statValues[0].textContent = activeDebts;
        statValues[1].textContent = formatRupiah(totalPaid);
    }
}

// Fungsi untuk mendapatkan jumlah hutang aktif
function getActiveDebtsCount(memberName) {
    return debts.filter(debt => debt.debtor === memberName && !debt.paid).length;
}

// Fungsi untuk mendapatkan total yang sudah dibayar
function getTotalPaidByMember(memberName) {
    return payments
        .filter(payment => payment.debtor === memberName)
        .reduce((total, payment) => total + parseInt(payment.amount), 0);
}

// Fungsi untuk menampilkan hutang anggota
function displayMemberDebts(memberName) {
    const debtsList = document.getElementById(`${memberName}-debts-list`);
    if (!debtsList) return;
    
    const memberDebts = debts.filter(debt => debt.debtor === memberName);
    
    if (memberDebts.length === 0) {
        debtsList.innerHTML = `
            <div class="empty-state">
                <p>Belum ada hutang yang tercatat untuk ${memberName.charAt(0).toUpperCase() + memberName.slice(1)}.</p>
            </div>
        `;
        return;
    }
    
    debtsList.innerHTML = '';
    
    memberDebts.forEach((debt, index) => {
        const debtElement = document.createElement('div');
        debtElement.className = `debt-item ${debt.paid ? 'paid' : 'unpaid'}`;
        debtElement.innerHTML = `
            <div class="debt-info">
                <h3>${formatRupiah(debt.amount)}</h3>
                <p>${debt.description || 'Tidak ada keterangan'}</p>
                <p class="debt-date">Tanggal: ${debt.date} ${debt.dueDate ? `| Jatuh tempo: ${debt.dueDate}` : ''}</p>
            </div>
            <div class="debt-amount">
                <p class="status ${debt.paid ? 'paid' : 'unpaid'}">${debt.paid ? 'Lunas' : 'Belum Lunas'}</p>
            </div>
            <div class="debt-actions">
                <button class="btn-action mark-paid" data-id="${debt.id}">${debt.paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}</button>
                <button class="btn-action delete-debt" data-id="${debt.id}">Hapus</button>
            </div>
        `;
        
        debtsList.appendChild(debtElement);
    });
    
    // Event listeners untuk aksi hutang
    debtsList.querySelectorAll('.mark-paid').forEach(button => {
        button.addEventListener('click', function() {
            const debtId = parseInt(this.getAttribute('data-id'));
            toggleDebtStatusById(debtId);
        });
    });
    
    debtsList.querySelectorAll('.delete-debt').forEach(button => {
        button.addEventListener('click', function() {
            const debtId = parseInt(this.getAttribute('data-id'));
            deleteDebtById(debtId);
        });
    });
}

// Fungsi untuk menampilkan pembayaran anggota
function displayMemberPayments(memberName) {
    const paymentsList = document.getElementById(`${memberName}-payments-list`);
    if (!paymentsList) return;
    
    const memberPayments = payments.filter(payment => payment.debtor === memberName);
    
    if (memberPayments.length === 0) {
        paymentsList.innerHTML = `
            <div class="empty-state">
                <p>Belum ada pembayaran yang tercatat untuk ${memberName.charAt(0).toUpperCase() + memberName.slice(1)}.</p>
            </div>
        `;
        return;
    }
    
    paymentsList.innerHTML = '';
    
    memberPayments.forEach((payment, index) => {
        const paymentElement = document.createElement('div');
        paymentElement.className = 'payment-item';
        paymentElement.innerHTML = `
            <div class="payment-info">
                <h3>${formatRupiah(payment.amount)}</h3>
                <p>Metode: ${payment.method} ${payment.note ? `| ${payment.note}` : ''}</p>
                <p class="payment-date">Tanggal: ${payment.date}</p>
            </div>
            <div class="payment-amount">
                <p class="amount">${formatRupiah(payment.amount)}</p>
            </div>
            <div class="payment-actions">
                <button class="btn-action delete-payment" data-id="${payment.id}">Hapus</button>
            </div>
        `;
        
        paymentsList.appendChild(paymentElement);
    });
    
    // Event listeners untuk aksi pembayaran
    paymentsList.querySelectorAll('.delete-payment').forEach(button => {
        button.addEventListener('click', function() {
            const paymentId = parseInt(this.getAttribute('data-id'));
            deletePaymentById(paymentId);
        });
    });
}

// Fungsi untuk setup modal di halaman anggota
function setupMemberModals(memberName) {
    // Modal tambah hutang
    const addDebtBtn = document.getElementById(`add-debt-${memberName}`);
    const debtModal = document.getElementById(`debt-modal-${memberName}`);
    const debtForm = document.getElementById(`debt-form-${memberName}`);
    const cancelDebtBtn = document.getElementById(`cancel-debt-${memberName}`);
    
    if (addDebtBtn && debtModal) {
        addDebtBtn.addEventListener('click', () => {
            debtModal.style.display = 'block';
        });
    }
    
    if (debtForm) {
        debtForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById(`amount-${memberName}`).value;
            const description = document.getElementById(`description-${memberName}`).value;
            const dueDate = document.getElementById(`due-date-${memberName}`).value;
            
            if (!amount) {
                alert('Jumlah hutang harus diisi!');
                return;
            }
            
            addDebt({
                debtor: memberName,
                amount,
                description,
                dueDate
            });
            
            // Update tampilan setelah menambah hutang
            updateMemberData(memberName);
            displayMemberDebts(memberName);
        });
    }
    
    if (cancelDebtBtn && debtModal) {
        cancelDebtBtn.addEventListener('click', () => {
            debtModal.style.display = 'none';
            debtForm.reset();
        });
    }
    
    // Modal tambah pembayaran
    const addPaymentBtn = document.getElementById(`add-payment-${memberName}`);
    const paymentModal = document.getElementById(`payment-modal-${memberName}`);
    const paymentForm = document.getElementById(`payment-form-${memberName}`);
    const cancelPaymentBtn = document.getElementById(`cancel-payment-${memberName}`);
    
    if (addPaymentBtn && paymentModal) {
        addPaymentBtn.addEventListener('click', () => {
            paymentModal.style.display = 'block';
        });
    }
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById(`payment-amount-${memberName}`).value;
            const date = document.getElementById(`payment-date-${memberName}`).value;
            const method = document.getElementById(`payment-method-${memberName}`).value;
            const note = document.getElementById(`payment-note-${memberName}`).value;
            
            if (!amount || !date) {
                alert('Jumlah pembayaran dan tanggal harus diisi!');
                return;
            }
            
            addPayment({
                debtor: memberName,
                amount,
                date,
                method,
                note
            });
            
            // Update tampilan setelah menambah pembayaran
            updateMemberData(memberName);
            displayMemberPayments(memberName);
        });
    }
    
    if (cancelPaymentBtn && paymentModal) {
        cancelPaymentBtn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            paymentForm.reset();
        });
    }
    
    // Close modal dengan tombol close
    document.querySelectorAll(`#debt-modal-${memberName} .close, #payment-modal-${memberName} .close`).forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal dengan klik di luar
    window.addEventListener('click', function(e) {
        if (e.target === debtModal) {
            debtModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
}

// Fungsi untuk toggle status hutang berdasarkan ID
function toggleDebtStatusById(debtId) {
    const debtIndex = debts.findIndex(debt => debt.id === debtId);
    if (debtIndex !== -1) {
        debts[debtIndex].paid = !debts[debtIndex].paid;
        saveData();
        
        const memberName = debts[debtIndex].debtor;
        updateMemberData(memberName);
        displayMemberDebts(memberName);
    }
}

// Fungsi untuk menghapus hutang berdasarkan ID
function deleteDebtById(debtId) {
    if (confirm('Apakah Anda yakin ingin menghapus hutang ini?')) {
        const debtIndex = debts.findIndex(debt => debt.id === debtId);
        if (debtIndex !== -1) {
            const memberName = debts[debtIndex].debtor;
            debts.splice(debtIndex, 1);
            saveData();
            
            updateMemberData(memberName);
            displayMemberDebts(memberName);
        }
    }
}

// Fungsi untuk menghapus pembayaran berdasarkan ID
function deletePaymentById(paymentId) {
    if (confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
        const paymentIndex = payments.findIndex(payment => payment.id === paymentId);
        if (paymentIndex !== -1) {
            const memberName = payments[paymentIndex].debtor;
            payments.splice(paymentIndex, 1);
            saveData();
            
            updateMemberData(memberName);
            displayMemberPayments(memberName);
        }
    }
}

// Inisialisasi halaman saat DOM siap
document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah kita berada di halaman detail anggota
    const currentPage = window.location.pathname.split('/').pop();
    const memberPages = ['daffa.html', 'rizky.html', 'omar.html', 'zaky.html', 'rozi.html'];
    
    if (memberPages.includes(currentPage)) {
        initializeMemberPage();
    }
});