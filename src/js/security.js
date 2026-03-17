// Security Measures
(function() {
    // Disable context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable keyboard shortcuts for viewing source
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // Console clearing (optional, can be annoying but requested)
    // setInterval(function() {
    //     console.clear();
    // }, 1000);
    
    // Debug protection
    (function() {
        var start = new Date().getTime();
        debugger;
        var end = new Date().getTime();
        if (end - start > 100) {
            // DevTools open
            document.body.innerHTML = '';
            window.location.reload();
        }
    })();
})();
