const textarea = document.getElementById("boot_log") as HTMLTextAreaElement;

function log(...args: any[]) {
    textarea.textContent += args.join(' ') + '\n';
    textarea.scrollTop = textarea.scrollHeight;
}

window.addEventListener('error', function (e) {
    log(e.message);
});

export { log };
