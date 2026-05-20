// アプリケーションの状態管理
let records = [];
let expenseChart = null;

// DOM要素の取得
const recordForm = document.getElementById('record-form');
const recordList = document.getElementById('record-list');
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
    initChart();
    updateUI();
    
    // 今日の日付をデフォルト値として設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
});

// レコードの保存（localStorage）
function saveRecords() {
    localStorage.setItem('budget_records', JSON.stringify(records));
}

// レコードの読み込み
function loadRecords() {
    const saved = localStorage.getItem('budget_records');
    if (saved) {
        records = JSON.parse(saved);
    }
}

// フォーム送信時の処理
recordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const record = {
        id: Date.now(),
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        amount: parseInt(document.getElementById('amount').value)
    };
    
    records.push(record);
    saveRecords();
    updateUI();
    recordForm.reset();
    
    // 日付を再度セット
    document.getElementById('date').value = record.date;
});

// レコードの削除
function deleteRecord(id) {
    records = records.filter(record => record.id !== id);
    saveRecords();
    updateUI();
}

// UIの更新（サマリー、リスト、グラフ）
function updateUI() {
    renderList();
    updateSummary();
    updateChart();
}

// サマリー（合計値）の計算と表示
function updateSummary() {
    let income = 0;
    let expense = 0;
    
    records.forEach(record => {
        if (record.type === 'income') {
            income += record.amount;
        } else {
            expense += record.amount;
        }
    });
    
    const balance = income - expense;
    
    totalIncomeEl.textContent = `¥${income.toLocaleString()}`;
    totalExpenseEl.textContent = `¥${expense.toLocaleString()}`;
    totalBalanceEl.textContent = `¥${balance.toLocaleString()}`;
}

// 履歴リストの表示
function renderList() {
    recordList.innerHTML = '';
    
    // 日付の新しい順にソート
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedRecords.forEach(record => {
        const tr = document.createElement('tr');
        tr.className = record.type === 'income' ? 'income-row' : 'expense-row';
        
        const typeSign = record.type === 'income' ? '+' : '-';
        
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${record.category}</td>
            <td>${record.description}</td>
            <td>${typeSign}¥${record.amount.toLocaleString()}</td>
            <td>
                <button class="btn-delete" onclick="deleteRecord(${record.id})">削除</button>
            </td>
        `;
        recordList.appendChild(tr);
    });
}

// グラフの初期化
function initChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#f67019', '#acc236'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// グラフの更新
function updateChart() {
    if (!expenseChart) return;
    
    // 支出のみを抽出し、カテゴリごとに集計
    const expenseData = {};
    records.filter(r => r.type === 'expense').forEach(r => {
        expenseData[r.category] = (expenseData[r.category] || 0) + r.amount;
    });
    
    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);
    
    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
}
