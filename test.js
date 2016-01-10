
    document.getElementById('set').onclick = function() {
        NetworkTables.setValue(document.getElementById('name').value);
    };
    document.getElementById('get').onclick = function() {
        document.getElementById('get').value = NetworkTables.getValue(document.getElementById('name').value);
    };