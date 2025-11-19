// Data aplikasi
let debts = JSON.parse(localStorage.getItem('debts')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];

// Fungsi untuk menyimpan data ke localStorage
function saveData() {
    localStorage.setItem('debts', JSON.stringify(debts));
    localStorage.setItem('payments', JSON.stringify(payments));
}

// Fungsi untuk memformat angka menjadi format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Fungsi untuk mendapatkan total hutang per anggota
function getTotalDebtByMember(member) {
    return debts
        .filter(debt => debt.debtor === member && !debt.paid)
        .reduce((total, debt) => total + parseInt(debt.amount), 0);
}

// Fungsi untuk menampilkan data di dashboard
function updateDashboard() {
    // Update total hutang aktif
    const totalDebt = debts
        .filter(debt => !debt.paid)
        .reduce((total, debt) => total + parseInt(debt.amount), 0);
    
    const totalDebtElement = document.querySelector('.total');
    if (totalDebtElement) {
        totalDebtElement.textContent = formatRupiah(totalDebt);
    }
    
    // Update jumlah transaksi
    const transactionCount = debts.length;
    const transactionCountElement = document.querySelector('.count');
    if (transactionCountElement) {
        transactionCountElement.textContent = transactionCount;
    }
    
    // Update status hutang per anggota
    const members = ['daffa', 'rizky', 'omar', 'zaky', 'rozi'];
    members.forEach(member => {
        const memberCard = document.querySelector(`.member-card[data-member="${member}"]`);
        if (memberCard) {
            const amountElement = memberCard.querySelector('.amount');
            if (amountElement) {
                const totalDebt = getTotalDebtByMember(member);
                amountElement.textContent = formatRupiah(totalDebt);
                
                // Tambahkan kelas berdasarkan jumlah hutang
                if (totalDebt > 0) {
                    amountElement.classList.add('has-debt');
                } else {
                    amountElement.classList.remove('has-debt');
                }
            }
        }
    });
}

// Fungsi untuk menampilkan daftar hutang
function displayDebts() {
    const debtListElement = document.querySelector('.debt-list');
    if (!debtListElement) return;
    
    if (debts.length === 0) {
        debtListElement.innerHTML = `
            <div class="empty-state">
                <p>Belum ada hutang yang tercatat.</p>
                <button class="btn-primary" id="add-first-debt">Tambah Hutang Pertama</button>
            </div>
        `;
        
        document.getElementById('add-first-debt')?.addEventListener('click', () => {
            document.getElementById('add-debt-btn')?.click();
        });
        return;
    }
    
    debtListElement.innerHTML = '';
    
    debts.forEach((debt, index) => {
        const debtElement = document.createElement('div');
        debtElement.className = `debt-item ${debt.paid ? 'paid' : 'unpaid'}`;
        debtElement.innerHTML = `
            <div class="debt-info">
                <h3>${debt.debtor.charAt(0).toUpperCase() + debt.debtor.slice(1)}</h3>
                <p>${debt.description || 'Tidak ada keterangan'}</p>
                <p class="debt-date">Jatuh tempo: ${debt.dueDate || 'Tidak ditentukan'}</p>
            </div>
            <div class="debt-amount">
                <p class="amount">${formatRupiah(debt.amount)}</p>
                <p class="status ${debt.paid ? 'paid' : 'unpaid'}">${debt.paid ? 'Lunas' : 'Belum Lunas'}</p>
            </div>
            <div class="debt-actions">
                <button class="btn-action mark-paid" data-index="${index}">${debt.paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'}</button>
                <button class="btn-action delete-debt" data-index="${index}">Hapus</button>
            </div>
        `;
        
        debtListElement.appendChild(debtElement);
    });
    
    // Tambahkan event listener untuk tombol aksi
    document.querySelectorAll('.mark-paid').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            toggleDebtStatus(index);
        });
    });
    
    document.querySelectorAll('.delete-debt').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteDebt(index);
        });
    });
}

// Fungsi untuk menampilkan riwayat pembayaran
function displayPayments() {
    const paymentListElement = document.querySelector('.payment-list');
    if (!paymentListElement) return;
    
    if (payments.length === 0) {
        paymentListElement.innerHTML = `
            <div class="empty-state">
                <p>Belum ada pembayaran yang tercatat.</p>
            </div>
        `;
        return;
    }
    
    paymentListElement.innerHTML = '';
    
    payments.forEach((payment, index) => {
        const paymentElement = document.createElement('div');
        paymentElement.className = 'payment-item';
        paymentElement.innerHTML = `
            <div class="payment-info">
                <h3>${payment.debtor.charAt(0).toUpperCase() + payment.debtor.slice(1)}</h3>
                <p>Metode: ${payment.method}</p>
                <p class="payment-date">Tanggal: ${payment.date}</p>
            </div>
            <div class="payment-amount">
                <p class="amount">${formatRupiah(payment.amount)}</p>
            </div>
            <div class="payment-actions">
                <button class="btn-action delete-payment" data-index="${index}">Hapus</button>
            </div>
        `;
        
        paymentListElement.appendChild(paymentElement);
    });
    
    // Tambahkan event listener untuk tombol hapus
    document.querySelectorAll('.delete-payment').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deletePayment(index);
        });
    });
}

