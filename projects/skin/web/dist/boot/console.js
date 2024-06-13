const textarea = document.getElementById("boot_log");
function log(...args) {
    textarea.textContent += args.join(' ') + '\n';
    textarea.scrollTop = textarea.scrollHeight;
}
window.addEventListener('error', function (e) {
    log(e.message);
});
window.addEventListener('unhandledrejection', function (e) {
    log(e.reason);
});
export { log };
