const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const req = indexedDB.open('budget', 1);

req.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

req.onsuccess = ({ target }) => {
    db = target.result;
};

if (navigator.onLine) {
    checkDB();
}

req.onerror = (e) => {
    console.log('Error:' + e.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');

    store.add(record);
}

function checkDB() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then(() => {
                    const transaction = db.transaction(
                        ['pending'],
                        'readwrite'
                    );
                    const store = transaction.objectStore('pending');
                    store.clear();
                });
        }
    };
}

window.addEventListener('online', checkDB);