// Fungsi untuk menambah hutang baru
function addDebt(debtData) {
    const newDebt = {
        id: Date.now(),
        debtor: debtData.debtor,
        amount: debtData.amount,
        description: debtData.description,
        dueDate: debtData.dueDate,
        date: new Date().toISOString().split('T')[0],
        paid: false
    };
    
    debts.push(newDebt);
    saveData();
    updateDashboard();
    displayDebts();
    
    // Tutup modal
    closeModal('debt-modal');
    
    // Reset form
    document.getElementById('debt-form')?.reset();
}

// Fungsi untuk menambah pembayaran baru
function addPayment(paymentData) {
    const newPayment = {
        id: Date.now(),
        debtor: paymentData.debtor,
        amount: paymentData.amount,
        date: paymentData.date,
        method: paymentData.method
    };
    
    payments.push(newPayment);
    saveData();
    displayPayments();
    
    // Tutup modal
    closeModal('payment-modal');
    
    // Reset form
    document.getElementById('payment-form')?.reset();
}

// Fungsi untuk mengubah status hutang (lunas/belum lunas)
function toggleDebtStatus(index) {
    debts[index].paid = !debts[index].paid;
    saveData();
    updateDashboard();
    displayDebts();
}

// Fungsi untuk menghapus hutang
function deleteDebt(index) {
    if (confirm('Apakah Anda yakin ingin menghapus hutang ini?')) {
        debts.splice(index, 1);
        saveData();
        updateDashboard();
        displayDebts();
    }
}

// Fungsi untuk menghapus pembayaran
function deletePayment(index) {
    if (confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
        payments.splice(index, 1);
        saveData();
        displayPayments();
    }
}

// Fungsi untuk membuka modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Fungsi untuk menutup modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi data
    updateDashboard();
    displayDebts();
    displayPayments();
    
    // Event listener untuk tombol detail anggota di dashboard
    document.querySelectorAll('.btn-detail').forEach(button => {
        button.addEventListener('click', function() {
            const member = this.closest('.member-card').getAttribute('data-member');
            window.location.href = `${member}.html`;
        });
    });
    
    // Event listener untuk tombol tambah hutang
    document.getElementById('add-debt-btn')?.addEventListener('click', function() {
        openModal('debt-modal');
    });
    
    document.getElementById('add-first-debt')?.addEventListener('click', function() {
        openModal('debt-modal');
    });
    
    // Event listener untuk tombol tambah pembayaran
    document.getElementById('add-payment-btn')?.addEventListener('click', function() {
        openModal('payment-modal');
    });
    
    // Event listener untuk form tambah hutang
    document.getElementById('debt-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const debtor = document.getElementById('debtor').value;
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const dueDate = document.getElementById('due-date').value;
        
        if (!debtor || !amount) {
            alert('Peminjam dan jumlah hutang harus diisi!');
            return;
        }
        
        addDebt({
            debtor,
            amount,
            description,
            dueDate
        });
    });
    
    // Event listener untuk form tambah pembayaran
    document.getElementById('payment-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const debtor = document.getElementById('payment-debtor').value;
        const amount = document.getElementById('payment-amount').value;
        const date = document.getElementById('payment-date').value;
        const method = document.getElementById('payment-method').value;
        
        if (!debtor || !amount || !date) {
            alert('Peminjam, jumlah pembayaran, dan tanggal harus diisi!');
            return;
        }
        
        addPayment({
            debtor,
            amount,
            date,
            method
        });
    });
    
    // Event listener untuk tombol batal
    document.getElementById('cancel-debt')?.addEventListener('click', function() {
        closeModal('debt-modal');
        document.getElementById('debt-form').reset();
    });
    
    document.getElementById('cancel-payment')?.addEventListener('click', function() {
        closeModal('payment-modal');
        document.getElementById('payment-form').reset();
    });
    
    // Event listener untuk tombol close modal
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Event listener untuk klik di luar modal
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Event listener untuk filter hutang
    document.getElementById('filter-status')?.addEventListener('change', function() {
        // Implementasi filter akan ditambahkan nanti
        console.log('Filter status:', this.value);
    });
    
    // Event listener untuk pencarian hutang
    document.getElementById('search-debt')?.addEventListener('input', function() {
        // Implementasi pencarian akan ditambahkan nanti
        console.log('Pencarian:', this.value);
    });
});